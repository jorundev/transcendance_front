export enum NotificationType {
    GameInvite,
    FriendRequest,
    AcceptedFriendRequest,
}

export interface NotificationData {
    type: NotificationType,
    date: Date,
}

export interface GameInviteNotificationData extends NotificationData {
    type: NotificationType.GameInvite,
    user: string,
    lobby: string,
}

export interface FriendRequestNotificationData extends NotificationData {
    type: NotificationType.FriendRequest,
    sender: string,
}

export interface AcceptedFriendRequestNotificationData extends NotificationData {
    type: NotificationType.AcceptedFriendRequest,
    sender: string,
}

export interface NotificationDataDictionary {
    [key: string]: NotificationData
}


export function isGameInviteNotificationData(data: NotificationData): data is GameInviteNotificationData {
    return data.type === NotificationType.GameInvite;
}

export function isFriendRequestNotificationData(data: NotificationData): data is FriendRequestNotificationData {
    return data.type === NotificationType.FriendRequest;
}

export function isFriendRequestAcceptedNotificationData(data: NotificationData): data is AcceptedFriendRequestNotificationData {
    return data.type === NotificationType.AcceptedFriendRequest;
}
