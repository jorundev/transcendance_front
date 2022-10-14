import { get, writable, type Writable } from "svelte/store";
import {
	api,
	APIStatus,
	getUsersFromUUIDs,
	type APIChannel,
	type ChannelMessagesResponse,
	type ListChannelsResponse,
	type WhoAmIResponse,
} from "./api";
import type { Channel, ChannelDictionary } from "./channels";
import type { LoggedUser, UserDictionary } from "./users";

export const stLoggedUser: Writable<LoggedUser | null> = writable(null);
export const stServerDown: Writable<boolean> = writable(false);
export const stUsers: Writable<UserDictionary> = writable({});
export const stWebsocket: Writable<WebSocket | null> = writable(null);
export const stChannels: Writable<ChannelDictionary> = writable({});

export async function tryToLog() {
	let response: WhoAmIResponse | APIStatus;
	for (;;) {
		response = await api.whoami();
		if (response == null) {
			return;
		}
		if (response == APIStatus.NoResponse || response?.statusCode === 502) {
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
	if (users)
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

export async function initPrivChannel(channelUUID: string) {
	const channelData = await api.getChannelData(channelUUID);
	if (channelData === APIStatus.NoResponse) {
		return;
	}

	console.log(channelData);
	const channel: Channel = await channelFromAPIChannel(channelData, false);
	channel.has_password = true;

	stChannels.update((channels) => {
		channels[channelUUID] = channel;
		return channels;
	});
}

export async function tryLoggingIn(): Promise<boolean> {
	await tryToLog();
	return isLogged();
}

export async function isLogged(): Promise<boolean> {
	return get(stLoggedUser) != null;
}
