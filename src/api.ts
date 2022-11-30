import { Mutex } from "async-mutex";
import ReconnectingWebSocket from "reconnecting-websocket";
import { push, replace } from "svelte-spa-router";
import { get } from "svelte/store";
import { ChannelType } from "./channels";
import { ConnectionStatus } from "./friends";
import { LobbyPlayerReadyState } from "./lobbies";
import type { GameHistory } from "./lobbies";
import {
	newNotification,
	type NotificationData,
	NotificationType,
} from "./notifications";
import {
	initChannels,
	initFriends,
	initLobbies,
	initNotifications,
	lastPage,
	stChannels,
	stFriends,
	stGameSettings,
	stLobbies,
	stLobby,
	stLoggedUser,
	stNotifications,
	stPongClient,
	stServerDown,
	stToast,
	stUsers,
	stWebsocket,
	stWebsocketUUID,
	tryToLog,
	websocketConnected,
} from "./stores";
import type { User } from "./users";
import {
	BlockDirection,
	ChatAction,
	GameAction,
	UserAction,
	WsNamespace,
	type WsChat,
	type WsChatAvatar,
	type WsChatBan,
	type WsChatDelete,
	type WsChatDemote,
	type WsChatJoin,
	type WsChatLeave,
	type WsChatMute,
	type WsChatPromote,
	type WsChatRemove,
	type WsChatSend,
	type WsChatUnban,
	type WsChatUnmute,
	type WsGame,
	type WsGameDecline,
	type WsGameDisband,
	type WsGameEnd,
	type WsGameInvite,
	type WsGameJoin,
	type WsGameLeave,
	type WsGameMatch,
	type WsGameReady,
	type WsGameSpectate,
	type WsGameStart,
	type WsMeta,
	type WsPong,
	type WsUser,
	type WsUserAvatar,
	type WsUserBlock,
	type WsUserNotification,
	type WsUserNotificationRead,
	type WsUserStatus,
	type WsUserUnblock,
	type WsUserUnfriend,
} from "./websocket/types";

export enum APIStatus {
	NoResponse,
}

async function fetchPOST(
	url: string,
	object: any,
	type = "application/json"
): Promise<Response> {
	let headers = {};
	if (type.length !== 0) {
		headers["Content-Type"] = type;
	}
	return await fetch(url, {
		method: "POST",
		headers,
		body: type === "application/json" ? JSON.stringify(object) : object,
	});
}

async function fetchPATCH(
	url: string,
	object: any,
	type = "application/json"
): Promise<Response> {
	let headers = {};
	if (type.length !== 0) {
		headers["Content-Type"] = type;
	}
	return await fetch(url, {
		method: "PATCH",
		headers,
		body: type === "application/json" ? JSON.stringify(object) : object,
	});
}

async function fetchDELETE(
	url: string,
	object: any,
	type = "application/json"
): Promise<Response> {
	let headers = {};
	if (type.length !== 0) {
		headers["Content-Type"] = type;
	}
	return await fetch(url, {
		method: "DELETE",
		headers,
		body: type === "application/json" ? JSON.stringify(object) : object,
	});
}

async function fetchPUT(
	url: string,
	object: any,
	type = "application/json"
): Promise<Response> {
	let headers = {};
	if (type.length !== 0) {
		headers["Content-Type"] = type;
	}
	return await fetch(url, {
		method: "PUT",
		headers,
		body: type === "application/json" ? JSON.stringify(object) : object,
	});
}

async function fetchGET(url: string): Promise<Response> {
	return await fetch(url, {
		method: "GET",
	});
}

/* Cache to prevent refresh token spamming */
/*
	To gain some time, some requests are made in bulk (using Promise.all)
	This would pose a problem if the access token expired, as the refresh token
	request was made multiple times in a very small time frame
	The token would get refreshed correcly, but the spam would throw an exception and
	bring the user to the login page.
	Using this cache, we put a hard limit between each refresh
*/
interface RefreshTokenCache {
	// Last promise. This is the actual cached value;
	last_promise?: Promise<Response>;

	// Time between each actual refresh requests
	refresh_tolerance: number;
}

const refresh_token_cache: RefreshTokenCache = {
	refresh_tolerance: 3,
};

async function refreshToken(): Promise<boolean> {
	let promise: Promise<Response>;
	if (refresh_token_cache.last_promise != undefined) {
		promise = refresh_token_cache.last_promise;
		console.log("Loaded refresh request from cache");
	} else {
		refresh_token_cache.last_promise = fetchPOST("/api/auth/refresh", {})
			.then((res) => {
				return res;
			})
			.catch((err) => {
				console.error("Critical error: ", err);
				return null;
			});
		promise = refresh_token_cache.last_promise;
		setTimeout(() => {
			refresh_token_cache.last_promise = undefined;
			console.log("Cleared refresh token cache");
		}, refresh_token_cache.refresh_tolerance * 1000);
	}

	const response = await promise;

	return (
		response != null && (response.status == 201 || response.status == 200)
	);
}

async function makeRequest<T>(
	url: string,
	method: string,
	object?: any,
	type = "application/json"
): Promise<T | APIStatus.NoResponse | null> {
	let promise: Promise<Response>;

	for (; ;) {
		switch (method) {
			case "GET":
				promise = fetchGET(url);
				break;
			case "POST":
				promise = fetchPOST(
					url,
					object !== undefined ? object : {},
					type
				);
				break;
			case "DELETE":
				promise = fetchDELETE(
					url,
					object !== undefined ? object : {},
					type
				);
				break;
			case "PUT":
				promise = fetchPUT(
					url,
					object !== undefined ? object : {},
					type
				);
				break;
			case "PATCH":
				promise = fetchPATCH(
					url,
					object !== undefined ? object : {},
					type
				);
				break;
		}

		const response: Response | null = await promise
			.then((res) => {
				return res;
			})
			.catch((err) => {
				console.error("Critical error:", err);
				stLoggedUser.set(null);
				push("/login");
				return null;
			});

		if (response == null) {
			return APIStatus.NoResponse;
		}

		switch (response.status) {
			case 500:
				stToast.set("Error 500: Something wrong happened with the server");
				return null
			case 502:
				console.error("A terrible error happened: ", response);
				stServerDown.set(true);
				return APIStatus.NoResponse;
			case 200:
			case 201:
				try {
					return {
						statusCode: response.status,
						message: response.statusText,
						...JSON.parse(await response.text()),
					};
				} catch (e) {
					return {
						statusCode: response.status,
						message: response.statusText,
					} as any;
				}
			case 401:
				console.log(
					"Unauthorized. Attempting to refresh the access token"
				);
				if (await refreshToken()) {
					console.log("Successfully refreshed access token");
					continue;
				} else {
					console.log(
						"Refresh token is absent or has expired. Login required"
					);
					stServerDown.set(false);
					await api.logout();
					return null;
				}
			default:
				try {
					return await response.json();
				} catch (e) {
					// return null;
					return {
						statusCode: response.status,
						message: response.statusText,
					} as any;
				}
		}
	}
}

