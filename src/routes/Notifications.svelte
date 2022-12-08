<script lang="ts">
	import NotificationList from "../components/Notifications/NotificationList.svelte";
	import SideBar from "../components/SideBar.svelte";
</script>

<!-- <SideBar active="notifications"/> -->
<div class="notifications">
	<NotificationList />
</div>

<style lang="scss">
	.notifications {
		padding: 16px;
	}

	@media screen and (min-width: 800px) {
		.notifications {
			margin-left: 52px;
		}
	}
</style>
