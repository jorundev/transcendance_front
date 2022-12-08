/**
 * Websocket response
 */

import type { Lobby } from "src/api";
import type { ConnectionStatus } from "src/friends";
import type { GameHistory } from "src/lobbies";
import type { PlayerRole } from "src/pong/Pong";
import type { NotificationType } from "../notifications";

export enum WsNamespace {
	Chat = "Chat",
	User = "User",
	Game = "Game",
	Meta = "Meta",
	Pong = "Pong",
}

/**
 * Chat
 */

export enum ChatAction {
	Create = "CREATE",
	Join = "JOIN",
	Leave = "LEAVE",
	Remove = "REMOVE",
	Send = "SEND",
	Delete = "DELETE",
	Promote = "PROMOTE",
	Demote = "DEMOTE",
	Ban = "BAN",
	Unban = "UNBAN",
	Mute = "MUTE",
	Unmute = "UNMUTE",
	Avatar = "AVATAR",
}

export interface WsChat {
	namespace: WsNamespace.Chat;
	action: ChatAction;
	channel: string;
	user?: string;
}

export interface WsChatCreate extends WsChat {
	action: ChatAction.Create;
}

export interface WsChatJoin extends WsChat {
	action: ChatAction.Join;
	user: string;
}

export interface WsChatLeave extends WsChat {
	action: ChatAction.Leave;
	user: string;
}

export interface WsChatRemove extends WsChat {
	action: ChatAction.Remove;
}

export interface WsMessage {
	uuid: string;
	text: string;
	time: string;
}

export interface WsChatSend extends WsChat {
	action: ChatAction.Send;
	user: string;
	message: WsMessage;
}

export interface WsChatDelete extends WsChat {
	action: ChatAction.Delete;
	uuid: string;
}

export interface WsChatPromote extends WsChat {
	action: ChatAction.Promote;
	user: string;
}

export interface WsChatDemote extends WsChat {
	action: ChatAction.Demote;
	user: string;
}

export interface WsChatMute extends WsChat {
	action: ChatAction.Mute;
	user: string;
	expiration: Date;
}

export interface WsChatUnmute extends WsChat {
	action: ChatAction.Unmute;
	user: string;
}

export interface WsChatAvatar extends WsChat {
	action: ChatAction.Avatar;
	avatar: string;
}

export interface WsChatBan extends WsChat {
	action: ChatAction.Ban;
	user: string;
	expiration: Date | null;
}

export interface WsChatUnban extends WsChat {
	action: ChatAction.Unban;
	user: string;
}

export interface WsUserNotification extends WsUser {
	action: UserAction.Notification;
	type: NotificationType;
	user: string;
	uuid: string;
	creation_time: Date;
}

export enum BlockDirection {
	IsBlocked = 0,
	IsUnblocked = 0,
	HasBlocked = 1,
	HasUnblocked = 1,
}

export interface WsUserNotificationRead extends WsUser {
	action: UserAction.Read;
	uuid: string;
}

export interface WsUserBlock extends WsUser {
	action: UserAction.Block;
	user: string;
	direction: BlockDirection;
}

export interface WsUserUnblock extends WsUser {
	action: UserAction.Unblock;
	user: string;
	direction: BlockDirection;
}

export interface WsUserUnfriend extends WsUser {
	action: UserAction.Unfriend;
	user: string;
}

/**
 * User
 */

export enum UserAction {
	Unfriend = "UNFRIEND",
	Block = "BLOCK",
	Unblock = "UNBLOCK",
	Refresh = "REFRESH",
	Expired = "EXPIRED",
	Avatar = "AVATAR",
	Session = "SESSION",
	Notification = "NOTIFICATION",
	Read = "READ",
	Status = "STATUS",
}

export interface WsUser {
	namespace: WsNamespace.User;
	action: UserAction;
}

export interface WsUserAvatar extends WsUser {
	action: UserAction.Avatar;
	user: string;
	avatar: string;
}

export interface WsUserRefresh extends WsUser {
	action: UserAction.Refresh;
}

export interface WsUserStatus extends WsUser {
	action: UserAction.Status;
	user: string;
	status: ConnectionStatus;
}

export interface WsUserStatusInGame extends WsUser {
	action: UserAction.Status;
	user: string;
	status: ConnectionStatus.InGame;
	lobby_uuid: string;
}

/**
 * Game
 */

export enum GameAction {
	Invite = "INVITE",
	Decline = "DECLINE",
	Join = "JOIN",
	Spectate = "SPECTATE",
	Ready = "READY",
	Start = "START",
	Leave = "LEAVE",
	Wait = "WAIT",
	Match = "MATCH",
	Disband = "DISBAND",
	End = "END",
}

export interface WsGame {
	namespace: WsNamespace.Game;
	action: GameAction;
	lobby_uuid: string;
}

export interface WsGameJoin extends WsGame {
	action: GameAction.Join;
	user_uuid: string;
}

export interface WsGameSpectate extends WsGame {
	action: GameAction.Spectate;
	user_uuid: string;
}

export interface WsGameReady extends WsGame {
	action: GameAction.Ready;
	user_uuid: string;
}

export interface WsGameStart extends WsGame {
	action: GameAction.Start;
	colors: [string, string];
}

export interface WsGameLeave extends WsGame {
	action: GameAction.Leave;
	user_uuid: string;
}

export interface WsGameDisband extends WsGame {
	action: GameAction.Disband;
}

export interface WsGameInvite extends WsGame {
	action: GameAction.Invite;
	user_uuid: string;
}

export interface WsGameDecline extends WsGame {
	action: GameAction.Decline;
	user_uuid: string;
}

export interface WsGameWait {
	namespace: WsNamespace.Game;
	action: GameAction.Wait;
}

export interface WsGameMatch {
	namespace: WsNamespace.Game;
	action: GameAction.Match;
	lobby: Lobby;
}

export interface WsGameEnd {
	namespace: WsNamespace.Game;
	action: GameAction.End;
	history: GameHistory;
}

/**
 * Lobby
 */

export interface WsMeta {
	namespace: WsNamespace.Meta;
	uuid: string;
}

/**
 * Pong
 */

export enum PongAction {
	Bounce = "BOUNCE",
	Move = "MOVE",
	Reset = "RESET",
}

export interface WsPong {
	namespace: WsNamespace.Pong;
	action: PongAction;
}

export interface WsPongBounce extends WsPong {
	action: PongAction.Bounce;
	data: any;
}

export interface WsPongMove extends WsPong {
	action: PongAction.Move;
	player: PlayerRole;
	data: {
		tick: number;
		moveTarget: number;
	};
}

export interface WsPongReset extends WsPong {
	action: PongAction.Reset;
	data: any;
}
