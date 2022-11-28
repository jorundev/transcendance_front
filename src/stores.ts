import type ReconnectingWebSocket from "reconnecting-websocket";
import { derived, get, writable, type Writable } from "svelte/store";
import {
	api,
	APIStatus,
	channelMessageLimit,
	chatPageSize,
	getUsersFromUUIDs,
	type APIChannel,
	type ChannelMessagesResponse,
	type ListChannelsResponse,
	type WhoAmIResponse,
} from "./api";
import type { Channel, ChannelDictionary } from "./channels";
import type { FriendDataDictionary } from "./friends";
import type { Lobby } from "./api";
import type { NotificationDataDictionary } from "./notifications";
import type { LoggedUser, UserDictionary } from "./users";
import { LobbyPlayerReadyState, type LobbyDictionary } from "./lobbies";
import { PongClient } from "./pong/PongClient";
import { PlayerRole } from "./pong/Pong";

export const stLoggedUser: Writable<LoggedUser | null> = writable(null);
export const stServerDown: Writable<boolean> = writable(false);
export const stUsers: Writable<UserDictionary> = writable({});
export const stWebsocket: Writable<ReconnectingWebSocket | null> =
	writable(null);
export const websocketConnected: Writable<boolean> = writable(false);
export const stChannels: Writable<ChannelDictionary> = writable({});
export const stNotifications: Writable<NotificationDataDictionary> = writable(
	{}
);
export const stHasNotifications = derived(
	stNotifications,
	($stNotifications) => Object.entries($stNotifications).length > 0
);
export const stFriends: Writable<FriendDataDictionary> = writable({});
export const stLobby: Writable<Lobby> = writable(null);
export const stLobbies: Writable<LobbyDictionary> = writable({});
export const stSidebarSelected: Writable<string | null> = writable(null);
export const stToast: Writable<string | null> = writable(null);
export const stPongClient: Writable<PongClient | null> = writable(null);
export const stWebsocketUUID: Writable<string | null> = writable(null);
export const stGameSettings: Writable<{
	background: "red" | "blue" | "green",
	// player1color: 
}> = writable({
	background: "red"
});

/* Integrity checks */
stLoggedUser.subscribe((loggedUser) => {
	if (loggedUser === undefined) {
		console.error("The store responsible for storing information about the logged user has been set to undefined. This should not have happened. You are now in hell and nothing is expected to work normally. Good luck.")
	}
});
stServerDown.subscribe((serverDown) => {
	if (serverDown === undefined) {
		console.error("The store responsible for storing information about wether or not the server is reachable has been set to undefined. This should not have happened. You are now in hell and nothing is expected to work normally. Good luck.")
	}
});
stUsers.subscribe((users) => {
	if (users === undefined) {
		console.error("The store responsible for storing information about users has been set to undefined. This should not have happened. You are now in hell and nothing is expected to work normally. Good luck.")
	}
});
stWebsocket.subscribe((ws) => {
	if (ws === undefined) {
		console.error("The store responsible for storing information about the websocket has been set to undefined. This should not have happened. You are now in hell and nothing is expected to work normally. Good luck.")
	}
});
stChannels.subscribe((channels) => {
	if (channels === undefined) {
		console.error("The store responsible for storing information about the channels has been set to undefined. This should not have happened. You are now in hell and nothing is expected to work normally. Good luck.")
	}
});
stNotifications.subscribe((notifications) => {
	if (notifications === undefined) {
		console.error("The store responsible for storing information about notifications has been set to undefined. This should not have happened. You are now in hell and nothing is expected to work normally. Good luck.")
	}
});
stFriends.subscribe((friends) => {
	if (friends === undefined) {
		console.error("The store responsible for storing information about friends has been set to undefined. This should not have happened. You are now in hell and nothing is expected to work normally. Good luck.")
	}
});
stLobby.subscribe((lobby) => {
	if (lobby === undefined) {
		console.error("The store responsible for storing information about the lobby you are in has been set to undefined. This should not have happened. You are now in hell and nothing is expected to work normally. Good luck.")
	}
});
stLobbies.subscribe((lobbies) => {
	if (lobbies === undefined) {
		console.error("The store responsible for storing information about public lobbies has been set to undefined. This should not have happened. You are now in hell and nothing is expected to work normally. Good luck.")
	}
});

stLobby.subscribe((lobby) => {
	if (!lobby
			|| lobby.players_status[0] !== LobbyPlayerReadyState.Ready
			|| lobby.players_status[1] !== LobbyPlayerReadyState.Ready) {
		stPongClient.set(null);
		return;
	}
	if (!get(stPongClient)) {
		let role: PlayerRole;
		const loggedUserUUID = get(stLoggedUser)?.uuid;
		if (lobby.spectators.includes(loggedUserUUID)) {
			role = PlayerRole.SPECTATOR;
		} else if (lobby.players[0] === loggedUserUUID) {
			role = PlayerRole.PLAYER1;
		} else if (lobby.players[1] === loggedUserUUID) {
			role = PlayerRole.PLAYER2;
		} else {
			stToast.set("Something wrong happened with the lobby");
			return;
		}
		stPongClient.set(new PongClient(role, get(stWebsocket)));
	}
});

