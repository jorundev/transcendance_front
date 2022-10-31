<script lang="ts">
	import { padIdentifier } from "../../utils";
	import { getUserProfilePictureLink } from "../../api";
	import HoverableTooltip from "../Kit/HoverableTooltip.svelte";

	export let user: {
		uuid: string;
		name: string;
		id: number;
		avatar: string;
		is_moderator: boolean;
		is_administrator: boolean;
	};

	export let blacklist = false;

	export let is_in_channel: boolean;

	let fullId = "";
	$: fullID = padIdentifier(user.id);

	export let banned = false;
	export let muted = false;

	// true if the logged user is a moderator of the channel
	export let is_moderator: boolean;
	// true if the logged user is the administrator of the channel
	export let is_administrator: boolean;

	let grade = "";

	$: {
		if (user.is_administrator) {
			grade = "Channel Owner";
		} else if (user.is_moderator) {
			grade = "Moderator";
		}
	}

	let innerWidth;
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
		{user.name}<span class="gray">#{fullID}</span>
	</div>
	<HoverableTooltip tooltip={grade}>
		<div
			class="star"
			class:moderator={user.is_moderator}
			class:administrator={user.is_administrator}
		/>
	</HoverableTooltip>
	{#if is_moderator || is_administrator}
		<div class="actions">
			<HoverableTooltip tooltip="Kick">
				<div class="star kick" class:active={is_in_channel} />
			</HoverableTooltip>
			<HoverableTooltip tooltip={banned ? "Ban" : "Unban"}>
				<div class="star ban" class:positive={banned} />
			</HoverableTooltip>
			<HoverableTooltip tooltip={muted ? "Mute" : "Unmute"}>
				<div class="star mute" class:positive={banned} />
			</HoverableTooltip>
		</div>
	{/if}
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
			flex-shrink: 0;
		}

		.star {
			width: 20px;
			height: 20px;
			background-size: cover;
			&.moderator {
				margin-right: 20px;
				background-image: url("/img/mod.png");
			}
			&.administrator {
				margin-right: 20px;
				background-image: url("/img/star.png");
			}
			&.kick {
				background-image: url("/img/kick.png");
				cursor: pointer;
			}
			&.ban {
				background-image: url("/img/ban.png");
				cursor: pointer;
			}
			&.mute {
				background-image: url("/img/mute.png");
				cursor: pointer;
			}
		}
	}

	.actions {
		display: flex;
		gap: 10px;
	}

	.gray {
		color: rgb(99, 99, 99);
	}
</style>