export interface APIResponse {
	statusCode: number;
	message: string;
}

export interface WhoAmIResponse extends APIResponse {
	uuid: string;
	identifier: number;
	username: string;
	email: string;
	avatar: string | null;
	twofactor: boolean;
	xp: number;
}

export interface ChangeAvatarResponse extends APIResponse {
	avatar: string;
}

export interface PrivateChannelData extends APIResponse {
	uuid: string;
	identifier: number;
	name: string;
	avatar: string | null;
}

export interface APIUser extends WhoAmIResponse {
	is_online: ConnectionStatus;
}

export interface TFAInitResponse extends APIResponse {
	image: string;
	text: string;
}

export interface ListChannelsResponse extends APIResponse {
	data: Array<APIChannel>;
	count: number;
	total: number;
	page: number;
	page_count: number;
}

export interface APIBlacklist extends APIResponse {
	banned: Array<{ user: string; expiration: string }>;
	muted: Array<{ user: string; expiration: string }>;
}

export interface APIChannel {
	type: ChannelType;
	uuid: string;
	identifier: number;
	name: string;
	password: boolean;
	message_count: number;
	users: Array<string>;
	moderators: Array<string>;
	administrator: string;
	avatar: string;
}

export interface CreateChannelResponse extends APIResponse {
	uuid: string;
}

export enum ChannelVisibility {
	Public = 0,
	Private = 1,
	DirectMessage = 2,
}

export interface ChannelMessagesResponse extends APIResponse {
	data: Array<{
		uuid: string;
		creation_date: string;
		message: string;
		user: string;
	}>;
}

export interface CreateDirectMessageResponse extends APIResponse {
	uuid: string;
}

interface WebsocketMessage {
	namespace: WsNamespace;
}

export enum UsersFriendship {
	False = 0,
	True = 1,
	Pending = 2,
	Requested = 3,
}

export interface SessionsResponse extends APIResponse {
	data: Array<Session>;
}

export interface RelationsResponseItem {
	uuid: string;
	friendship: UsersFriendship;
}

export interface RelationsResponse extends APIResponse {
	friendship: Array<RelationsResponseItem>;
}

export interface SendFriendRequestResponse extends APIResponse {
	friendship: UsersFriendship;
}

export interface GetNotificationsResponse extends APIResponse {
	data: Array<NotificationData>;
	count: number;
	total: number;
	page: number;
	page_count: number;
}

export interface Session {
	uuid: string;
	platform: string;
	creation_date: string;
	active: boolean;
	current: boolean;
}

export interface Lobby {
	uuid: string;
	in_game: boolean;
	players: [string, string];
	players_status: [LobbyPlayerReadyState, LobbyPlayerReadyState];
	spectators: Array<string>;
	max_spectators: number;
}

export async function getUsersFromUUIDs(channel: APIChannel): Promise<
	Array<{
		name: string;
		id: number;
		avatar: string;
		uuid: string;
		is_moderator: boolean;
		is_administrator: boolean;
	}>
> {
	const users = [];
	const users_promises = [];
	if (channel.users === undefined) {
		return users;
	}
	for (const user of channel.users) {
		users_promises.push(api.getUserData(user));
	}
	let i = 0;
	const values = await Promise.all(users_promises);
	for (const data of values) {
		if (data == APIStatus.NoResponse) {
			continue;
		}
		if (channel.moderators === undefined) {
			channel.moderators = [];
		}
		users.push({
			name: data.username,
			id: data.identifier,
			avatar: data.avatar,
			uuid: channel.users[i],
			is_moderator: channel.moderators.includes(channel.users[i]),
			is_administrator: channel.administrator === channel.users[i],
		});
		i += 1;
	}
	return users;
}

// Max number of messages displayed per channel
export const channelMessageLimit = 250;

interface UserCache {
	[key: string]: Promise<APIStatus | User>;
}
/* User requests are usually made at the same time */
/* To avoid useless API requests, we store the promises in a cache */
/* That way, every request for the same user awaits for the same fetch */
const userCache: UserCache = {};

export async function loadNextPage(uuid: string, n?: number) {
	if (n == undefined) n = 1;
	const channel = get(stChannels)[uuid];
	if (channel === undefined || channel.last_loaded_page <= 1) {
		return;
	}

	// For performance reasons, we limit the numbers of messages
	if (channel.loaded_messages?.length >= channelMessageLimit) {
		return;
	}

	const promises = [];
	let i = channel.last_loaded_page - 1;

	while (i >= 1 && i >= channel.last_loaded_page - n - 1) {
		promises.push(api.getChannelMessages(uuid, i));
		i -= 1;
	}

	const messagesList = await Promise.all(promises);

	for (const messages of messagesList) {
		if (messages == APIStatus.NoResponse) {
			return;
		}
		let count = 0;
		for (const message of messages.data) {
			/* Avoid duplicates */
			if (
				!channel.loaded_messages
					.map((msg) => msg.uuid)
					.includes(message.uuid)
			) {
				channel.loaded_messages.push({
					uuid: message.uuid,
					value: message.message,
					sender: message.user,
					date: Date.parse(message.creation_date),
				});
				count += 1;
				if (count >= channelMessageLimit) {
					break;
				}
			}
		}
	}

	channel.loaded_messages.sort((a, b) => {
		return a.date - b.date;
	});

	if (channel.loaded_messages.length > channelMessageLimit) {
		channel.loaded_messages = channel.loaded_messages.slice(
			channel.loaded_messages.length - channelMessageLimit,
			channel.loaded_messages.length
		);
	}

	channel.last_loaded_page = i + 1;

	stChannels.update((channels) => {
		channels[uuid] = channel;
		return channels;
	});
}