let toastTimeout: ReturnType<typeof setTimeout> = null;
stToast.subscribe((toast) => {
	clearTimeout(toastTimeout);
	if (toast !== null) {
		toastTimeout = setTimeout(() => stToast.set(null), 5000);
	} else {
		toastTimeout = null;
	}
});

export async function tryToLog() {
	let response: WhoAmIResponse | APIStatus;
	response = await api.whoami();

	if (response === null) {
		return;
	}
	if (response == APIStatus.NoResponse || response?.statusCode === 502) {
		stServerDown.set(true);
		return;
	}

	stLoggedUser.set({
		username: response.username,
		uuid: response.uuid,
		id: response.identifier,
		avatar: response.avatar,
		tfa: response.twofactor,
	});

	stServerDown.set(false);

	await api.ws.connect();
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
	let page = channel.message_count / chatPageSize;
	if (page != Math.floor(page)) {
		page = Math.floor(page) + 1;
	}
	return page;
}

async function channelFromAPIChannel(
	channel: APIChannel,
	joined: boolean
): Promise<Channel> {
	const usersPromise = getUsersFromUUIDs(channel);

	let banned_users = [];
	let muted_users = [];

	if (!channel.moderators) {
		channel.moderators = [];
	}

	if (
		channel.moderators.includes(get(stLoggedUser)?.uuid) ||
		channel.administrator === get(stLoggedUser)?.uuid
	) {
		const blacklist = await api.getBlacklist(channel.uuid);
		if (blacklist !== null && blacklist !== APIStatus.NoResponse) {
			for (const listInfo of blacklist.banned) {
				const info = await api.getUserData(listInfo.user);
				if (info !== null && info !== APIStatus.NoResponse) {
					banned_users.push({
						expiration: new Date(listInfo.expiration),
						user: {
							uuid: listInfo.user,
							name: info.username,
							id: parseInt(info.identifier),
							avatar: info.avatar,
							is_moderator: false,
							is_administrator: false,
						},
					});
				}
			}
			for (const listInfo of blacklist.muted) {
				const info = await api.getUserData(listInfo.user);
				if (info !== null && info !== APIStatus.NoResponse) {
					muted_users.push({
						expiration: new Date(listInfo.expiration),
						user: {
							uuid: listInfo.user,
							name: info.username,
							id: parseInt(info.identifier),
							avatar: info.avatar,
							is_moderator: false,
							is_administrator: false,
						},
					});
				}
			}
		}
	}

	const users = await usersPromise;
	if (usersPromise)
		return {
			has_password: channel.password,
			uuid: channel.uuid,
			id: channel.identifier,
			name: channel.name,
			avatar: channel.avatar,
			type: channel.type,
			last_message: null,
			loaded_messages: [],
			joined,
			users,
			last_loaded_page: lastPage(channel),
			moderators: channel.moderators,
			administrator: channel.administrator,
			banned_users,
			muted_users,
		};
}

export async function initFriends() {
	const relations = await api.getRelations();
	if (relations !== null && relations !== APIStatus.NoResponse) {
		const dictionary: FriendDataDictionary = {};
		for (const relation of relations.friendship) {
			const user = await api.getUserData(relation.uuid);
			if (user === null || user === APIStatus.NoResponse) {
				continue;
			}
			dictionary[relation.uuid] = {
				uuid: relation.uuid,
				name: user.username,
				id: user.identifier,
				avatar: user.avatar,
				status: user.is_online,
				friendship: relation.friendship,
			};
		}

		stFriends.set(dictionary);
	}
}

export async function initLobbies() {
	const lobbies = await api.getLobbies();

	const dictionary = {};

	for (const lobby of lobbies) {
		dictionary[lobby.uuid] = lobby;
	}

	stLobbies.set(dictionary);
}

export async function initChannels() {
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
				uuid: message.uuid,
				value: message.message,
				sender: message.user,
				date: Date.parse(message.creation_date),
			});
			channels[channel.uuid].loaded_messages = channels[
				channel.uuid
			].loaded_messages.slice(-channelMessageLimit);
		}
	}
	stChannels.set(channels);
}

export async function initNotifications() {
	const notifs = await api.getNotifications();
	if (notifs === null || notifs === APIStatus.NoResponse) {
		return;
	}
	const dictionary: NotificationDataDictionary = {};
	for (const notif of notifs.data) {
		if (notif.read) {
			break;
		}

		// Failsafe
		// if (!!(notif.type === NotificationType.GameInvite && (notif as any).lobby)) {
		// console.log(notif);
		// 	api.readNotification(notif.uuid);
		// 	continue;
		// }

		dictionary[notif.uuid] = notif;
	}
	stNotifications.set(dictionary);
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
	if (!isLogged()) {
		await tryToLog();
	}
	return isLogged();
}

export function isLogged(): boolean {
	return get(stLoggedUser) != null;
}
