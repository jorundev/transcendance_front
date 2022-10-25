export interface LoggedUser {
	username: string;
	id: number;
	avatar: string | null;
	uuid: string;
	tfa: boolean,
}

export interface User {
	username: string;
	identifier: string;
	avatar: string | null;
}

export interface UserDictionary {
	[key: string]: User;
}
