<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { api, type Session } from "../api";
	import Button from "./Kit/Button.svelte";
	export let session: Session;

	let browser = "browser";
	let date = "";

	let dispatch = createEventDispatcher();

	$: date = new Date(session.creation_date).toLocaleString();

	$: {
		if (session.platform.includes("Firefox")) {
			browser = "firefox";
		} else if (session.platform.includes("Chrome")) {
			browser = "chrome";
		} else if (session.platform.includes("Chromium")) {
			browser = "chromium";
		} else if (session.platform.includes("Edge")) {
			browser = "edge";
		} else if (session.platform.includes("Opera")) {
			browser = "opera";
		} else if (session.platform.includes("Safari")) {
			browser = "safari";
		} else {
			browser = "browser";
		}
	}
</script>

<div class="session" class:inactive={!session.active}>
	<div class="info">
		<div class="browser-info">
			<div class="b">
				<div
					class="browser-icon"
					style={"flex-shrink:0;background-image: url('/img/browsers/" +
						browser +
						".png');"}
				/>
				<div class="info-text">
					<div class="title">{session.platform}</div>
					<div class="date">({date})</div>
				</div>
			</div>
			{#if session.current}
				<div class="badge">Current session</div>
			{/if}
		</div>
	</div>
	{#if session.active}
		<div class="button" class:nomobile={session.current}>
			<Button
				active={!session.current}
				red
				on:click={async () => {
					await api.killSession(session.uuid);
					dispatch("kill");
				}}>Revoke</Button
			>
		</div>
	{/if}
</div>

<style lang="scss">
	.session {
		display: flex;
		align-items: center;
		gap: 0.44ch;
		margin-top: 18px;
		margin-left: 18px;
		margin-right: 18px;
		background: rgb(20, 20, 20);
		padding: 20px;
		border-radius: 20px;

		&.inactive {
			opacity: 0.6;
		}

		.browser-info {
			display: flex;
			align-items: center;
		}

		.b {
			display: flex;
			align-items: center;
			gap: 16px;
		}

		.date {
			display: flex;
			align-items: center;
			color: rgb(103, 103, 103);
			font-size: 14px;
		}

		.title,
		.date {
			flex-shrink: 0;
		}

		.button {
			width: 100%;
			max-width: 200px;
			margin-left: auto;
			margin-right: 10px;
		}

		.info {
			display: flex;
			align-items: center;
			gap: 6px;

			.info-text {
				display: flex;
				gap: 6px;
			}
		}
	}
	.browser-icon {
		width: 40px;
		height: 40px;
		background-size: cover;
	}

	.badge {
		flex-shrink: 0;
		text-align: center;
		font-size: 14px;
		margin-right: 8px;
		margin-left: 8px;
		background: rgb(0, 44, 0);
		padding: 7px;
		border-radius: 100px;
		border: 1px solid rgb(0, 152, 0);
		color: rgb(0, 152, 0);
	}

	@media screen and (max-width: 799px) {
		.nomobile {
			display: none;
		}

		.session {
			gap: 30px;
			margin-bottom: 16px;
			justify-content: space-between;

			.button {
				max-width: 100px;
				margin-left: 0;
			}

			.info {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				width: 100%;
				gap: 6px;

				.browser-info {
					display: flex;
					justify-content: space-between;
					width: 100%;
				}

				.info-text {
					flex-direction: column;
					gap: 4px;
				}
			}
		}
	}
</style>
