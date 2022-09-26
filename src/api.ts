import { push } from "svelte-spa-router";
import { get } from "svelte/store";
import {
	ChannelType,
	stChannels,
	stLoggedUser,
	stUsers,
	stWebsocket,
	type User,
} from "./stores";

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

async function fetchGET(url: string): Promise<Response> {
	return await fetch(url, {
		method: "GET",
	});
}

async function refreshToken(): Promise<boolean> {
	const response = await fetchPOST("/api/auth/refresh", {})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.error("Critical error: ", err);
			return null;
		});

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
		if (method == "POST") {
			promise = fetchPOST(url, object ? object : {});
		} else if (method == "GET") {
			promise = fetchGET(url);
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
	profile_picture: string | null;
}

export interface APIUser extends WhoAmIResponse {
	is_online: boolean;
}

export interface APIChannel {
	uuid: string;
	identifier: number;
	name: string;
	password: boolean;
	message_count: number;
	users: Array<string>;
	moderator: string;
}

export interface ListChannelsResponse extends APIResponse {
	data: Array<APIChannel>;
	count: number;
	total: number;
	page: number;
	pageCount: number;
}

export interface JoinedChannelsResponse extends APIResponse {
	data: Array<APIChannel>;
	count: number;
	total: number;
	page: number;
	page_count: 1;
}

export interface ChannelDataResponse extends APIResponse {
	uuid: string;
	identifier: number;
	name: string;
	password: boolean;
	message_count: 0;
	moderator: string;
	users: Array<string>;
}

export interface CreateChannelResponse extends APIResponse {
	uuid: string;
}

enum WebsocketEvent {
	Ping = 0,
	Chat = 1,
}

enum ChatState {
	Create = 0,
	Join = 1,
	Leave = 2,
	Send = 3,
	Delete = 4,
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
	event: WebsocketEvent;
}

interface WebsocketChatMessage extends WebsocketMessage {
	state: ChatState;
	user: string;
	channel: string;
}

interface WebsocketChatSendMessage extends WebsocketMessage {
	creation_date: string;
	channel: string;
	id: number;
	message: string;
	state: ChatState;
	user: string;
}

interface WebsocketChatJoinMessage extends WebsocketMessage {
	channel: string;
	user: string;
}

export async function getUsersFromUUIDs(channel: APIChannel): Promise<
	Array<{
		name: string;
		id: number;
		profile_picture: string;
		uuid: string;
		is_moderator: boolean;
	}>
> {
	const users = [];
	const users_promises = [];
	for (const user of channel.users) {
		users_promises.push(api.getUserData(user));
	}
	let i = 0;
	Promise.all(users_promises).then((values) => {
		for (const data of values) {
			if (data == APIStatus.NoResponse) {
				continue;
			}
			users.push({
				name: data.username,
				id: data.identifier,
				profile_picture: data.profile_picture,
				uuid: channel.users[i],
				is_moderator: channel.moderator == channel.users[i],
			});
			i += 1;
		}
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

export const api = {
	whoami: async (): Promise<WhoAmIResponse | APIStatus.NoResponse | null> => {
		return makeRequest<WhoAmIResponse>("/api/auth/whoami", "GET");
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
		return makeRequest<ChannelDataResponse>(
			"/api/chats/channels/" + uuid,
			"GET"
		);
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
		return makeRequest<JoinedChannelsResponse>(
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

				ws.onmessage = async (message) => {
					const data: WebsocketMessage = JSON.parse(message.data);
					if (data.event == WebsocketEvent.Chat) {
						const chat_data = data as WebsocketChatMessage;
						if (get(stChannels)[chat_data.channel] == undefined) {
							const channel_data = await api.getChannelData(
								chat_data.channel
							);
							if (channel_data == APIStatus.NoResponse) {
								return;
							}
							const users = await getUsersFromUUIDs(channel_data);

							let page = channel_data.message_count / 10;
							if (page != Math.floor(page)) {
								page = Math.floor(page) + 1;
							}

							stChannels.update((channels) => {
								channels[chat_data.channel] = {
									type: ChannelType.Group,
									id: channel_data.identifier,
									uuid: chat_data.channel,
									name: channel_data.name,
									last_message: null,
									loaded_messages: [],
									joined: false,
									has_password: channel_data.password,
									users: users,
									last_loaded_page: page,
								};
								return channels;
							});
						}
						switch (chat_data.state) {
							case ChatState.Join:
								const join_data =
									data as WebsocketChatJoinMessage;
								stChannels.update((channels) => {
									channels[join_data.channel].joined = true;
									return channels;
								});
								break;
							case ChatState.Send:
								const send_data =
									data as WebsocketChatSendMessage;
								stChannels.update((channels) => {
									channels[
										send_data.channel
									].loaded_messages.push({
										sender: send_data.user,
										value: send_data.message,
										date: Date.parse(
											send_data.creation_date
										),
										id: send_data.id,
									});
									return channels;
								});
								break;
						}
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
	if (user == undefined || !user.profile_picture) {
		return "/img/default.jpg";
	}
	return "/pictures/" + user.profile_picture;
}
