import { writable, type Writable } from "svelte/store";

export interface LoggedUser {
	username: string;
	id: number;
	profile_picture: string | null;
	uuid: string;
}

export const stLoggedUser: Writable<LoggedUser | null> = writable(null);
