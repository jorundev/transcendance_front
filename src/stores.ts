import { get, writable, type Writable } from "svelte/store";
import { api, APIStatus, getUsersFromUUIDs } from "./api";

export interface LoggedUser {
	username: string;
	id: number;
	profile_picture: string | null;
	uuid: string;
}

export interface User {
	username: string;
	identifier: string;
	profile_picture: string | null;
}

export interface UserDictionary {
	[key: string]: User;
}

export interface ChannelDictionary {
	[key: string]: Channel;
}

export enum ChannelType {
	Single,
	Group,
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
	users: Array<{
		uuid: string;
		name: string;
		id: number;
		profile_picture: string;
		is_moderator: boolean;
	}>;
	joined: boolean;
	has_password: boolean;
	last_loaded_page: number;
}

export const stLoggedUser: Writable<LoggedUser | null> = writable(null);
export const stServerDown: Writable<boolean> = writable(false);
export const stUsers: Writable<UserDictionary> = writable({});
export const stWebsocket: Writable<WebSocket | null> = writable(null);
export const stChannels: Writable<ChannelDictionary> = writable({});

export async function tryToLog() {
	const response = await api.whoami();
	if (response == APIStatus.NoResponse) {
		stServerDown.set(true);
		return;
	}

	if (response == null) {
		return;
	}

	stLoggedUser.set({
		username: response.username,
		uuid: response.uuid,
		id: response.identifier,
		profile_picture: response.profile_picture,
	});

	stServerDown.set(false);
	api.ws.connect();
	await initChannels();
}

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
			type: ChannelType.Group,
			last_message: null,
			loaded_messages: [],
			joined:
				joinedChannels.data.find((e) => e.uuid == channel.uuid) !=
				undefined,
			users,
			last_loaded_page: page,
		};
		const messages = await messages_promises_all;
		if (messages[i] == APIStatus.NoResponse) {
			continue;
		}
		for (const message of messages[i].data) {
			channels[channel.uuid].loaded_messages.push({
				id: message.id,
				value: message.message,
				sender: message.user,
				date: Date.parse(message.creation_date),
			});
		}
		i += 1;
	}
	stChannels.set(channels);
}

export async function tryLoggingIn(): Promise<boolean> {
	await tryToLog();
	return isLogged();
}

export async function isLogged(): Promise<boolean> {
	return get(stLoggedUser) != null;
}
