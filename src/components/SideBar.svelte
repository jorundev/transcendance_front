<script lang="ts">
	import { push } from "svelte-spa-router";
	import { onMount } from "svelte";
	import { stHasNotifications, stSidebarSelected } from "../stores";
	import FriendListVertical from "./Friends/FriendListVertical.svelte";

	let bigDisplay = false;
	let innerWidth = 0;

	let hover = false;
	let notransition = true;

	let active: string = null;
	$: active = $stSidebarSelected;

	let oldWidth = 0;

	onMount(() => {
		notransition = true;
		setTimeout(() => {
			notransition = false;
		}, 100);
	});

	$: bigDisplay = innerWidth >= 1948;

	$: {
		if (
			(innerWidth < 1948 && oldWidth >= 1948) ||
			(innerWidth >= 800 && oldWidth < 800)
		) {
			notransition = true;
			setTimeout(() => {
				notransition = false;
			}, 1);
		}
		oldWidth = innerWidth;
	}
</script>

<div
	class:notransition
	class:hover={bigDisplay || hover}
	class:sidebar={bigDisplay}
	class:sidebar-hover={!bigDisplay}
	on:mouseenter={() => (hover = true)}
	on:mouseleave={() => (hover = false)}
>
	<div
		class="elem home"
		class:active={active === "home"}
		class:has-notif={$stHasNotifications && innerWidth >= 800}
		on:click={() => push("/")}
	>
		<div class="inner">Home</div>
	</div>
	{#if innerWidth < 800}
		<div
			class="elem notifications"
			class:active={active === "notifications"}
			class:has-notif={$stHasNotifications}
			on:click={() => push("/notifications")}
		>
			<div class="inner">Notifications</div>
		</div>
	{/if}
	<div
		class="elem play"
		class:active={active === "play"}
		on:click={() => push("/play")}
	>
		<div class="inner">Play</div>
	</div>
	<div
		class="elem chat"
		class:active={active === "chat"}
		on:click={() => push("/chat")}
	>
		<div class="inner">Chat</div>
	</div>
	<div
		class="elem settings"
		class:active={active === "settings"}
		on:click={() => push("/settings")}
	>
		<div class="inner">Settings</div>
	</div>
	{#if innerWidth >= 800}
		<div class="friends">
			<FriendListVertical />
		</div>
	{/if}
</div>

<svelte:window bind:innerWidth />

<style lang="scss">
	.notransition {
		transition: none;
		width: 52px;
	}
	.sidebar-hover,
	.sidebar {
		::-webkit-scrollbar {
			display: none;
		}
		scrollbar-width: none;
		
		&::before {
			content: "";
			min-width: 180px;
			min-height: 100%;
			position:fixed;
			top: 0;
			transform: translateX(-100%);
		}

		user-select: none;
		-webkit-user-select: none;
		z-index: 20;
		display: flex;
		flex-shrink: 0;
		background-color: black;

		.elem {
			cursor: pointer;
			width: 52px;
			height: 52px;
			background-size: 45%;
			background-position: center;
			background-repeat: no-repeat;
			flex-shrink: 0;
			position: relative;

			&:hover {
				background-color: rgb(40, 40, 40);
				border-radius: 100px;
			}

			&.home {
				background-image: url("/img/home.png");
			}

			&.play {
				background-image: url("/img/play.png");
			}

			&.chat {
				background-image: url("/img/bubbles.png");
			}

			&.settings {
				background-image: url("/img/settings.png");
			}

			&.notifications {
				background-image: url("/img/bell.png");
			}

			@keyframes flash {
				from {
					transform: scale(1.35);
					background: white;
				}
				to {
					background: red;
				}
			}

			&.has-notif::after {
				content: "";
				text-align: center;
				font-size: 8px;
				position: absolute;
				width: 20%;
				height: 20%;
				left: 28px;
				top: 12px;
				background: red;
				animation: flash 1s ease-out infinite;
				border-radius: 100%;
				border: 1px solid rgb(18, 18, 18);
			}
		}
	}

	@media screen and (max-width: 799px) {
		.sidebar-hover,
		.sidebar {
			position: absolute;
			bottom: 0;
			width: 100%;
			height: 52px;
			justify-content: space-evenly;
			border-top: 1px solid rgb(37, 37, 37);
			.inner {
				display: none;
			}

			.elem {
				&.active::before {
					content: "";
					z-index: -1;
					border-bottom: 3px solid #0c82fa;
					width: 100%;
					height: 100%;
					position: absolute;
					box-sizing: border-box;
				}

				&:hover {
					background-color: transparent;
					border-radius: 0;
				}
			}
		}
	}

	@media screen and (min-width: 800px) {
		.sidebar-hover:not(.notransition) {
			transition: width 0.2s;
		}

		.sidebar {
			transition: width 0s;
		}

		.sidebar-hover,
		.sidebar {
			overflow-x: hidden;
			padding-top: 50px;
			border-right: 1px solid rgb(37, 37, 37);
			position: fixed;
			height: 100vh;
			box-sizing: border-box;
			width: 52px;
			flex-direction: column;
			gap: 25px;

			.elem {
				font-size: 18px;

				&:hover {
					border-top-right-radius: 0;
					border-bottom-right-radius: 0;

					.inner {
						background-color: rgb(40, 40, 40);
						padding-right: 16px;
						border-top-right-radius: 100px;
						border-bottom-right-radius: 100px;
					}
				}

				.inner {
					display: block;
					position: absolute;
					height: 52px;
					margin-left: 52px;
					align-items: center;
					justify-content: center;
					line-height: 52px;
				}
			}

			&.hover {
				position: fixed;
				width: 200px;
			}
		}
	}

	@media screen and (min-width: 1948px) {
		.sidebar {
			transform: translateX(-148px);
		}
	}

	.friends {
		display: flex;
		padding-top: 10px;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		width: 100%;
		overflow-x: hidden;
		overflow-y: auto;
		height: 100%;
		box-sizing: border-box;
		gap: 10px;
	}
</style>
