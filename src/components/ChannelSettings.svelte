<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { getUserProfilePictureLink } from "../api";
	import type { Channel } from "../stores";
	import Button from "./Kit/Button.svelte";
	import Card from "./Kit/Card.svelte";

	export let channel: Channel;

	let dispatch = createEventDispatcher();
</script>

<Card>
	<div class="settings">
		<div class="title">Settings for {channel.name}</div>
		<div class="category">
			<div class="category-name">Members</div>
			{#each channel.users as user}
				<div class="profile">
					<div
						class="profile-picture"
						style={"background-image: url('" +
							getUserProfilePictureLink(user.uuid) +
							"')"}
					/>
					<div class="name">{user.name}#{user.id}</div>
					<div class="star" class:moderator={user.is_moderator} />
				</div>
			{/each}
			<Button
				on:click={() => {
					dispatch("back");
				}}>Back</Button
			>
		</div>
	</div>
</Card>

<style lang="scss">
	.settings {
		min-width: 250px;
	}

	.title {
		font-size: 22px;
		margin-bottom: 16px;
	}

	.profile {
		display: flex;
		justify-content: space-between;
		height: 70px;
		width: 100%;
		align-items: center;
		gap: 10px;

		.profile-picture {
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
			border-radius: 100%;
			width: 40px;
			height: 40px;
		}

		.star {
			width: 20px;
			height: 20px;
			background-size: cover;
			&.moderator {
				background-image: url("/img/star.png");
			}
		}
	}
</style>
