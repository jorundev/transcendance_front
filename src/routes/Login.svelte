<script lang="ts">
	import { stLoggedUser } from "../stores";
	import { onMount } from "svelte";
	import { push, replace } from "svelte-spa-router";

	onMount(() => {
		if ($stLoggedUser != null) {
			replace("/");
		}
	});
</script>

<div class="login">
	<div class="sub">
		<h1>Hello.</h1>
		<div class="login-squares">
			<div
				class="login-square blue"
				on:click={() => {
					window.location.href = "/api/auth/oauth2/42";
				}}
			>
				<div class="spinning">
					<div class="inner logo42" />
				</div>
				<div class="text">Log in with <b>42</b></div>
			</div>
			<div
				class="login-square discordblue"
				on:click={() => {
					window.location.href = "/api/auth/oauth2/discord";
				}}
			>
				<div class="spinning">
					<div class="inner logodiscord" />
				</div>
				<div class="text">Log in with <b>Discord</b></div>
			</div>
			<div
				class="login-square red"
				on:click={() => {
					push("/login/username");
				}}
			>
				<div class="spinning">
					<div class="inner logoemail" />
				</div>
				<div class="text">Log in with <b>e-mail</b></div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	h1 {
		width: 100%;
		flex-shrink: 0;
		font-size: 32px;
		margin-bottom: 24px;
	}

	.login {
		display: flex;
		flex-wrap: wrap;
		height: 100%;
		justify-content: center;
		align-items: center;
	}

	.sub {
		transform: translateY(-56px);
	}

	.login-squares {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20px;
	}

	.login-square {
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		position: relative;
		width: 120px;
		height: 120px;
		text-align: center;
		padding: 10px;
		border-radius: 16px;
		font-size: 14px;

		&.red {
			background: #d0506e;
		}

		&.blue {
			background: rgb(0, 110, 218);
		}

		&.discordblue {
			letter-spacing: -0.2px;
			background: rgb(104, 118, 228);
		}

		@keyframes spinning {
			from {
				transform: translateY(-10px);
			}
			to {
				transform: translateY(0px);
			}
		}

		.spinning {
			transition: transform 200ms;

			/* Safari 11+ */
			@media not all and (min-resolution: 0.001dpcm) {
				@supports (-webkit-appearance: none) and
					(stroke-color: transparent) {
					/* Safari transitions are glitchy */
					/* You don't have to be like that, Safari */
					transition: transform 0ms;
				}
			}

			width: 72px;
			height: 60%;
			margin: 8px;

			.inner {
				width: 100%;
				height: 100%;
				animation: spinning 2s infinite alternate;
				animation-timing-function: ease-in-out;
				background-size: 100%;

				&.logo42 {
					background-image: url("/img/42.png");
				}

				&.logoemail {
					background-image: url("/img/mail.png");
				}

				&.logodiscord {
					background-image: url("/img/discord.svg");
				}
			}
		}

		&:hover .spinning {
			transition: transform 200ms;
			transform: rotate3d(0, 1, 0, 20deg) + rotate3d(1, 0, 0, 10deg) +
				rotate3d(0, 0, 1, -2deg) + scale(1.1);
		}

		.text {
			position: absolute;
			bottom: 10px;
		}
	}
	@media screen and (min-width: 800px) {
		.login-square {
			display: flex;
			align-items: center;
			width: 300px;
			height: 50px;
			padding-left: 20px;
			padding: 8px;

			.spinning {
				margin: 0;
				height: 100%;

				.inner {
					margin: 0;
					padding: 0;
					width: 50px;
					display: flex;
					animation: none;
				}
			}

			.text {
				position: relative;
				bottom: auto;
				font-size: 16px;
				padding-left: 10px;
			}
		}

		.login-squares {
			min-width: 100px;
			justify-content: center;
			flex-direction: column;
		}
	}
</style>
