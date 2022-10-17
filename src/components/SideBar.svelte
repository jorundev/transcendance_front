<script lang="ts">
	import { stHasNotifications } from "../stores";
	import { push } from "svelte-spa-router";
</script>

<div class="sidebar">
	<div class="elem home" on:click={() => push("/")} />
	<div class="elem play" on:click={() => push("/play")} />
	<div class="elem chat" on:click={() => push("/chat")} />
	<div class="elem settings" on:click={() => push("/settings")} />
	<div
		class="elem notifications"
		class:has-notif={$stHasNotifications}
		on:click={() => push("/notifications")}
	/>
</div>

<style lang="scss">
	.sidebar {
		z-index: 10;
		display: flex;
		flex-shrink: 0;
		background-color: rgb(18, 18, 18);

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

	@media screen and (max-width: 799px) {
		.sidebar {
			position: absolute;
			bottom: 0;
			width: 100%;
			height: 52px;
			justify-content: space-evenly;
			border-top: 1px solid rgb(37, 37, 37);
		}
	}

	@media screen and (min-width: 800px) {
		.sidebar {
			padding-top: 50px;
			border-right: 1px solid rgb(37, 37, 37);
			position: fixed;
			height: 100%;
			width: 52px;
			flex-direction: column;
			gap: 35px;

			:nth-child(1)::after {
				content: "";
				position: absolute;
				width: 52px;
				height: 52px;
				border-bottom: 1px solid rgb(37, 37, 37);
			}
		}
	}
</style>
