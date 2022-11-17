import type { Lobby } from "./api";

export enum LobbyPlayerReadyState {
	Invited,
	Joined,
	Ready,
}

export enum LobbyWinner {
	Player1,
	Player2,
	Tie,
}

export interface LobbyDictionary {
	[key: string]: Lobby;
}
