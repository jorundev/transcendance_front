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

export interface GameHistory {
	uuid: string,
	winner: LobbyWinner,
	players: [string, string],
	players_scores: [number, number],
	players_xp: [number, number],
}
