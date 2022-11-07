<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import Router, { replace } from "svelte-spa-router";
	import routes from "./App.routes";
	import {
		stChannels,
		stLoggedUser,
		stServerDown,
		stWebsocket,
		tryLoggingIn,
	} from "./stores";

	let interval = null;
	let serverDownInterval = null;

	stServerDown.subscribe((isDown) => {
		if (isDown) {
			serverDownInterval = setInterval(async () => {
				await tryLoggingIn();
			}, 2000);
		} else {
			clearInterval(serverDownInterval);
			serverDownInterval = null;
		}
	});

	onMount(async () => {
		clearInterval(interval);
		document.documentElement.style.setProperty(
			"--scrollbar-width",
			window.innerWidth - document.documentElement.clientWidth + "px"
		);
		document.documentElement.style.setProperty(
			"--scrollbar-height",
			window.innerHeight - document.documentElement.clientHeight + "px"
		);

		interval = setInterval(() => {
			if ($stWebsocket) {
				$stWebsocket.send("");
			}
		}, 20000);

		/* Handle ban and mute timeouts */
		setInterval(() => {
			const now = new Date();
			if ($stLoggedUser && !$stServerDown) {
				for (const [_, channel] of Object.entries($stChannels)) {
					for (const banned_user of channel.banned_users) {
						if (banned_user.expiration.getTime() <= now.getTime()) {
							console.log(
								"Unbanned " +
									banned_user.user.uuid +
									" from " +
									channel.uuid
							);
							stChannels.update((channels) => {
								channels[channel.uuid].banned_users = channels[
									channel.uuid
								].banned_users.filter(
									(u) => u.user.uuid !== banned_user.user.uuid
								);
								return channels;
							});
						}
					}
					for (const muted_user of channel.muted_users) {
						if (muted_user.expiration.getTime() <= now.getTime()) {
							stChannels.update((channels) => {
								channels[channel.uuid].muted_users = channels[
									channel.uuid
								].muted_users.filter(
									(u) => u.user.uuid !== muted_user.user.uuid
								);
								return channels;
							});
						}
					}
				}
			}
		}, 5000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	function conditionsFailed(event) {
		if (!event.detail.userData) {
			return;
		}

		if (event.detail.userData.redirect) {
			replace(event.detail.userData.redirect);
		}
	}
</script>

<svelte:head>
	{#if $stServerDown}
		<title>Server down - NEW SHINJI MEGA PONG ULTIMATE</title>
	{/if}
</svelte:head>
<div class="main">
	{#if $stServerDown}
		<div class="sorry">Server is down. Try again later!</div>
	{:else}
		<Router
			{routes}
			restoreScrollState={true}
			on:conditionsFailed={conditionsFailed}
		/>
	{/if}
</div>

<style lang="scss">
	.main {
		width: 100%;
		height: 100%;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		overflow: hidden;
		max-width: 1600px;
	}

	@media screen and (max-width: 799px) {
		div {
			user-select: none;
			-webkit-user-select: none;
		}
	}

	.sorry {
		color: gray;
		text-align: center;
		font-size: 40px;
	}
</style>
