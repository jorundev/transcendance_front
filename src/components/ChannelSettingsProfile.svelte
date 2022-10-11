<script lang="ts">
	import { getUserProfilePictureLink } from "../api";
	import HoverableTooltip from "./Kit/HoverableTooltip.svelte";

	export let user: {
		uuid: string;
		name: string;
		id: number;
		avatar: string;
		is_moderator: boolean;
		is_administrator: boolean;
	};
	// true if the logged user is a moderator of the channel
	export let is_moderator: boolean;
	// true if the logged user is the administrator of the channel
	export let is_administrator: boolean;

	let tooltip = "";

	$: {
		if (user.is_administrator) {
			tooltip = "Channel Owner";
		} else if (user.is_moderator) {
			tooltip = "Moderator";
		}
	}

	let innerWidth;

	function kick() {
		if (!user.is_moderator && !user.is_administrator) {
			// TODO: kick
		}
	}
</script>

<svelte:window bind:innerWidth />
<div class="profile">
	<div
		class="profile-picture"
		style={"background-image: url('" +
			getUserProfilePictureLink(user.uuid) +
			"')"}
	/>
	<div class="name">
		{user.name}<span class="gray">#{user.id}</span>
	</div>
	<HoverableTooltip {tooltip}>
		<div
			class="star"
			class:moderator={user.is_moderator}
			class:administrator={user.is_administrator}
			on:click={kick}
		/>
	</HoverableTooltip>
</div>

<style lang="scss">
	.profile {
		display: flex;
		justify-content: space-between;
		height: 70px;
		flex-shrink: 0;

		align-items: center;
		gap: 10px;
		background: rgb(18, 18, 18);
		border-radius: 18px;
		padding-left: 30px;
		padding-right: 30px;

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
			margin-left: 10px;
			margin-right: 10px;
			&.moderator {
				background-image: url("/img/mod.png");
			}
			&.administrator {
				background-image: url("/img/star.png");
			}
			&.kick {
				background-image: url("/img/kick.png");
				cursor: pointer;
			}
		}
	}

	.gray {
		color: rgb(99, 99, 99);
	}
</style>
