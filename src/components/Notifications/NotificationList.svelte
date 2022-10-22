<script lang="ts">
	import { stNotifications } from "../../stores";
	import { type NotificationDataDictionary, isGameInviteNotificationData, isFriendRequestNotificationData, isFriendRequestAcceptedNotificationData } from "../../notifications";
	import GameInviteNotification from "./GameInviteNotification.svelte";
	import Notification from "./Notification.svelte";
	import FriendRequestNotification from "./FriendRequestNotification.svelte";
	import FriendRequestAcceptedNotification from "./FriendRequestAcceptedNotification.svelte";
    
    let notifications: NotificationDataDictionary = {};
    
    $: notifications = $stNotifications;
</script>

<div class="notification-list">
    {#each Object.entries(notifications) as [uuid, data] (uuid)}
        <!--TODO: Dismiss-->
        <Notification on:dismiss={() => console.log("dismiss(" + uuid + ")")}>
            {#if isGameInviteNotificationData(data)}
                <GameInviteNotification {data}/>
            {:else if isFriendRequestNotificationData(data)}
                <FriendRequestNotification {data}/>
            {:else if isFriendRequestAcceptedNotificationData(data)}
                <FriendRequestAcceptedNotification {data}/>
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