export const chatPageSize = 50;
const wsChatMessageLock = new Mutex();
async function wsChatMessage(data: WsChat) {
	const release = await wsChatMessageLock.acquire();
	// If channel is not loaded yet then load it
	if (get(stChannels)[data.channel] == undefined) {
		const channel_data = await api.getChannelData(data.channel);
		if (channel_data == APIStatus.NoResponse) {
			release();
			return;
		}
		const users = await getUsersFromUUIDs(channel_data);

		let page = channel_data.message_count / chatPageSize;
		if (page != Math.floor(page)) {
			page = Math.floor(page) + 1;
		}

		if (channel_data.moderators === undefined) {
			channel_data.moderators = [];
		}

		const isModerator =
			channel_data.moderators.includes(get(stLoggedUser).uuid) ||
			channel_data.administrator === get(stLoggedUser).uuid;

		let banned_users = [];
		let muted_users = [];

		if (isModerator) {
			const blacklist = await api.getBlacklist(data.channel);
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

		stChannels.update((channels) => {
			channels[data.channel] = {
				type: channel_data.type,
				id: channel_data.identifier,
				uuid: data.channel,
				name: channel_data.name,
				last_message: null,
				loaded_messages: [],
				joined: channel_data.type === ChannelType.Direct,
				has_password: channel_data.password,
				users: users,
				last_loaded_page: page,
				moderators: channel_data.moderators,
				administrator: channel_data.administrator,
				banned_users,
				muted_users,
				avatar: channel_data.avatar,
			};
			return channels;
		});
	}
	release();

	switch (data.action) {
		case ChatAction.Send:
			await wsChatSend(data as WsChatSend);
			break;
		case ChatAction.Join:
			await wsChatJoin(data as WsChatJoin);
			break;
		case ChatAction.Create:
			// This has already been done
			break;
		case ChatAction.Delete:
			await wsChatDelete(data as WsChatDelete);
			break;
		case ChatAction.Leave:
			await wsChatLeave(data as WsChatLeave);
			break;
		case ChatAction.Remove:
			await wsChatLeave(data as WsChatLeave);
			await wsChatRemove(data as WsChatRemove);
			break;
		case ChatAction.Promote:
			await wsChatPromote(data as WsChatPromote);
			break;
		case ChatAction.Demote:
			await wsChatDemote(data as WsChatDemote);
			break;
		case ChatAction.Ban:
			await wsChatLeave(data as WsChatLeave);
			await wsChatBan(data as WsChatBan);
			break;
		case ChatAction.Unban:
			await wsChatUnban(data as WsChatUnban);
			break;
		case ChatAction.Mute:
			await wsChatMute(data as WsChatMute);
			break;
		case ChatAction.Unmute:
			await wsChatUnmute(data as WsChatUnmute);
			break;
		case ChatAction.Avatar:
			await wsChatAvatar(data as WsChatAvatar);
			break;
	}
}

async function wsChatPromote(data: WsChatPromote) {
	let banned_users = [];
	let muted_users = [];
	if (data.user === get(stLoggedUser).uuid) {
		const blacklist = await api.getBlacklist(data.channel);
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
	stChannels.update((channels) => {
		const user = channels[data.channel].users.find(
			(usr) => usr.uuid == data.user
		);
		if (user !== undefined) {
			user.is_moderator = true;
		}
		channels[data.channel].banned_users = banned_users;
		channels[data.channel].muted_users = muted_users;
		if (!channels[data.channel].moderators.includes(data.user)) {
			channels[data.channel].moderators.push(data.user);
		}
		return channels;
	});
}

async function wsChatDemote(data: WsChatDemote) {
	stChannels.update((channels) => {
		channels[data.channel].users.find(
			(usr) => usr.uuid == data.user
		).is_moderator = false;
		if (data.user === get(stLoggedUser).uuid) {
			channels[data.channel].banned_users = [];
			channels[data.channel].muted_users = [];
		}
		channels[data.channel].moderators = channels[
			data.channel
		].moderators.filter((usr) => usr !== data.user);
		return channels;
	});
}

async function wsChatSend(data: WsChatSend) {
	stChannels.update((channels) => {
		channels[data.channel].loaded_messages.push({
			sender: data.user,
			value: data.message.text,
			uuid: data.message.uuid,
			date: Date.parse(data.message.time),
		});
		const channel = channels[data.channel];
		if (channel.loaded_messages.length > channelMessageLimit) {
			channels[data.channel].loaded_messages =
				channel.loaded_messages.slice(-channelMessageLimit);
		}
		return channels;
	});
}

async function wsChatDelete(data: WsChatDelete) {
	stChannels.update((channels) => {
		channels[data.channel].reload = true;
		const loaded_messages_copy = [
			...channels[data.channel].loaded_messages,
		].reverse();
		for (const message of loaded_messages_copy) {
			if (message.uuid == data.uuid) {
				message.value = null;
				break;
			}
		}
		return channels;
	});
}

async function wsChatJoin(data: WsChatJoin) {
	const loggedUser = get(stLoggedUser);
	const user = await api.getUserData(data.user);
	if (user === null || user == APIStatus.NoResponse) {
		return;
	}

	let addendum: {
		uuid: string;
		creation_date: string;
		message: string;
		user: string;
	}[] = undefined;
	if (data.user == loggedUser.uuid) {
		if (get(stChannels)[data.channel].loaded_messages.length == 0) {
			const apiChannel = await api.getChannelData(data.channel);
			if (apiChannel == APIStatus.NoResponse) {
				return;
			}
			const message = await api.getChannelMessages(
				data.channel,
				lastPage(apiChannel)
			);
			if (message == APIStatus.NoResponse) {
				return;
			}
			addendum = message.data;
		}
	}
	stChannels.update((channels) => {
		if (data.user == loggedUser.uuid) {
			channels[data.channel].joined = true;
			if (addendum !== undefined) {
				channels[data.channel].loaded_messages = addendum.map((raw) => {
					return {
						sender: raw.user,
						value: raw.message,
						date: Date.parse(raw.creation_date),
						uuid: raw.uuid,
					};
				});
			}
		}

		if (
			!channels[data.channel].users
				.map((users) => users.uuid)
				.includes(data.user)
		) {
			channels[data.channel].users.push({
				uuid: data.user,
				name: user.username,
				id: parseInt(user.identifier),
				avatar: user.avatar,
				is_moderator: false,
				is_administrator: false,
			});
		}
		return channels;
	});
}

async function wsChatLeave(data: WsChatLeave) {
	const loggedUser = get(stLoggedUser);

	// We do not want to keep private channels that we are not in in stChannels
	if (
		data.user === loggedUser.uuid &&
		get(stChannels)[data.channel].type === ChannelType.Private
	) {
		stChannels.update((channels) => {
			if (data.user == loggedUser.uuid) {
				delete channels[data.channel];
			}
			return channels;
		});
		return;
	}

	// For the other ones, just set the appropriate data
	stChannels.update((channels) => {
		if (data.user == loggedUser.uuid) {
			channels[data.channel].joined = false;
		}
		channels[data.channel].users = channels[data.channel].users.filter(
			(user) => user.uuid !== data.user
		);
		return channels;
	});
}

async function wsChatRemove(data: WsChatRemove) {
	stChannels.update((channels) => {
		delete channels[data.channel];
		return channels;
	});
}

async function wsChatBan(data: WsChatBan) {
	const info = await api.getUserData(data.user);
	if (info === null || info === APIStatus.NoResponse) {
		return;
	}
	stChannels.update((channels) => {
		if (
			!channels[data.channel].banned_users
				.map((u) => u.user.uuid)
				.includes(data.user)
		) {
			channels[data.channel].banned_users.push({
				expiration: new Date(data.expiration),
				user: {
					uuid: data.user,
					name: info.username,
					id: parseInt(info.identifier),
					avatar: info.avatar,
					is_moderator: false,
					is_administrator: false,
				},
			});
			return channels;
		}
	});
}

async function wsChatMute(data: WsChatMute) {
	const info = await api.getUserData(data.user);
	if (info === null || info === APIStatus.NoResponse) {
		return;
	}
	stChannels.update((channels) => {
		if (
			!channels[data.channel].muted_users
				.map((u) => u.user.uuid)
				.includes(data.user)
		) {
			channels[data.channel].muted_users.push({
				expiration: new Date(data.expiration),
				user: {
					uuid: data.user,
					name: info.username,
					id: parseInt(info.identifier),
					avatar: info.avatar,
					is_moderator: false,
					is_administrator: false,
				},
			});
			return channels;
		}
	});
}

async function wsChatUnban(data: WsChatUnban) {
	stChannels.update((channels) => {
		channels[data.channel].banned_users = channels[
			data.channel
		].banned_users.filter((banned) => {
			banned.user.uuid !== data.user;
		});
		return channels;
	});
}

async function wsChatUnmute(data: WsChatUnmute) {
	stChannels.update((channels) => {
		channels[data.channel].muted_users = channels[
			data.channel
		].muted_users.filter((muted) => {
			muted.user.uuid !== data.user;
		});
		return channels;
	});
}

async function wsChatAvatar(data: WsChatAvatar) {
	if (get(stChannels)[data.channel]) {
		stChannels.update((channels) => {
			channels[data.channel].avatar = data.avatar;
			return channels;
		});
	}
}

async function wsUserReceiveNotification(data: WsUserNotification) {
	const notificationData = {
		type: data.type,
		creation_time: data.creation_time,
		uuid: data.uuid,
		user: data.user,
		read: false,
		lobby: (data as any).lobby,
	};
	stNotifications.update((old) => {
		old[data.uuid] = notificationData;
		return old;
	});
	// Maybe not the best place to put this logic but whatever
	if (data.type === NotificationType.AcceptedFriendRequest) {
		stFriends.update((old) => {
			old[data.user].friendship = UsersFriendship.True;
			return old;
		});
	} else if (data.type === NotificationType.FriendRequest) {
		const user = await api.getUserData(data.user);
		if (user === null || user === APIStatus.NoResponse) {
			return;
		}
		stFriends.update((old) => {
			old[data.user] = {
				uuid: data.user,
				id: user.identifier,
				name: user.username,
				friendship: UsersFriendship.Requested,
				avatar: user.avatar,
				status: user.is_online,
			};
			return old;
		});
	}
	await newNotification(notificationData);
}

async function wsUserUnfriend(data: WsUserUnfriend) {
	stFriends.update((old) => {
		delete old[data.user];
		return old;
	});
}

async function wsUserNotificationRead(data: WsUserNotificationRead) {
	stNotifications.update((old) => {
		delete old[data.uuid];
		return old;
	});
}

async function wsUserBlock(data: WsUserBlock) {
	const user = await api.getUserData(data.user);
	if (user === null || user === APIStatus.NoResponse) {
		return;
	}
	if (data.direction === BlockDirection.HasBlocked) {
		stUsers.update((old) => {
			old[data.user].has_blocked = true;
			return old;
		});
	} else {
		stUsers.update((old) => {
			old[data.user].is_blocked = true;
			return old;
		});
	}
}

async function wsUserUnblock(data: WsUserUnblock) {
	const user = await api.getUserData(data.user);
	if (user === null || user === APIStatus.NoResponse) {
		return;
	}

	if (data.direction === BlockDirection.HasUnblocked) {
		stUsers.update((old) => {
			old[data.user].has_blocked = false;
			return old;
		});
	} else {
		stUsers.update((old) => {
			old[data.user].is_blocked = false;
			return old;
		});
	}
}

async function wsUserStatus(data: WsUserStatus) {
	if (data.user === get(stLoggedUser)?.uuid) {
		return;
	}

	if (get(stUsers)[data.user] === undefined) {
		const _user = await api.getUserData(data.user);
	}

	stUsers.update((old) => {
		old[data.user].is_online = data.status;
		if (data.status === ConnectionStatus.InGame) {
			old[data.user].lobby = (data as any).lobby_uuid;
		}
		return old;
	});

	stFriends.update((old) => {
		if (old[data.user]) {
			old[data.user].status = data.status;
			return old;
		}
		return old;
	});
}

async function wsUserMessage(data: WsUser) {
	switch (data.action) {
		case UserAction.Refresh:
			if (!(await refreshToken())) {
				api.logout();
			}
			break;
		case UserAction.Avatar:
			await wsUserAvatar(data as WsUserAvatar);
			break;
		case UserAction.Notification:
			await wsUserReceiveNotification(data as WsUserNotification);
			break;
		case UserAction.Unfriend:
			await wsUserUnfriend(data as WsUserUnfriend);
			break;
		case UserAction.Read:
			await wsUserNotificationRead(data as WsUserNotificationRead);
			break;
		case UserAction.Block:
			await wsUserBlock(data as WsUserBlock);
			break;
		case UserAction.Unblock:
			await wsUserUnblock(data as WsUserUnblock);
			break;
		case UserAction.Status:
			await wsUserStatus(data as WsUserStatus);
			break;
	}
}

async function wsUserAvatar(data: WsUserAvatar) {
	if (data.user === get(stLoggedUser).uuid) {
		stLoggedUser.update((old) => {
			old.avatar = data.avatar;
			return old;
		});
	}
	if (get(stUsers)[data.user]) {
		stUsers.update((users) => {
			users[data.user].avatar = data.avatar;
			return users;
		});
	}
}

async function wsGameJoin(data: WsGameJoin) {
	// If the lobby didn't exist before
	if (get(stLobbies)[data.lobby_uuid] === undefined) {
		// Then get its data from the API
		const lobby = await api.getLobbyInfo(data.lobby_uuid);
		stLobbies.update((old) => {
			if (lobby !== null && lobby !== APIStatus.NoResponse) {
				old[data.lobby_uuid] = lobby;
			}
			return old;
		});

		// If we are the user that just joined the room then we have nothing left to do
		if (data.user_uuid === get(stLoggedUser)?.uuid) {
			return;
		}
	} else {
		// If the lobby already existed, just update the data
		stLobbies.update((old) => {
			// If the player is player 1, then set its state to Joined
			if (old[data.lobby_uuid].players[0] === data.user_uuid) {
				old[data.lobby_uuid].players_status[0] =
					LobbyPlayerReadyState.Joined;
			} else {
				// If the player is player 2, then set its state to Joined
				old[data.lobby_uuid].players[1] = data.user_uuid;
				old[data.lobby_uuid].players_status[1] =
					LobbyPlayerReadyState.Joined;
			}
			return old;
		});
	}

	// If we are in the lobby
	if (get(stLobby) && data.lobby_uuid === get(stLobby).uuid) {
		// Then it can only be player 2, because of the first condition of the function
		// So we put player 2's state to Joined
		stLobby.update((old) => {
			old.players[1] = data.user_uuid;
			old.players_status[1] = LobbyPlayerReadyState.Joined;
			return old;
		});
	}
}

async function wsGameLeave(data: WsGameLeave) {
	stLobbies.update((old) => {
		// If it's player 1
		if (old[data.lobby_uuid]?.players[0] === data.user_uuid) {
			// then the lobby has been disbanded
			delete old[data.lobby_uuid];
		} else if (
			// If it's player 2 AND they were actually in the lobby (not invited)
			old[data.lobby_uuid].players[1] === data.user_uuid &&
			old[data.lobby_uuid].players_status[1] !==
			LobbyPlayerReadyState.Invited
		) {
			// Remove them from the lobby
			old[data.lobby_uuid].players[1] = "";
			old[data.lobby_uuid].players_status[1] =
				LobbyPlayerReadyState.Invited;
		}
		// Remove player from spectators
		old[data.lobby_uuid].spectators =
			old[data.lobby_uuid].spectators?.filter(
				(uuid) => uuid !== data.user_uuid
			) ?? [];
		return old;
	});

	// If we are in the lobby
	if (get(stLobby)?.uuid === data.lobby_uuid) {
		// If the user that left is us, or if player 1 left
		if (
			data.user_uuid === get(stLoggedUser)?.uuid ||
			data.user_uuid === get(stLobby)?.players[0]
		) {
			// then the lobby has been disbanded
			stLobby.set(null);
			return;
		}

		stLobby.update((old) => {
			// remove the user from the spectators
			old.spectators =
				old.spectators?.filter((uuid) => uuid !== data.user_uuid) ?? [];

			// If it's player 2 AND they were actually in the lobby (not invited)
			if (
				old.players[1] === data.user_uuid &&
				old.players_status[1] !== LobbyPlayerReadyState.Invited
			) {
				// Remove them from the lobby
				old.players[1] = "";
				old.players_status[1] = LobbyPlayerReadyState.Invited;
			}
			return old;
		});
		return;
	}
}

async function wsGameReady(data: WsGameReady) {
	// If we are in the lobby
	if (get(stLobby) && get(stLobby).uuid === data.lobby_uuid) {
		// Set the right player to ready
		stLobby.update((old) => {
			if (data.user_uuid === old.players[0]) {
				old.players_status[0] = LobbyPlayerReadyState.Ready;
			} else if (data.user_uuid === old.players[1]) {
				old.players_status[1] = LobbyPlayerReadyState.Ready;
			}
			return old;
		});
	}

	// Same logic as before, but with the global lobbies store
	if (get(stLobbies)[data.lobby_uuid]) {
		stLobbies.update((old) => {
			if (old[data.lobby_uuid].players[0] === data.user_uuid) {
				old[data.lobby_uuid].players_status[0] =
					LobbyPlayerReadyState.Ready;
			} else if (old[data.lobby_uuid].players[1] === data.user_uuid) {
				old[data.lobby_uuid].players_status[1] =
					LobbyPlayerReadyState.Ready;
			}
			return old;
		});
	}
}

async function wsGameStart(data: WsGameStart) {
	// If we are in the lobby
	if (get(stLobby) && get(stLobby).uuid === data.lobby_uuid) {
		// Set every player's state to Ready
		stLobby.update((old) => {
			old.players_status[0] = LobbyPlayerReadyState.Ready;
			old.players_status[1] = LobbyPlayerReadyState.Ready;
			return old;
		});
		stGameSettings.update((old) => {
			old.colors = data.colors;
			return old;
		});
	}

	// Same logic as before, but with the global lobbies store
	if (get(stLobbies)[data.lobby_uuid]) {
		stLobbies.update((old) => {
			old[data.lobby_uuid].players_status[0] =
				LobbyPlayerReadyState.Ready;
			old[data.lobby_uuid].players_status[1] =
				LobbyPlayerReadyState.Ready;
			return old;
		});
	}
}

async function wsGameSpectate(data: WsGameSpectate) {
	// If we are in a lobby
	if (get(stLobby) !== null) {
		// Add the player to spectators
		stLobby.update((old) => {
			old.spectators = old.spectators ?? [];
			if (!old.spectators?.includes(data.user_uuid)) {
				old.spectators.push(data.user_uuid);
			}
			return old;
		});
	}

	// Same logic as before, but with the global lobbies store
	if (get(stLobbies)[data.lobby_uuid]) {
		stLobbies.update((old) => {
			old[data.lobby_uuid].spectators =
				old[data.lobby_uuid].spectators ?? [];
			if (!old[data.lobby_uuid].spectators?.includes(data.user_uuid)) {
				old[data.lobby_uuid].spectators.push(data.user_uuid);
			}
			return old;
		});
	}
}

async function wsGameDisband(data: WsGameDisband) {
	// If we are in the lobby
	if (get(stLobby) && get(stLobby).uuid === data.lobby_uuid) {
		// Then bye bye :)
		stLobby.set(null);
	}

	// Remove the lobby from the list
	stLobbies.update((old) => {
		delete old[data.lobby_uuid];
		return old;
	});
}

async function wsGameInvite(data: WsGameInvite) {
	if (get(stLobby) && get(stLobby).uuid === data.lobby_uuid) {
		stLobby.update((old) => {
			old.players[1] = data.user_uuid;
			old.players_status[1] = LobbyPlayerReadyState.Invited;
			return old;
		});
	}

	if (get(stLobbies)[data.lobby_uuid] === undefined) {
		const lobby = await api.getLobbyInfo(data.lobby_uuid);
		stLobbies.update((old) => {
			if (lobby !== null && lobby !== APIStatus.NoResponse) {
				old[data.lobby_uuid] = lobby;
			}
			return old;
		});

		if (data.user_uuid === get(stLoggedUser)?.uuid) {
			return;
		}
	} else {
		stLobbies.update((old) => {
			old[data.lobby_uuid].players[1] = data.user_uuid;
			old[data.lobby_uuid].players_status[1] =
				LobbyPlayerReadyState.Invited;
			return old;
		});
	}
}

async function wsGameDecline(data: WsGameDecline) {
	if (get(stLobby) && data.lobby_uuid == get(stLobby).uuid) {
		stLobby.update((old) => {
			if (old.players[0] === data.user_uuid) {
				old.players[0] = "";
			} else if (old.players[1] === data.user_uuid) {
				old.players[1] = "";
			}
			return old;
		});
	}

	if (get(stLobbies)[data.lobby_uuid]) {
		stLobbies.update((old) => {
			if (old[data.lobby_uuid].players[0] === data.user_uuid) {
				old[data.lobby_uuid].players[0] = "";
			} else if (old[data.lobby_uuid].players[1] === data.user_uuid) {
				old[data.lobby_uuid].players[1] = "";
			}
			return old;
		});
	}
}

async function wsGameMatch(data: WsGameMatch) {
	stLobbies.update((old) => {
		old[data.lobby.uuid] = data.lobby;
		stLobby.set(data.lobby);
		return old;
	});
}

async function wsGameEnd(data: WsGameEnd) {
	if (get(stLobby)) {
		stLobbies.update((old) => {
			delete old[get(stLobby).uuid];
			return old;
		});
		stPongClient.set(null);
		stLobby.set(null);
	}
	
	const isPlayer1 = data.history.players[0] === get(stLoggedUser).uuid;
	replace(`/?
		p1=${data.history.players[0]}
		&p2=${data.history.players[1]}
		&w=${data.history.winner}
		&pt1=${data.history.players_scores[0]}
		&pt2=${data.history.players_scores[1]}
		&xp=${(isPlayer1) ? data.history.players_xp[0] : data.history.players_xp[1]}
	`);
}

async function wsGameMessage(data: WsGame) {
	switch (data.action) {
		case GameAction.Join:
			await wsGameJoin(data as WsGameJoin);
			break;
		case GameAction.Leave:
			await wsGameLeave(data as WsGameLeave);
			break;
		case GameAction.Ready:
			await wsGameReady(data as WsGameReady);
			break;
		case GameAction.Start:
			await wsGameStart(data as WsGameStart);
			break;
		case GameAction.Spectate:
			await wsGameSpectate(data as WsGameSpectate);
			break;
		case GameAction.Disband:
			await wsGameDisband(data as WsGameDisband);
			break;
		case GameAction.Invite:
			await wsGameInvite(data as WsGameInvite);
			break;
		case GameAction.Decline:
			await wsGameDecline(data as WsGameDecline);
			break;
		case GameAction.Match:
			await wsGameMatch(data as any as WsGameMatch);
			break;
		case GameAction.End:
			await wsGameEnd(data as any as WsGameEnd);
			break;
	}
}

function wsPongMessage(data: WsPong) {
	if (get(stPongClient)) {
		get(stPongClient).receivePacket(data);
	}
}

export const api = {
	whoami: async (): Promise<WhoAmIResponse | APIStatus.NoResponse | null> => {
		return makeRequest<WhoAmIResponse>("/api/users/whoami", "GET");
	},
	logout: async () => {
		await fetchPOST("/api/auth/logout", {});
		stLoggedUser.set(null);
		get(stWebsocket)?.close();
		stWebsocket.set(null);
		push("/login");
	},
	getQRCode: async (): Promise<TFAInitResponse> => {
		await api.whoami();
		const res = await fetch("/api/auth/2fa", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		console.log(res);

		if (res.status === 400) {
			stToast.set("You already have two factor authentication set up");
			return null;
		}

		if (res.status === 401) {
			stToast.set("Authentication error");
			return null;
		}

		let data: TFAInitResponse | null;
		try {
			data = await res.json();
		} catch (e) {
			data = null;
		}

		if (data === null) {
			return {
				message: res.statusText,
				statusCode: res.status,
				text: "https://getramiel.org",
				image: "/img/frame.png",
			};
		}

		return data;
	},
	changeAvatar: async (file: File) => {
		let formData = new FormData();
		formData.append("avatar", file);
		const res = await makeRequest<ChangeAvatarResponse>(
			"/api/users/avatar",
			"POST",
			formData,
			""
		);
		await new Promise((resolve) => setTimeout(resolve, 200));
		if (
			res !== null &&
			res !== APIStatus.NoResponse &&
			res.statusCode !== 413 &&
			res.statusCode !== 400
		) {
			stLoggedUser?.update((old) => {
				old.avatar = res.avatar;
				return old;
			});
		}
		return res;
	},
	changeChannelAvatar: async (file: File, channel: string) => {
		let formData = new FormData();
		formData.append("avatar", file);
		const res = await makeRequest<ChangeAvatarResponse>(
			"/api/chats/channels/" + channel + "/avatar",
			"POST",
			formData,
			""
		);
		await new Promise((resolve) => setTimeout(resolve, 200));
		return res;
	},
	remove2FA: async () => {
		return makeRequest("/api/auth/2fa", "DELETE");
	},
	listChannels: async () => {
		return makeRequest<ListChannelsResponse>("/api/chats/channels", "GET");
	},
	getChannelData: async (uuid: string) => {
		return makeRequest<APIChannel>("/api/chats/channels/" + uuid, "GET");
	},
	getChannelMessages: async (uuid: string, page: number) => {
		return makeRequest<ChannelMessagesResponse>(
			"/api/chats/channels/" +
			uuid +
			"/messages" +
			"?page=" +
			page +
			"&limit=" +
			chatPageSize,
			"GET"
		);
	},
	getUserData: async (uuid: string) => {
		const from_store = get(stUsers)[uuid];
		if (from_store !== undefined) {
			return from_store;
		}
		if (userCache[uuid] === undefined) {
			userCache[uuid] = makeRequest<User>(
				"/api/users/profile/" + uuid,
				"GET"
			);
		}
		const user = await userCache[uuid];
		if (user !== APIStatus.NoResponse) {
			stUsers.update((u) => {
				u[uuid] = user;
				return u;
			});
		}
		return user;
	},
	getUserDataByUserAndId: async (username: string, id: string) => {
		const from_store = Object.entries(get(stUsers)).filter((entry) => {
			return entry[1].username === username && entry[1].identifier === id;
		});
		if (from_store.length > 0) {
			return from_store[0][1];
		}
		const user = await makeRequest<User>(
			`/api/users/profile/${username}/${id}`,
			"GET"
		);
		if (user !== APIStatus.NoResponse) {
			stUsers.update((u) => {
				u[user.uuid] = user;
				return u;
			});
		}
		return user;
	},
	getJoinedChannels: async () => {
		return makeRequest<ListChannelsResponse>(
			"/api/chats/channels/in",
			"GET"
		);
	},
	sendMessage: async (channel: string, message: string) => {
		try {
			return await makeRequest<APIResponse>(
				"/api/chats/channels/" + channel + "/messages",
				"POST",
				{ message }
			);
		} catch (_e) { }
	},
	deleteMessage: async (channel: string, uuid: string) => {
		return makeRequest(
			"/api/chats/channels/" + channel + "/messages",
			"DELETE",
			{
				uuid,
			}
		);
	},
	joinChannel: async (channel: string, password?: string) => {
		return makeRequest<APIResponse>("/api/chats/channels", "POST", {
			channel_uuid: channel,
			password,
		});
	},
	createChannel: async (
		visibility: ChannelVisibility,
		name: string,
		password?: string
	) => {
		return makeRequest<CreateChannelResponse>(
			"/api/chats/channels",
			"POST",
			{
				type: visibility,
				name,
				password,
			}
		);
	},
	deleteChannel: async (channel: string) => {
		return makeRequest("/api/chats/channels/" + channel, "DELETE", {
			action: "REMOVE",
		});
	},
	leaveChannel: async (uuid: string) => {
		return makeRequest("/api/chats/channels/" + uuid, "DELETE", {
			action: "LEAVE",
		});
	},
	kickFromChannel: async (user: string, channel: string) => {
		if (get(stChannels)[channel]?.moderators.includes(user)) {
			await api.demoteUserInChannel(user, channel);
		}
		return makeRequest("/api/chats/channels/" + channel, "DELETE", {
			action: "KICK",
			user_uuid: user,
		});
	},
	promoteUserInChannel: async (user: string, channel: string) => {
		return makeRequest(
			"/api/chats/channels/" + channel + "/moderator",
			"PUT",
			{
				user_uuid: user,
			}
		);
	},
	demoteUserInChannel: async (user: string, channel: string) => {
		return makeRequest(
			"/api/chats/channels/" + channel + "/moderator",
			"DELETE",
			{
				user_uuid: user,
			}
		);
	},
	getBlacklist: async (channel: string) => {
		return makeRequest<APIBlacklist>(
			"api/chats/channels/" + channel + "/blacklist",
			"GET"
		);
	},
	banUserFromChannel: async (
		user: string,
		channel: string,
		duration: number
	) => {
		return makeRequest("/api/chats/channels/" + channel + "/ban", "PUT", {
			user_uuid: user,
			expiration: duration,
		});
	},
	muteUserFromChannel: async (
		user: string,
		channel: string,
		duration: number
	) => {
		return makeRequest("/api/chats/channels/" + channel + "/mute", "PUT", {
			user_uuid: user,
			expiration: duration,
		});
	},
	unbanUserFromChannel: async (user: string, channel: string) => {
		return makeRequest(
			"/api/chats/channels/" + channel + "/unban",
			"DELETE",
			{
				user_uuid: user,
			}
		);
	},
	unmuteUserFromChannel: async (user: string, channel: string) => {
		return makeRequest(
			"/api/chats/channels/" + channel + "/unmute",
			"DELETE",
			{
				user_uuid: user,
			}
		);
	},
	setChannelPassword: async (channel: string, password?: string) => {
		if (password === undefined) {
			password = null;
		}
		return makeRequest("/api/chats/channels/" + channel, "PATCH", {
			password,
		});
	},
	getPrivateChannelData: async (
		channelName: string,
		channelID: number
	): Promise<PrivateChannelData | undefined> => {
		const req = await makeRequest<PrivateChannelData>(
			"/api/chats/channels/private",
			"POST",
			{
				name: channelName,
				identifier: channelID,
			}
		);
		if (req === APIStatus.NoResponse || req.statusCode === 404) {
			return undefined;
		}
		return req;
	},
	getSessions: async () => {
		return makeRequest<SessionsResponse>("/api/users/sessions", "GET");
	},
	killSession: async (uuid: string) => {
		return makeRequest<APIResponse>(
			"/api/users/sessions/" + uuid,
			"DELETE"
		);
	},
	changePassword: async (
		oldPassword: string,
		newPassword: string,
		confirmNewPassword: string
	) => {
		return makeRequest<APIResponse>("/api/users", "PATCH", {
			current_password: oldPassword,
			new_password: newPassword,
			confirm: confirmNewPassword,
		});
	},
	createDirectMessage: async (user: string) => {
		return makeRequest<CreateDirectMessageResponse>(
			"/api/chats/channels",
			"POST",
			{
				user_uuid: user,
			}
		);
	},
	getRelations: async () => {
		return makeRequest<RelationsResponse>("/api/users/relations", "GET");
	},
	sendFriendRequest: async (user: string) => {
		return makeRequest<SendFriendRequestResponse>(
			"/api/users/friendship/" + user,
			"POST"
		);
	},
	removeFriend: async (user: string) => {
		return makeRequest("/api/users/friendship/" + user, "DELETE");
	},
	blockUser: async (user: string) => {
		return makeRequest("/api/users/blocklist/" + user, "POST");
	},
	unblockUser: async (user: string) => {
		return makeRequest("/api/users/blocklist/" + user, "DELETE");
	},
	getNotifications: async () => {
		return makeRequest<GetNotificationsResponse>(
			"/api/users/notifications",
			"GET"
		);
	},
	readNotification: async (uuid: string) => {
		return makeRequest("/api/users/notifications/" + uuid, "DELETE");
	},
	createLobby: async () => {
		return makeRequest<Lobby>("/api/games/lobby", "POST", {
			websocket_uuid: get(stWebsocketUUID)
		});
	},
	invitePlayerToLobby: async (user_uuid: string) => {
		return makeRequest<Lobby>("/api/games/lobby/invite", "POST", {
			user_uuid,
			websocket_uuid: get(stWebsocketUUID)
		});
	},
	joinLobby: async (lobby_uuid: string) => {
		return makeRequest<Lobby>(
			"/api/games/lobby/join/" + lobby_uuid,
			"POST",
			{
				websocket_uuid: get(stWebsocketUUID)
			}
		);
	},
	leaveLobby: async (lobby_uuid: string) => {
		return makeRequest("/api/games/lobby/" + lobby_uuid, "DELETE");
	},
	declareReady: async (lobby_uuid: string) => {
		return makeRequest("/api/games/lobby/" + lobby_uuid, "PUT");
	},
	declineLobbyInvite: async (lobby_uuid: string) => {
		return makeRequest<APIResponse>(
			"/api/games/lobby/join/" + lobby_uuid,
			"DELETE"
		);
	},
	getLobbies: async () => {
		const resp = await makeRequest<Array<Lobby>>(
			"/api/games/lobby/all",
			"GET"
		);
		// Awful workaround
		if ((resp as any)?.statusCode === 200) {
			const ret: Array<Lobby> = [];
			let i = 0;
			while (resp["" + i]) {
				resp["" + i].spectators = resp["" + i].spectators ?? [];
				resp["" + i].players = resp["" + i].players ?? [];
				resp["" + i].players_status = resp["" + i].players_status ?? [];
				ret.push(resp["" + i]);
				++i;
			}
			return ret;
		}
		return [];
	},
	getLobbyInfo: async (lobby_uuid: string) => {
		return makeRequest<Lobby>("/api/games/lobby/" + lobby_uuid, "GET");
	},
	joinQueue: async () => {
		return makeRequest("/api/games/matchmaking", "POST", {
			websocket_uuid: get(stWebsocketUUID)
		});
	},
	leaveQueue: async () => {
		return makeRequest("/api/games/matchmaking", "DELETE", {
			websocket_uuid: get(stWebsocketUUID)
		});
	},
	getMatchHistory: async (user_uuid: string) => {
		return makeRequest<GameHistory[]>("/api/games/history/" + user_uuid, "GET");
	},
	changePlayerColor: async (lobby: string, color: string) => {
		return makeRequest<APIResponse>("/api/games/lobby/" + lobby, "PATCH", {
			color
		});
	},
	ws: {
		connect: async () => {
			if (get(stWebsocket) == null) {
				const protocol =
					window.location.protocol === "https:" ? "wss" : "ws";
				const ws = new ReconnectingWebSocket(
					protocol +
					"://" +
					window.location.hostname +
					"/api/streaming"
				);
				stWebsocket.set(ws);

				ws.onerror = () => {
					console.log("Could not connect to WebSocket.");
					websocketConnected.set(false);
					// ws.onerror = undefined;
					// ws.onopen = undefined;
					// ws.onclose = undefined;
					// stWebsocket.set(null);
					// setTimeout(() => {
					// 	api.ws.connect();
					// }, 2000);
				};

				ws.onopen = async () => {
					await tryToLog().then(async () => {
						websocketConnected.set(true);
						stLobby.set(null);
						await initNotifications();
						await initFriends();
						await initChannels();
						await initLobbies();
					});
					console.log("Successfully connected to websocket");
				};

				ws.onclose = (e) => {
					websocketConnected.set(false);
					if (e.wasClean) {
						console.log("Websocket closed");
						// stWebsocket.set(null);
						return;
					}
					console.log("Websocket got closed");
					// ws.onerror = undefined;
					// ws.onopen = undefined;
					// ws.onclose = undefined;
					// stWebsocket.set(null);
					// setTimeout(() => {
					// 	api.ws.connect();
					// }, 2000);
				};

				ws.onmessage = async (message) => {
					const data: WebsocketMessage = JSON.parse(message.data);
					// console.log(data);
					switch (data.namespace) {
						case WsNamespace.Chat:
							await wsChatMessage(data as WsChat);
							break;
						case WsNamespace.User:
							await wsUserMessage(data as WsUser);
							break;
						case WsNamespace.Game:
							await wsGameMessage(data as WsGame);
							break;
						case WsNamespace.Pong:
							wsPongMessage(data as WsPong);
							break;
						case WsNamespace.Meta:
							const metadata = data as WsMeta;
							stWebsocketUUID.set(metadata.uuid);
							break;
					}
				};
			}
		},
	},
};

export function getUserProfilePictureLink(user_uuid: string): string {
	const defaultLink = "/img/default.jpg";
	if (user_uuid == get(stLoggedUser)?.uuid) {
		const avatar = get(stLoggedUser)?.avatar;
		return avatar ? "/pictures/" + avatar : defaultLink;
	}
	const user = get(stUsers)[user_uuid];
	if (!user?.avatar) {
		return "/img/default.jpg";
	}
	return "/pictures/" + user.avatar;
}
