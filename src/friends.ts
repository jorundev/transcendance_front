import type { UsersFriendship } from "./api";

export enum ConnectionStatus {
	Offline,
	Online,
	InGame,
}

export interface FriendData {
	uuid: string;
	name: string;
	id: string;
	avatar: string;
	status: ConnectionStatus;
	gameLobby?: string;
	friendship: UsersFriendship;
}

export interface FriendDataDictionary {
	[key: string]: FriendData;
}
