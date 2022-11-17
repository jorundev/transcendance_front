import type { UsersFriendship } from "./api";
import type { ConnectionStatus } from "./friends";

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
	is_online: ConnectionStatus,
}

export interface UserDictionary {
	[key: string]: User;
}
