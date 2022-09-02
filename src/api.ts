import { push } from "svelte-spa-router";
import { stLoggedUser } from "./stores";

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

	return response != null && response.status == 201;
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

		const response = await promise
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
				return response.json();
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
					push("/login");
					return null;
				}
		}
		break;
	}
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
	whoami: async (): Promise<WhoAmIResponse | APIStatus.NoResponse | null> => {
		return await makeRequest<WhoAmIResponse>("/api/auth/whoami", "GET");
	},
	users: async (): Promise<User[] | APIStatus.NoResponse | null> => {
		return await makeRequest<User[]>("/api/users", "GET");
	},
	logout: async () => {
		await fetchPOST("/api/auth/logout", {});
		stLoggedUser.set(null);
		push("/login");
	},
};
