<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import Router, { replace } from "svelte-spa-router";
	import { slide } from "svelte/transition";
	import { api, APIStatus } from "./api";
	import routes from "./App.routes";
	import Modal from "./components/Kit/Modal.svelte";
	import SpinnerModal from "./components/Kit/SpinnerModal.svelte";
	import SideBar from "./components/SideBar.svelte";
	import {
		stChannels,
		stLoggedUser,
		stServerDown,
		stSidebarSelected,
		stToast,
		stWebsocket,
		tryLoggingIn,
		websocketConnected,
	} from "./stores";

	let interval = null;
	let serverDownInterval = null;

	let innerWidth = 0;
	let marqueeWidth = 0;

	let hash = "";
	$: {
		console.log(hash);
		if (hash === "/login" && !$stLoggedUser) {
			$stSidebarSelected = null;
			api.whoami().then((val) => {
				if (val !== null && val !== APIStatus.NoResponse && (val as any).statusCode !== 401) {
					replace("/");
				}
			});
		} else if (
			hash.startsWith("/login") ||
			hash.startsWith("/postsignup") ||
			hash.startsWith("/setup2fa")
		) {
			$stSidebarSelected = null;
		} else {
			if (hash.startsWith("/settings")) {
				$stSidebarSelected = "settings";
			} else if (hash.startsWith("/chat")) {
				if (!hash.startsWith("/chat/inner") || innerWidth >= 800) {
					$stSidebarSelected = "chat";
				} else {
					$stSidebarSelected = null;
				}
			} else if (hash.startsWith("/play")) {
				$stSidebarSelected = "play";
			} else if (hash.startsWith("/profile")) {
				$stSidebarSelected = "";
			} else if (hash.startsWith("/game")) {
				$stSidebarSelected = null;
			} else if (hash === "/") {
				$stSidebarSelected = "home";
			}
		}
	}

	async function connectToServer() {
		// If the server throws a 200 or a 404 then the server is alright.
		// If it returns something else (probably a 502) then the server is down
		const res = await fetch("/api/ping");
		return res?.status === 200 || res?.status === 404;
	}

	stServerDown.subscribe((isDown) => {
		if (isDown) {
			if (!serverDownInterval) {
				serverDownInterval = setInterval(async () => {
					if (await connectToServer()) {
						stServerDown.set(false);
						clearInterval(serverDownInterval);
						serverDownInterval = null;
						await tryLoggingIn();
					}
				}, 2000);
			}
		} else {
			if (serverDownInterval) {
				clearInterval(serverDownInterval);
				serverDownInterval = null;
			}
		}
	});

	onMount(async () => {
		resize();
		if (await connectToServer()) {
			const hash = window.location.hash;
			if (
				!hash.startsWith("#/login") &&
				!hash.startsWith("#/postsignup")
			) {
				await tryLoggingIn();
			}
		} else {
			stServerDown.set(true);
		}

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

	function resize() {
		document.documentElement.style.setProperty(
			"--app-height",
			`${window.innerHeight}px`
		);
	}
</script>

<svelte:head>
	{#if $stServerDown}
		<title>Server down - NEW SHINJI MEGA PONG ULTIMATE</title>
	{/if}
</svelte:head>
<svelte:window bind:innerWidth on:resize={resize} />
{#if $stToast !== null}
	<div
		class="toast"
		transition:slide
		on:click|stopPropagation={() => stToast.set(null)}
	>
		<div class="marquee" bind:clientWidth={marqueeWidth} class:active={marqueeWidth > window.innerWidth}>
			{$stToast}
		</div>
	</div>
{/if}
{#if $stLoggedUser && !$websocketConnected}
	<Modal><SpinnerModal /></Modal>
{/if}
<div class="main">
	{#if $stServerDown}
		<div class="sorry">
			There is something wrong with the server.<br />Attempting
			reconnection...
		</div>
	{:else}
		{#if $stSidebarSelected !== null}
			<SideBar />
		{/if}
		<div class="router">
			<Router
				on:routeLoaded={(e) => {
					hash = e.detail.location;
				}}
				{routes}
				restoreScrollState={true}
				on:conditionsFailed={conditionsFailed}
			/>
		</div>
	{/if}
</div>

<style lang="scss">
	.main {
		position: relative;
		width: 100%;
		height: 100%;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		overflow: hidden;
		max-width: 1600px;
	}

	.router {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.toast {
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		position: fixed;
		width: 100%;
		top: 0;
		height: 78px;
		font-size: 20px;
		overflow-wrap: break-word;
		background: rgb(209, 60, 60);
		color: white;
		z-index: 200;
		border-bottom: 1px solid rgb(72, 0, 0);
		
		@keyframes marquee {
			from {
				transform: translateX(0);
			}
			to {
				transform: translateX(calc(-100% + 100vw - 16px));
			}
		}
		
		.marquee {
			padding-left: 16px;
			position: absolute;
			
			&.active {
				animation: marquee 6s linear;
			}
		}
	}

	@media screen and (max-width: 799px) {
		div {
			user-select: none;
			-webkit-user-select: none;
		}
	}

	.sorry {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		text-align: center;
		font-size: 20px;
		line-height: 30px;
	}
</style>
