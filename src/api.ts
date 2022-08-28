import { push } from "svelte-spa-router";
import { stLoggedUser } from "./stores";

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

async function makeRequest<T>(
	url: string,
	method: string,
	object?: any
): Promise<T | null> {
	let ret: any = null;

	let promise: Promise<Response>;

	if (method == "POST") {
		promise = fetchPOST(url, object ? object : {});
	} else if (method == "GET") {
		promise = fetchGET(url);
	}

	/* First, try to make the request */
	await promise
		.then(async (res) => {
			if (res.status == 200) {
				/* All is OK */
				return res.json();
			} else if (res.status == 401) {
				/* Unauthorized */
				/* Let's try refreshing our token first */
				await fetchPOST("/api/auth/refresh", {}).then(async (res) => {
					if (res.status == 401) {
						/* Refreshing didn't work... take user to the login page */
						throw "Unauthorized";
					} else if (res.status == 200) {
						/* Refreshing worked. Try the request call again */
						return await makeRequest(url, method, object);
					}
				});
			} else if (res.status == 502) {
				/* Bad Gateway */
				return null;
			}
		})
		.catch((_) => {
			stLoggedUser.set(null);
			push("/login");
			return;
		})
		.then((obj) => {
			ret = obj;
		});

	return ret;
}

export interface WhoAmIResponse {
	uuid: string;
	identifier: number;
	username: string;
	profile_picture: string | null;
}

export interface User extends WhoAmIResponse {
	is_online: boolean;
}

export const api = {
	whoami: async (): Promise<WhoAmIResponse> => {
		return await makeRequest<WhoAmIResponse>("/api/auth/whoami", "GET");
	},
	users: async (): Promise<User[]> => {
		return await makeRequest<User[]>("/api/users", "GET");
	},
	logout: async (): Promise<null> => {
		return await makeRequest<null>("/api/auth/logout", "POST");
	},
};
