import type { UsersFriendship } from "./api";

export interface LoggedUser {
	username: string;
	id: number;
	avatar: string | null;
	uuid: string;
	tfa: boolean;
}

export interface User {
	username: string;
	identifier: string;
	avatar: string | null;
	friendship: UsersFriendship;
	is_blocked: boolean;
	has_blocked: boolean;
}

export interface UserDictionary {
	[key: string]: User;
}
