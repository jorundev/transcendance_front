<script lang="ts">
	import { api } from "../api";

	import { pop } from "svelte-spa-router";

	import { stLoggedUser } from "../stores";

	function getProfilePictureLink(): string {
		return $stLoggedUser && $stLoggedUser.profile_picture
			? "/pictures/" + $stLoggedUser.profile_picture
			: "/img/default.jpg";
	}
</script>

{#if $stLoggedUser != null}
	<div class="settings">
		<div class="top">
			<div
				class="back"
				on:click={() => {
					pop();
				}}
			/>
			<div class="title">Settings</div>
			<div class="empty" style="width: 40px;" />
		</div>
		<div class="category">Account</div>
		<div class="setting profile">
			<div
				class="before"
				style={"background-image: url('" +
					getProfilePictureLink() +
					"')"}
			/>
			{$stLoggedUser.username}
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
		<div class="setting">Password</div>
		<div class="setting">Two-Factor Authentication</div>
		<div class="category">Activity</div>
		<div class="setting">Blocked accounts</div>
	</div>
{/if}

<style lang="scss">
	.settings {
		width: 100%;
		display: flex;
		flex-direction: column;
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
		margin-top: 4px;
		user-select: none;
		-webkit-user-select: none;
		transform: translateX(-16px);
		padding: 8px;
		padding-left: 16px;
		color: rgb(94, 94, 94);
		font-size: 14px;
		width: calc(100vw - var(--scrollbar-width));
		background: rgb(29, 29, 29);
		font-weight: bold;
		text-transform: uppercase;
	}

	.setting {
		cursor: pointer;
		display: flex;
		align-items: center;
		padding-top: 16px;
		padding-bottom: 16px;
		transform: translateX(-16px);
		padding-left: 16px;
		width: calc(100vw - var(--scrollbar-width));

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
</style>
