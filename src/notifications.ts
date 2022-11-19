import { push } from "svelte-spa-router";
import { api, APIStatus, getUserProfilePictureLink } from "./api";
import { stNotifications } from "./stores";

export enum NotificationType {
	GameInvite,
	FriendRequest,
	AcceptedFriendRequest,
}

export interface NotificationData {
	type: NotificationType,
	creation_time: Date,
	uuid: string,
	user: string,
	read: boolean;
}

export interface GameInviteNotificationData extends NotificationData {
	type: NotificationType.GameInvite,
	lobby: string,
}

export interface FriendRequestNotificationData extends NotificationData {
	type: NotificationType.FriendRequest,
}

export interface AcceptedFriendRequestNotificationData extends NotificationData {
	type: NotificationType.AcceptedFriendRequest,
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

export async function canUseBrowserNotifications(): Promise<boolean> {
	if (typeof Notification !== "undefined") {
		switch (Notification.permission) {
			case "denied":
				return false;
			case "granted":
				return true;
			case "default":
				const newPermission = await Notification.requestPermission();
				return newPermission === "granted";
		}
	}
	return false;
}

export async function newNotification(data: NotificationData) {
	const canUseNotificationAPI = canUseBrowserNotifications();

	stNotifications.update((old) => {
		old[data.uuid] = data;
		return old;
	});

	if (await canUseNotificationAPI) {
		let browserNotification: Notification;
		if (isGameInviteNotificationData(data)) {
			const user = await api.getUserData(data.user);
			if (user === null || user === APIStatus.NoResponse) {
				return;
			}
			browserNotification = new Notification("You have been challenged to a game!", {
				body: user.username + "#" + user.identifier + " wants to play against you",
				icon: getUserProfilePictureLink(data.user),
			});
		} else if (isFriendRequestNotificationData(data)) {
			const user = await api.getUserData(data.user);
			if (user === null || user === APIStatus.NoResponse) {
				return;
			}
			browserNotification = new Notification("You have a friend request!", {
				body: user.username + "#" + user.identifier + " wants to be your friend",
				icon: getUserProfilePictureLink(data.user),
			});
		} else if (isFriendRequestAcceptedNotificationData(data)) {
			const user = await api.getUserData(data.user);
			if (user === null || user === APIStatus.NoResponse) {
				return;
			}
			browserNotification = new Notification("You have a new friend!", {
				body: user.username + "#" + user.identifier + " accepted your friend request",
				icon: getUserProfilePictureLink(data.user),
			});
		}
		browserNotification.onclick = () => {
			push("/");
			window.focus();
		};
	}

}
