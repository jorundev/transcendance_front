<script lang="ts">
	import { api, APIStatus, type Session as SessionData } from "../api";
	import { pop } from "svelte-spa-router";
	import { stLoggedUser } from "../stores";
	import SideBar from "../components/SideBar.svelte";
	import { onMount } from "svelte";
	import Session from "../components/Session.svelte";

	let innerWidth = 0;

	let active_sessions: Array<SessionData> = [];
	let inactive_sessions: Array<SessionData> = [];

	async function reloadSessions() {
		const res = await api.getSessions();
		if (res == APIStatus.NoResponse) {
			return;
		}
		inactive_sessions = res.data.filter((session) => !session.active);
		active_sessions = res.data.filter((session) => session.active);
	}

	onMount(async () => {
		await reloadSessions();
	});
</script>

<svelte:window bind:innerWidth />
<svelte:head>
	<title>Sessions - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
{#if $stLoggedUser != null}
	<SideBar active="settings" />
	<div class="s">
		<div class="settings">
			<div class="top">
				<div
					class="back"
					on:click={() => {
						pop();
					}}
				/>
				<div class="title">Sessions</div>
				<div class="empty" style="width: 40px;" />
			</div>
			<div class="sessions">
				<div class="category">Active sessions</div>
				{#each active_sessions as session (session.uuid)}
					<Session
						{session}
						on:kill={async () => await reloadSessions()}
					/>
				{/each}
				<div class="category">Inactive sessions</div>
				{#each inactive_sessions as session (session.uuid)}
					<Session {session} />
				{/each}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.s {
		display: flex;
		justify-content: center;
	}

	.settings {
		user-select: none;
		-webkit-user-select: none;
		width: 100%;
		display: flex;
		flex-direction: column;
		max-width: 1200px;
		padding-top: 10px;
	}

	.title {
		user-select: none;
		-webkit-user-select: none;
		margin-top: 10px;
		margin-bottom: 16px;
		text-align: center;
		font-size: 18px;
	}

	.top {
		display: flex;
		justify-content: space-between;
	}

	.back {
		cursor: pointer;
		width: 40px;
		height: 40px;
		background-image: url("/img/left.png");
		background-size: 50%;
		background-position: center;
		background-repeat: no-repeat;
	}

	.category {
		margin-left: 10px;
		margin-right: 10px;
		margin-top: 4px;
		user-select: none;
		-webkit-user-select: none;
		transform: translateX(-16px);
		padding: 8px;
		padding-left: 16px;
		color: rgb(94, 94, 94);
		font-size: 14px;
		width: 100%;
		background: rgb(29, 29, 29);
		font-weight: bold;
		text-transform: uppercase;
	}

	@media screen and (min-width: 800px) {
		.settings {
			padding-left: 59px;
			padding-top: 20px;
			max-width: none;
			border-right: 1px solid rgb(40, 40, 40);
			height: 100vh;
		}
		.title {
			margin-bottom: 10px;
			margin-left: 10px;
			font-size: 28px;
		}
		.category {
			margin-top: 20px;
			margin-bottom: 10px;
			padding-top: 20px;
			border-top: 1px solid rgb(40, 40, 40);
			background: transparent;
			text-transform: none;
			color: white;
			font-size: 24px;
		}
		.top {
			justify-content: left;
			align-items: center;
		}
	}
</style>
