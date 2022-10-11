import { get, writable, type Writable } from "svelte/store";
import {
	api,
	APIStatus,
	getUsersFromUUIDs,
	type APIChannel,
	type ChannelMessagesResponse,
	type ListChannelsResponse,
} from "./api";

export interface LoggedUser {
	username: string;
	id: number;
	avatar: string | null;
	uuid: string;
}

export interface User {
	username: string;
	identifier: string;
	avatar: string | null;
}

export interface UserDictionary {
	[key: string]: User;
}

export interface ChannelDictionary {
	[key: string]: Channel;
}

export enum ChannelType {
	Public,
	Private,
	Direct,
}

export interface ChannelUser {
	uuid: string;
	name: string;
	id: number;
	avatar: string;
	is_moderator: boolean;
	is_administrator: boolean;
}

export interface Channel {
	type: ChannelType;
	uuid: string;
	id: number;
	name: string;
	last_message: {
		sender: string | null;
		value: string;
		date: number;
		id: number;
	} | null;
	loaded_messages: Array<{
		sender: string;
		value: string;
		date: number;
		id: number;
	}>;
	users: Array<ChannelUser>;
	joined: boolean;
	has_password: boolean;
	moderators: Array<string>;
	administrator: string;
	last_loaded_page: number;
	reload?: boolean;
}

export interface ChatMessage {
	sender: string;
	value: string;
	date: string;
	username: string;
	confirmed: boolean;
	id: number;
}

export const stLoggedUser: Writable<LoggedUser | null> = writable(null);
export const stServerDown: Writable<boolean> = writable(false);
export const stUsers: Writable<UserDictionary> = writable({});
export const stWebsocket: Writable<WebSocket | null> = writable(null);
export const stChannels: Writable<ChannelDictionary> = writable({});

export async function tryToLog() {
	for (;;) {
		const response = await api.whoami();
		if (
			response == APIStatus.NoResponse ||
			response == null ||
			response.statusCode === 502
		) {
			stServerDown.set(true);
			await new Promise((resolve) => setTimeout(resolve, 5000));
			continue;
		}
		break;
	}

	stLoggedUser.set({
		username: response.username,
		uuid: response.uuid,
		id: response.identifier,
		avatar: response.avatar,
	});

	stServerDown.set(false);
	api.ws.connect();
	await initChannelsNew();
}

/* Removes duplicates channels (that are public AND joined) */
function getChannelsData(
	joined: ListChannelsResponse,
	publics: ListChannelsResponse
): Array<APIChannel> {
	const data: Array<APIChannel> = joined.data;
	for (const publicData of publics.data) {
		if (!data.map((chan) => chan.uuid).includes(publicData.uuid)) {
			data.push(publicData);
		}
	}
	return data;
}

export function lastPage(channel: APIChannel): number {
	let page = channel.message_count / 10;
	if (page != Math.floor(page)) {
		page = Math.floor(page) + 1;
	}
	return page;
}

async function channelFromAPIChannel(
	channel: APIChannel,
	joined: boolean
): Promise<Channel> {
	const users = await getUsersFromUUIDs(channel);
	return {
		has_password: channel.password,
		uuid: channel.uuid,
		id: channel.identifier,
		name: channel.name,
		type: channel.type,
		last_message: null,
		loaded_messages: [],
		joined,
		users,
		last_loaded_page: lastPage(channel),
		moderators: channel.moderators,
		administrator: channel.administrator,
	};
}

async function initChannelsNew() {
	const promises = {
		publicChannels: api.listChannels(),
		joinedChannels: api.getJoinedChannels(),
	};
	const responses_raw = {
		publicChannels: await promises.publicChannels,
		joinedChannels: await promises.joinedChannels,
	};
	for (const property in responses_raw) {
		if (responses_raw[property] === APIStatus.NoResponse) {
			return;
		}
	}

	// I miss shadowing
	const responses = responses_raw as {
		publicChannels: ListChannelsResponse;
		joinedChannels: ListChannelsResponse;
	};

	const visibleChannels = getChannelsData(
		responses.publicChannels,
		responses.joinedChannels
	);

	const messagePromises: Array<Promise<APIStatus | ChannelMessagesResponse>> =
		[];

	// Only load last messages from joined channels
	for (const channel of responses.joinedChannels.data) {
		messagePromises.push(
			api.getChannelMessages(channel.uuid, lastPage(channel))
		);
	}
	const messagesPromises = Promise.all(messagePromises);
	const channels: ChannelDictionary = {};
	for (const visibleChannel of visibleChannels) {
		const joined = responses.joinedChannels.data
			.map((chan) => chan.uuid)
			.includes(visibleChannel.uuid);

		const channel = await channelFromAPIChannel(visibleChannel, joined);
		channels[channel.uuid] = channel;
	}
	const messages = await messagesPromises;
	for (const [i, messageRaw] of messages.entries()) {
		if (messageRaw == APIStatus.NoResponse) {
			continue;
		}
		for (const message of messageRaw?.data) {
			const channel = responses.joinedChannels.data[i];
			channels[channel.uuid].loaded_messages.push({
				id: message.id,
				value: message.message,
				sender: message.user,
				date: Date.parse(message.creation_date),
			});
		}
	}

	stChannels.set(channels);
}

/*
async function initChannels() {
	const joinedChannelsPromise = api.getJoinedChannels();
	const channelsResponse = await api.listChannels();
	if (channelsResponse == APIStatus.NoResponse) {
		return;
	}
	const joinedChannels = await joinedChannelsPromise;
	if (joinedChannels == APIStatus.NoResponse) {
		return;
	}
	const channels: ChannelDictionary = {};
	const messages_promises = [];
	for (const channel of channelsResponse.data) {
		if (!channel.users.includes(get(stLoggedUser).uuid)) {
			continue;
		}
		let page = channel.message_count / 10;
		if (page != Math.floor(page)) {
			page = Math.floor(page) + 1;
		}
		messages_promises.push(api.getChannelMessages(channel.uuid, page));
	}
	const messages_promises_all = Promise.all(messages_promises);
	let i = 0;
	for (const channel of channelsResponse.data) {
		const users = await getUsersFromUUIDs(channel);
		// TODO: page is already calculated before ...
		let page = channel.message_count / 10;
		if (page != Math.floor(page)) {
			page = Math.floor(page) + 1;
		}

		channels[channel.uuid] = {
			has_password: channel.password,
			uuid: channel.uuid,
			id: channel.identifier,
			name: channel.name,
			type: channel.type,
			last_message: null,
			loaded_messages: [],
			joined:
				joinedChannels.data.find((e) => e.uuid == channel.uuid) !=
				undefined,
			users,
			last_loaded_page: page,
			moderators: channel.moderators,
			administrator: channel.administrator,
		};
		const messages = await messages_promises_all;
		if (messages[i] == APIStatus.NoResponse) {
			continue;
		}
		if (messages[i]?.data) {
			for (const message of messages[i].data) {
				channels[channel.uuid].loaded_messages.push({
					id: message.id,
					value: message.message,
					sender: message.user,
					date: Date.parse(message.creation_date),
				});
			}
		}
		i += 1;
	}
	stChannels.set(channels);
}*/

export async function tryLoggingIn(): Promise<boolean> {
	await tryToLog();
	return isLogged();
}

export async function isLogged(): Promise<boolean> {
	return get(stLoggedUser) != null;
}
