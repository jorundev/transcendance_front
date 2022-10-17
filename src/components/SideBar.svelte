<script lang="ts">
	import { push } from "svelte-spa-router";
	import { onMount } from "svelte";
	
	let bigDisplay = false;
	let innerWidth = 0;
	
	let hover = false;
	let notransition = true;
	
	let oldWidth = 0;
	
	onMount(() => {
		setTimeout(() => {
			notransition = false;
		}, 1);
	});
	
	$: bigDisplay = innerWidth >= 1948;
	
	$: {
		if (innerWidth < 1948 && oldWidth >= 1948) {
			notransition = true;
			setTimeout(() => {
				notransition = false;
			}, 1);
		}
		oldWidth = innerWidth;
	}
</script>

<div class:notransition class:hover={bigDisplay || hover} class:sidebar={bigDisplay} class:sidebar-hover={!bigDisplay} on:mouseenter={() => hover = true} on:mouseleave={() => hover = false}>
	<div class="elem home" on:click={() => push("/")}>
		<div class="inner">Home</div>
	</div>
	<div class="elem play" on:click={() => push("/play")} >
		<div class="inner">Play</div>
	</div>
	<div class="elem chat" on:click={() => push("/chat")}>
		<div class="inner">Chat</div>
	</div>
	<div class="elem settings" on:click={() => push("/settings")}>
		<div class="inner">Settings</div>
	</div>
	<div class="elem notifications" on:click={() => push("/notifications")}>
		<div class="inner">Notifications</div>
	</div>
</div>

<svelte:window bind:innerWidth />
<style lang="scss">
	.notransition {
		transition: none;
		width: 52px;
	}
	.sidebar-hover, .sidebar {
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

			&:hover {
				background-color: rgb(40, 40, 40);
				border-radius: 100px;
			}
			
			&.hover {
					transition: none;
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
				position: relative;

				&.has-notif::after {
					content: "";
					position: absolute;
					width: 20%;
					height: 20%;
					left: 28px;
					top: 12px;
					background: red;
					border-radius: 100%;
					border: 1px solid rgb(18, 18, 18);
				}
			}
		}
	}

	@media screen and (max-width: 800px) {
		.sidebar-hover, .sidebar {
			position: absolute;
			bottom: 0;
			width: 100%;
			height: 52px;
			justify-content: space-evenly;
			border-top: 1px solid rgb(37, 37, 37);
			.inner {
				display: none;	
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
		
		.sidebar-hover, .sidebar {
			overflow-x: hidden;
			padding-top: 50px;
			border-right: 1px solid rgb(37, 37, 37);
			position: fixed;
			height: 100%;
			width: 52px;
			flex-direction: column;
			gap: 25px;

			.elem {
				font-size: 18px;

				&:hover,
				&.hover {
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
</style>
