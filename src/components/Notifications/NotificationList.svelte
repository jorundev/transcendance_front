<script lang="ts">
	import { stNotifications } from "../../stores";
	import {
		type NotificationDataDictionary,
		isGameInviteNotificationData,
		isFriendRequestNotificationData,
		isFriendRequestAcceptedNotificationData,
	} from "../../notifications";
	import GameInviteNotification from "./GameInviteNotification.svelte";
	import Notification from "./Notification.svelte";
	import FriendRequestNotification from "./FriendRequestNotification.svelte";
	import FriendRequestAcceptedNotification from "./FriendRequestAcceptedNotification.svelte";
	import { createEventDispatcher } from "svelte";

	let dispatch = createEventDispatcher();
</script>

<div class="notification-list">
	{#each Object.entries($stNotifications) as [uuid, data] (uuid)}
		<Notification
			on:click={() => {
				if (isFriendRequestNotificationData(data)) {
					dispatch("invite-click", data);
				} else if (isFriendRequestAcceptedNotificationData(data)) {
					dispatch("noticed-friend-accepted", data);
				} else if (isGameInviteNotificationData(data)) {
					dispatch("accept-invite-click", data);
				}
			}}
		>
			{#if isGameInviteNotificationData(data)}
				<GameInviteNotification {data} />
			{:else if isFriendRequestNotificationData(data)}
				<FriendRequestNotification {data} />
			{:else if isFriendRequestAcceptedNotificationData(data)}
				<FriendRequestAcceptedNotification {data} />
			{/if}
		</Notification>
	{/each}
</div>

<style lang="scss">
	.notification-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
