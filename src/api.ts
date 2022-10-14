import { Mutex } from "async-mutex";
import { push } from "svelte-spa-router";
import { get } from "svelte/store";
import { ChannelType } from "./channels";
import {
	lastPage,
	stChannels,
	stLoggedUser,
	stServerDown,
	stUsers,
	stWebsocket,
} from "./stores";
import type { User } from "./users";
import {
	ChatAction,
	UserAction,
	WsNamespace,
	type WsChat,
	type WsChatDelete,
	type WsChatDemote,
	type WsChatJoin,
	type WsChatLeave,
	type WsChatPromote,
	type WsChatRemove,
	type WsChatSend,
	type WsUser,
} from "./websocket/types";

export enum APIStatus {
	NoResponse,
}

async function fetchPOST(url: string, object: any): Promise<Response> {
	return await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(object),
	});
}

async function fetchPATCH(url: string, object: any): Promise<Response> {
	return await fetch(url, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(object),
	});
}

async function fetchDELETE(url: string, object: any): Promise<Response> {
	return await fetch(url, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(object),
	});
}

async function fetchPUT(url: string, object: any): Promise<Response> {
	return await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(object),
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
	refresh_tolerance: 10,
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
	object?: any
): Promise<T | APIStatus.NoResponse | null> {
	let promise: Promise<Response>;

	for (;;) {
		switch (method) {
			case "GET":
				promise = fetchGET(url);
				break;
			case "POST":
				promise = fetchPOST(url, object ? object : {});
				break;
			case "DELETE":
				promise = fetchDELETE(url, object ? object : {});
				break;
			case "PUT":
				promise = fetchPUT(url, object ? object : {});
				break;
			case "PATCH":
				promise = fetchPATCH(url, object ? object : {});
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
			case 502:
				console.error("A terrible error happened: ", response);
				stServerDown.set(true);
				return APIStatus.NoResponse;
			case 200:
			case 201:
				try {
					return JSON.parse(await response.text());
				} catch (e) {
					return null;
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
					return response.json();
				} catch (e) {
					return null;
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
	avatar: string | null;
}

export interface PrivateChannelData extends APIResponse {
	uuid: string;
	identifier: number;
	name: string;
	avatar: string | null;
}

export interface APIUser extends WhoAmIResponse {
	is_online: boolean;
}

export interface ListChannelsResponse extends APIResponse {
	data: Array<APIChannel>;
	count: number;
	total: number;
	page: number;
	page_count: number;
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
		id: number;
		creation_date: string;
		message: string;
		user: string;
	}>;
}

interface WebsocketMessage {
	namespace: WsNamespace;
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
	Promise.all(users_promises)
		.then((values) => {
			for (const data of values) {
				if (data == APIStatus.NoResponse) {
					continue;
				}
				users.push({
					name: data.username,
					id: data.identifier,
					avatar: data.avatar,
					uuid: channel.users[i],
					is_moderator: channel.moderators.includes(channel.users[i]),
					is_administrator:
						channel.administrator === channel.users[i],
				});
				i += 1;
			}
		})
		.catch((e) => {
			console.log("Critical Error: ", e);
		});
	return users;
}

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

	const promises = [];
	let i = channel.last_loaded_page - 1;
	//console.log("total: ", i - (channel.last_loaded_page - n - 1));
	while (i >= 1 && i >= channel.last_loaded_page - n - 1) {
		promises.push(api.getChannelMessages(uuid, i));
		i -= 1;
	}

	const messagesList = await Promise.all(promises);

	for (const messages of messagesList) {
		if (messages == APIStatus.NoResponse) {
			return;
		}
		for (const message of messages.data) {
			/* Avoid duplicates */
			if (
				!channel.loaded_messages
					.map((msg) => msg.id)
					.includes(message.id)
			) {
				channel.loaded_messages.push({
					id: message.id,
					value: message.message,
					sender: message.user,
					date: Date.parse(message.creation_date),
				});
			}
		}
	}
	channel.loaded_messages.sort((a, b) => {
		return a.id - b.id;
	});

	channel.last_loaded_page = i + 1;

	stChannels.update((channels) => {
		channels[uuid] = channel;
		return channels;
	});
}

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

		let page = channel_data.message_count / 10;
		if (page != Math.floor(page)) {
			page = Math.floor(page) + 1;
		}

		stChannels.update((channels) => {
			channels[data.channel] = {
				type: channel_data.type,
				id: channel_data.identifier,
				uuid: data.channel,
				name: channel_data.name,
				last_message: null,
				loaded_messages: [],
				joined: false,
				has_password: channel_data.password,
				users: users,
				last_loaded_page: page,
				moderators: channel_data.moderators,
				administrator: channel_data.administrator,
			};
			return channels;
		});
	}
	release();

	switch (data.action) {
		case ChatAction.Send:
			wsChatSend(data as WsChatSend);
		case ChatAction.Join:
			wsChatJoin(data as WsChatJoin);
			break;
		case ChatAction.Create:
			// This has already been done
			break;
		case ChatAction.Delete:
			wsChatDelete(data as WsChatDelete);
			break;
		case ChatAction.Leave:
			wsChatLeave(data as WsChatLeave);
			break;
		case ChatAction.Remove:
			wsChatLeave(data as WsChatLeave);
			wsChatRemove(data as WsChatRemove);
			break;
		case ChatAction.Promote:
			wsChatPromote(data as WsChatPromote);
			break;
		case ChatAction.Demote:
			wsChatDemote(data as WsChatDemote);
			break;
	}
}

