<script lang="ts">
	import { padIdentifier } from "../../utils";
	import { api, APIStatus } from "../../api";
	import type { User } from "../../users";
	import UserAvatar from "../Users/UserAvatar.svelte";
	import { createEventDispatcher } from "svelte";

	export let uuid: string;

	let user: User;

	$: {
		api.getUserData(uuid).then((u) => {
			if (u !== null && u !== APIStatus.NoResponse) {
				user = u;
			}
		});
	}

	let userID = "????";
	$: userID = padIdentifier(parseInt(user?.identifier));

	let dispatch = createEventDispatcher();
</script>

<div class="item" on:click={() => dispatch("invite", uuid)}>
	<div class="avatar">
		<UserAvatar {uuid} />
	</div>
	<div class="info">
		{user?.username}
		<div class="id">#{userID}</div>
	</div>
</div>

<style lang="scss">
	.item {
		display: flex;
		gap: 10px;
		align-items: center;
		padding: 10px 10px;
		background: black;
		border-bottom: 1px solid rgb(22, 22, 22);

		&:hover {
			border-radius: 10px;
			background: #141414;
			cursor: pointer;
		}

		.info {
			display: flex;

			.id {
				color: rgb(82, 82, 82);
			}
		}
	}

	.avatar {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
	}
</style>
