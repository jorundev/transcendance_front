<script lang="ts">
	import { api } from "../api";

	import { pop, push } from "svelte-spa-router";

	import { stLoggedUser } from "../stores";
	import SideBar from "../components/SideBar.svelte";
	
	let innerWidth = 0;

	function getProfilePictureLink(): string {
		return $stLoggedUser && $stLoggedUser.avatar
			? "/pictures/" + $stLoggedUser.avatar
			: "/img/default.jpg";
	}
</script>

<svelte:window bind:innerWidth />
<svelte:head>
	<title>Settings - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
{#if $stLoggedUser != null}
	<SideBar active="settings"/>
	<div class="s">
		<div class="settings">
			<div class="top">
				{#if innerWidth < 800}
				<div
					class="back"
					on:click={() => {
						pop();
					}}
				/>
				{/if}
				<div class="title">Settings</div>
				<div class="empty" style="width: 40px;" />
			</div>
			<div class="category">Account</div>
			<div class="setting profile" on:click={() => push("/settings/profile")}>
				<div
					class="before"
					style={"background-image: url('" +
						getProfilePictureLink() +
						"')"}
				/>
				{$stLoggedUser?.username}
			</div>
			<div
				class="setting"
				on:click={() => {
					api.logout();
				}}
				style="color: red"
			>
				Log out
			</div>
			<div class="category">Security</div>
			<div class="setting" on:click={() => push("/settings/password")}>Password</div>
			<div class="setting" on:click={() => push("/settings/2fa")}>Two-Factor Authentication</div>
			<div class="setting" on:click={() => push("/settings/sessions")}>Sessions</div>
			<div class="category">Activity</div>
			<div class="setting">Blocked accounts</div>
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

	.setting {
		cursor: pointer;
		margin-left: 10px;
		margin-right: 10px;
		display: flex;
		align-items: center;
		padding-top: 16px;
		padding-bottom: 16px;
		transform: translateX(-16px);
		padding-left: 16px;
		width: 100%;

		.before {
			flex-shrink: 0;
			background-size: 30px;
			background-repeat: no-repeat;
			border-radius: 100%;
			margin-right: 8px;
			width: 30px;
			height: 30px;
		}

		&.profile {
			padding-top: 9px;
			padding-bottom: 9px;
		}

		&:hover {
			background-color: #202020;
		}
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
		.setting {
			font-size: 18px;
			
			&:hover {
				background-color: rgb(22, 24, 28);
			}
		}
		.top {
			display: flex;
			justify-content: left;
			align-items: center;
		}
	}
</style>
