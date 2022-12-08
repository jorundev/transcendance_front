import type { UsersFriendship } from "./api";
import type { ConnectionStatus } from "./friends";

export interface LoggedUser {
	username: string;
	id: number;
	avatar: string | null;
	uuid: string;
	tfa: boolean;
	xp: number;
}

export interface User {
	uuid: string;
	username: string;
	identifier: string;
	avatar: string | null;
	friendship: UsersFriendship;
	is_blocked: boolean;
	has_blocked: boolean;
	is_online: ConnectionStatus;
	lobby?: string;
	xp: number;
}

export interface UserDictionary {
	[key: string]: User;
}
