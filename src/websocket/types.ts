/**
 * Websocket response
 */

import type { NotificationType } from "../notifications";

export enum WsNamespace {
	Chat = "Chat",
	User = "User",
	Game = "Game",
}

/**
 * Chat
 */

export enum ChatAction {
	Create = 'CREATE',
	Join = 'JOIN',
	Leave = 'LEAVE',
	Remove = 'REMOVE',
	Send = 'SEND',
	Delete = 'DELETE',
	Promote = 'PROMOTE',
	Demote = 'DEMOTE',
	Ban = 'BAN',
	Unban = 'UNBAN',
	Mute = 'MUTE',
	Unmute = 'UNMUTE',
	Avatar = 'AVATAR'
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

export interface WsUserNotificationRead extends WsUser {
	action: UserAction.Read;
	uuid: string;
}

export interface WsUserBlock extends WsUser {
	action: UserAction.Block;
	user: string;
}

export interface WsUserUnblock extends WsUser {
	action: UserAction.Unblock;
	user: string;
}

export interface WsUserUnfriend extends WsUser {
	action: UserActions.Unfriend;
	user: string;
}

/**
 * User
 */

export enum UserAction {
	Unfriend = 'UNFRIEND',
	Block = 'BLOCK',
	Unblock = 'UNBLOCK',
	Refresh = 'REFRESH',
	Expired = 'EXPIRED',
	Avatar = 'AVATAR',
	Session = 'SESSION',
	Notification = 'NOTIFICATION',
	Read = 'READ'
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

/**
 * Game
 */

export interface WsGame {
	namespace: WsNamespace.Game;
	action: "";
}
