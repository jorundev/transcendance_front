import { get, writable, type Writable } from "svelte/store";
import { api, APIStatus } from "./api";

export interface LoggedUser {
	username: string;
	id: number;
	profile_picture: string | null;
	uuid: string;
}

export interface User {
	username: string;
	id: string;
	profile_picture: string | null;
}

export interface UserDictionary {
	[key: string]: User;
}

export const stLoggedUser: Writable<LoggedUser | null> = writable(null);
export const stServerDown: Writable<boolean> = writable(false);
export const stUsers: Writable<UserDictionary> = writable({
	"55c4d182-af87-4166-a0a6-7909072a48f7": {
		username: "Random",
		id: "0999",
		profile_picture: null,
	},
	"58cdfb48-43b7-4551-ba65-9f49aeb80e03": {
		username: "Michel",
		id: "0001",
		profile_picture: null,
	},
});

export async function tryToLog() {
	const response = await api.whoami();
	if (response == APIStatus.NoResponse) {
		stServerDown.set(true);
		return;
	}

	if (response == null) {
		return;
	}

	stLoggedUser.set({
		username: response.username,
		uuid: response.uuid,
		id: response.identifier,
		profile_picture: response.profile_picture,
	});

	stServerDown.set(false);
}

export async function tryLoggingIn(): Promise<boolean> {
	await tryToLog();
	return isLogged();
}

export async function isLogged(): Promise<boolean> {
	return get(stLoggedUser) != null;
}
