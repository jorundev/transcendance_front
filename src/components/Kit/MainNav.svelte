<script lang="ts">
	import { push } from "svelte-spa-router";

	export let current: "home" | "game" | "chat";
	let unread = true;

	function propagateClick(new_current: string) {
		switch (new_current) {
			case "home":
				push("/");
				break;
			case "game":
				push("/game-type");
				break;
			case "chat":
				push("/chat");
				break;
		}
	}
</script>

<div class="nav">
	<div
		class="nav-element home"
		class:current={current == "home"}
		on:click={() => {
			propagateClick("home");
		}}
	/>
	<div
		class="nav-element game"
		class:current={current == "game"}
		on:click={() => {
			propagateClick("game");
		}}
	/>
	<div
		class="nav-element chat"
		class:current={current == "chat"}
		class:unread
		on:click={() => {
			propagateClick("chat");
		}}
	/>
</div>

<style lang="scss">
	.nav {
		position: fixed;
		background: rgb(40, 40, 42);
		width: 210px;
		height: 60px;
		border-radius: 40px;

		left: 50%;
		transform: translateX(-50%);
		bottom: 40px;

		display: flex;
		align-items: center;
		justify-content: space-evenly;

		.nav-element {
			width: 50px;
			height: 50px;
			background-size: 50%;
			background-position: center;
			background-repeat: no-repeat;
			border-radius: 100%;
			filter: invert(0.2);

			&.home {
				background-image: url("/img/home.png");
			}

			&.chat {
				background-image: url("/img/bubbles.png");

				&.unread::after {
					content: "";
					display: block;
					border-radius: 100%;
					position: absolute;
					right: 6px;
					top: 6px;
					width: 16px;
					height: 16px;
					background: rgb(255, 98, 0);
				}
			}

			&.game {
				background-image: url("/img/play.png");
			}

			&.current {
				background-color: #464648;
			}

			&:not(.current):hover {
				background-color: #000000;
				cursor: pointer;
			}
		}
	}

	@media screen and (min-width: 800px) {
		.nav {
			position: initial;
			transform: none;
			left: 0;
			width: 60px;
			border-radius: 0;
			flex-direction: column;
			flex-shrink: 0;
			width: 70px;
			padding-top: 70px;
			height: 100vh;
			justify-content: left;
			gap: 40px;
		}
	}
</style>
