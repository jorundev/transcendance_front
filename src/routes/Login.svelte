<script lang="ts">
	import { stLoggedUser, stServerDown, stToast } from "../stores";
	import { onMount } from "svelte";
	import { push, replace } from "svelte-spa-router";
	import Modal from "../components/Kit/Modal.svelte";
	import Card from "../components/Kit/Card.svelte";
	import Button from "../components/Kit/Button.svelte";
	import ClickOutside from "svelte-click-outside";

	let availableConnexionMethods: Array<string> = [];

	function isError(obj: Response | string): obj is string {
		return obj === "error";
	}

	$: if ($stLoggedUser !== null) {
		replace("/");
	}

	let oauthErrorModal = false;

	onMount(async () => {
		if (window.location.hash === "#/login/oauth-error") {
			oauthErrorModal = true;
			console.log(
				"Connection method unavailable. If you are the developer, this means your OAuth token is invalid or has expired"
			);
		}
		if ($stLoggedUser === null) {
			const res = await fetch("/api/auth/available").catch(() => {
				return "error";
			});
			if (!isError(res)) {
				try {
					availableConnexionMethods = await res.json();
				} catch (e) {
					stServerDown.set(true);
				}
			}
		}
	});
</script>

<svelte:head>
	<title>Login - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
{#if oauthErrorModal}
	<Modal>
		<div class="modal">
			<ClickOutside on:clickoutside={() => replace("/login")}>
				<div class="oauth-error">
					<Card>
						<div class="title">Error</div>
						<div class="desc">
							This connection method is unavailable for now
						</div>
						<Button on:click={() => replace("/login")}>Ok</Button>
					</Card>
				</div>
			</ClickOutside>
		</div>
	</Modal>
{/if}
<div class="login">
	<div class="sub">
		<h1>Hello.</h1>
		<div class="login-squares">
			{#if availableConnexionMethods.includes("Intra42")}
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
			{/if}
			{#if availableConnexionMethods.includes("Discord")}
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
			{/if}
			{#if availableConnexionMethods.includes("Twitter")}
				<div
					class="login-square twitterblue"
					on:click={() => {
						window.location.href = "/api/auth/oauth2/twitter";
					}}
				>
					<div class="spinning">
						<div class="inner logotwitter" />
					</div>
					<div class="text">Log in with <b>Twitter</b></div>
				</div>
			{/if}
			{#if availableConnexionMethods.includes("Email")}
				<div
					class="login-square red"
					on:click={() => {
						push("/login/email");
					}}
				>
					<div class="spinning">
						<div class="inner logoemail" />
					</div>
					<div class="text">Log in with <b>e-mail</b></div>
				</div>
			{/if}
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
		position: absolute;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		height: 100%;
		justify-content: center;
		align-items: center;
	}

	.modal {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;

		.title {
			font-size: 20px;
		}
		.desc {
			margin-top: 14px;
			margin-bottom: 14px;
		}
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

		&.twitterblue {
			letter-spacing: -0.2px;
			background: rgb(79, 171, 241);
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
					background-image: url("/img/oauth/42.png");
				}

				&.logoemail {
					background-image: url("/img/oauth/mail.png");
				}

				&.logodiscord {
					background-image: url("/img/oauth/discord.svg");
				}

				&.logotwitter {
					background-image: url("/img/oauth/twitter.svg");
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
