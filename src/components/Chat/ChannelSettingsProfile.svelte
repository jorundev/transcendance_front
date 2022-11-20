<script lang="ts">
	import { padIdentifier } from "../../utils";
	import { api, getUserProfilePictureLink } from "../../api";
	import HoverableTooltip from "../Kit/HoverableTooltip.svelte";
	import Button from "../Kit/Button.svelte";
	import ClickOutside from "svelte-click-outside";
	import { stLoggedUser } from "../../stores";
	import { createEventDispatcher } from "svelte";

	export let user: {
		uuid: string;
		name: string;
		id: number;
		avatar: string;
		is_moderator: boolean;
		is_administrator: boolean;
	};

	export let channel: string;

	export let is_in_channel: boolean;

	let dispatch = createEventDispatcher();

	let fullId = "";
	$: fullID = padIdentifier(user.id);

	export let banned = false;
	export let muted = false;

	// true if the logged user is a moderator of the channel
	export let is_moderator: boolean;
	// true if the logged user is the administrator of the channel
	export let is_administrator: boolean;

	let drawer = false;

	let grade = "";

	$: {
		if (user.is_administrator) {
			grade = "Channel Owner";
		} else if (user.is_moderator) {
			grade = "Moderator";
		}
	}

	function onClick() {
		if (user.uuid === $stLoggedUser.uuid) {
			return;
		}
		drawer = !drawer;
	}

	let innerWidth;

	function kick() {
		api.kickFromChannel(user.uuid, channel);
	}

	function unban() {
		api.unbanUserFromChannel(user.uuid, channel);
	}

	function unmute() {
		api.unmuteUserFromChannel(user.uuid, channel);
	}
</script>

<svelte:window bind:innerWidth />
<ClickOutside
	on:clickoutside={() => {
		drawer = false;
	}}
>
	<div class="a">
		<div class="profile" on:click|preventDefault={onClick}>
			<div class="info">
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
			</div>
		</div>
		{#if (is_moderator || is_administrator) && drawer}
			<div class="actions" class:active={drawer}>
				<div class="inner">
					<Button
						active={is_in_channel}
						timeout={1000}
						timeoutVisible
						padding={"8px"}
						on:click={kick}
						red>Kick</Button
					>
					{#if banned}
						<Button
							padding={"8px"}
							timeout={1000}
							timeoutVisible
							on:click={unban}>Unban</Button
						>{:else}
						<Button
							on:click={() =>
								dispatch("ban", { uuid: user.uuid })}
							padding={"8px"}
							timeout={1000}
							timeoutVisible
							red>Ban</Button
						>
					{/if}
					{#if muted}
						<Button
							padding={"8px"}
							timeout={1000}
							timeoutVisible
							on:click={unmute}>Unmute</Button
						>{:else}
						<Button
							on:click={() =>
								dispatch("mute", { uuid: user.uuid })}
							padding={"8px"}
							timeout={1000}
							timeoutVisible
							red>Mute</Button
						>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</ClickOutside>

<style lang="scss">
	.profile {
		user-select: none;
		-webkit-user-select: none;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;

		.info {
			display: flex;
			justify-content: space-between;
			height: 60px;
			align-items: center;
			gap: 10px;
		}

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
		}
	}

	@keyframes fadein {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.actions {
		display: flex;
		width: 100%;
		height: 100%;
		position: absolute;
		align-items: center;
		top: 0;
		animation: fadein 0.1s ease-in-out;

		opacity: 1;

		.inner {
			display: none;
			justify-content: center;
			margin: 10px;
			gap: 10px;
			content: "";
			width: 100%;
			height: 40px;
			background: rgba(0, 0, 0, 0.566);
			border-radius: 20px;
		}

		&.active {
			.inner {
				display: flex;
			}
		}
	}

	.gray {
		color: rgb(99, 99, 99);
	}

	.a {
		position: relative;
	}
</style>
