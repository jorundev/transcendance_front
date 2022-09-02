import { get, writable, type Writable } from "svelte/store";
import { api, APIStatus } from "./api";

export interface LoggedUser {
	username: string;
	id: number;
	profile_picture: string | null;
	uuid: string;
}

export const stLoggedUser: Writable<LoggedUser | null> = writable(null);
export const stServerDown: Writable<boolean> = writable(false);

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
