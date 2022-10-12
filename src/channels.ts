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
