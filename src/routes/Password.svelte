<script lang="ts">
	import { pop } from "svelte-spa-router";

	import { stLoggedUser } from "../stores";
	import SideBar from "../components/SideBar.svelte";
	import Button from "../components/Kit/Button.svelte";
	import { api, APIStatus } from "../api";

	let innerWidth = 0;
	let errorTextTop = "";
	let errorTextBottom = "";
	let successText = "";

	let currentPassword = "";
	let newPassword = "";
	let newPasswordConfirm = "";

	async function validate() {
		errorTextTop = "";
		errorTextBottom = "";
		successText = "";

		let retEarly = false;
		if (currentPassword.length === 0) {
			errorTextTop = "Please input your current password";
			retEarly = true;
		}
		if (newPassword.length === 0) {
			errorTextTop = "New password cannot be empty";
			retEarly = true;
		}
		if (newPassword !== newPasswordConfirm) {
			errorTextBottom = "Passwords do not match";
			newPassword = "";
			newPasswordConfirm = "";
			retEarly = true;
		}
		if (newPassword === currentPassword) {
			errorTextBottom =
				"New password cannot be identical to old password";
			newPassword = "";
			newPasswordConfirm = "";
			retEarly = true;
		}
		if (retEarly) {
			return;
		}

		const res = await api.changePassword(
			currentPassword,
			newPassword,
			newPasswordConfirm
		);
		if (res === null || res === APIStatus.NoResponse) {
			errorTextTop = "Invalid response from the server";
			return;
		}
		if (res.statusCode === 200) {
			currentPassword = "";
			newPassword = "";
			newPasswordConfirm = "";
			successText = "Password changed successfuly";
			return;
		}
		switch (res.message) {
			case "Password mismatch":
				errorTextTop = "Invalid password";
				break;
			default:
				errorTextBottom = res.message;
				break;
		}
	}
</script>

<svelte:window bind:innerWidth />
<svelte:head>
	<title>Password - NEW SHINJI MEGA PONG ULTIMATE</title>
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
				<div class="title">Password</div>
				<div class="empty" style="width: 40px;" />
			</div>
			<div class="category">Change password</div>
			<div class="change">
				<input
					class="current"
					type="password"
					placeholder="Current password"
					bind:value={currentPassword}
				/>
				{#if errorTextTop.length !== 0}
					<div style="color: red;">{errorTextTop}</div>
				{/if}
				<div class="sep" />
				<input
					type="password"
					placeholder="New password"
					bind:value={newPassword}
				/>
				<input
					type="password"
					placeholder="Confirm new password"
					bind:value={newPasswordConfirm}
				/>
				{#if errorTextBottom.length !== 0}
					<div style="color: red;">{errorTextBottom}</div>
				{/if}
				{#if successText.length !== 0}
					<div style="color: green;">{successText}</div>
				{/if}
				<div class="button">
					<Button
						on:click={validate}
						active={currentPassword.length > 0 &&
							newPassword.length > 0 &&
							newPasswordConfirm.length > 0}
						>Change password</Button
					>
				</div>
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

	.change {
		position: relative;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;

		.sep {
			margin-left: 24px;
			margin-right: 24px;
			border-bottom: 1px solid rgb(57, 57, 57);
		}
	}

	input[type="password"] {
		font-size: 14px;
		width: calc(100% - 40px);
		height: 40px;
		line-height: 40px;
		background: rgb(38, 40, 42);
		border: none;

		color: #d8d7d2;
		resize: none;
		border-radius: 20px;

		padding-right: 20px;
		padding-left: 20px;

		&::placeholder {
			color: rgb(102, 100, 96);
		}

		&:focus {
			background: #282828;
			outline: none;
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 0.3;
			background: rgb(104, 104, 104);
			&::placeholder {
				color: rgb(117, 117, 117);
			}
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
		.top {
			display: flex;
			justify-content: left;
			align-items: center;
		}

		.change {
			max-width: 400px;
			padding-top: 0;
		}
	}
</style>