async function wsUserMessage(data: WsUser) {
	switch (data.action) {
		case UserAction.Refresh:
			if (!(await refreshToken())) {
				api.logout();
			}
	}
}

async function wsChatPromote(data: WsChatPromote) {
	stChannels.update((channels) => {
		channels[data.channel].users.find(
			(usr) => usr.uuid == data.user
		).is_moderator = true;
		return channels;
	});
}

async function wsChatDemote(data: WsChatDemote) {
	stChannels.update((channels) => {
		channels[data.channel].users.find(
			(usr) => usr.uuid == data.user
		).is_moderator = false;
		return channels;
	});
}

async function wsChatSend(data: WsChatSend) {
	stChannels.update((channels) => {
		channels[data.channel].loaded_messages.push({
			sender: data.user,
			value: data.message.text,
			id: data.message.id,
			date: Date.parse(data.message.time),
		});
		return channels;
	});
}

async function wsChatDelete(data: WsChatDelete) {
	// TODO: This is O(log n) but could probably be faster
	stChannels.update((channels) => {
		channels[data.channel].reload = true;
		for (const message of [
			...channels[data.channel].loaded_messages,
		].reverse()) {
			if (message.id == data.id) {
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
	if (user == APIStatus.NoResponse) {
		return;
	}

	let addendum: {
		id: number;
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
						id: raw.id,
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
				// TODO:
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
	if (get(stChannels)[data.channel].type === ChannelType.Private) {
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
			(user) => user.uuid != data.user
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

export const api = {
	whoami: async (): Promise<WhoAmIResponse | APIStatus.NoResponse | null> => {
		const res = makeRequest<WhoAmIResponse>("/api/users", "GET");
		return res;
	},
	users: async (): Promise<APIUser[] | APIStatus.NoResponse | null> => {
		return makeRequest<APIUser[]>("/api/users", "GET");
	},
	logout: async () => {
		await fetchPOST("/api/auth/logout", {});
		stLoggedUser.set(null);
		push("/login");
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
				"&limit=10",
			"GET"
		);
	},
	getUserData: async (uuid: string) => {
		const from_store = get(stUsers)[uuid];
		if (from_store !== undefined) {
			return from_store;
		}
		if (userCache[uuid] === undefined) {
			userCache[uuid] = makeRequest<User>("/api/users/" + uuid, "GET");
		}
		const user = await userCache[uuid];
		if (user != APIStatus.NoResponse) {
			stUsers.update((u) => {
				u[uuid] = user;
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
			await makeRequest(
				"/api/chats/channels/" + channel + "/messages",
				"POST",
				{ message }
			);
		} catch (_e) {}
	},
	deleteMessage: async (channel: string, id: number) => {
		return makeRequest(
			"/api/chats/channels/" + channel + "/messages",
			"DELETE",
			{
				id,
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
	leaveChannel: async (uuid: string) => {
		return makeRequest("/api/chats/channels/" + uuid, "DELETE", {
			action: "LEAVE",
		});
	},
	kickFromChannel: async (user: string, channel: string) => {
		return makeRequest("/api/chats/channels/" + channel, "DELETE", {
			action: "KICK",
			user_uuid: user,
		});
	},
	promoteUserInChannel: async (user: string, channel: string) => {
		return makeRequest("/api/chats/channels/" + channel, "PUT", {
			action: "PROMOTE",
			user_uuid: user,
		});
	},
	demoteUserInChannel: async (user: string, channel: string) => {
		return makeRequest("/api/chats/channels/" + channel, "PUT", {
			action: "DEMOTE",
			user_uuid: user,
		});
	},
	banUserFromChannel: async (
		user: string,
		channel: string,
		duration: number
	) => {
		const ts = new Date().getSeconds() + duration;
		const expirationDate = new Date(ts * 1000);
		/* Todo: bad design from the backend */
		return makeRequest("/api/chats/channels/" + channel, "PUT", {
			action: "BAN",
			user_uuid: user,
			expiration: 0,
		});
	},
	setChannelPassword: async (channel: string, password?: string) => {
		if (password === undefined) {
			password = null;
		}
		console.log(password);
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
	ws: {
		connect: async () => {
			if (get(stWebsocket) == null) {
				const ws = new WebSocket(
					"wss://" + window.location.hostname + "/api/streaming"
				);
				ws.onerror = async () => {
					console.log(
						"Could not connect to WebSocket. Retrying in 2 seconds"
					);
					stWebsocket.set(null);
					api.ws.connect();
				};
				ws.onopen = () => {
					console.log("Successfully connected to websocket");
					stWebsocket.set(ws);
				};

				ws.onclose = () => {
					/*console.log("Websocket got closed");
					stWebsocket.set(null);
					api.ws.connect();*/
				};

				ws.onmessage = async (message) => {
					const data: WebsocketMessage = JSON.parse(message.data);
					switch (data.namespace) {
						case WsNamespace.Chat:
							await wsChatMessage(data as WsChat);
							break;
						case WsNamespace.User:
							await wsUserMessage(data as WsUser);
							break;
					}
				};

				setTimeout(() => {
					if (get(stWebsocket) == null) {
						ws.close();
					}
				}, 2000);
			}
		},
	},
};

export function getUserProfilePictureLink(user_uuid: string): string {
	const user = get(stUsers)[user_uuid];
	if (user == undefined || !user.avatar) {
		return "/img/default.jpg";
	}
	return "/pictures/" + user.avatar;
}
