<script lang="ts">
	import { api, APIStatus } from "../../api";
	import { createEventDispatcher, onMount } from "svelte";
	import { stChannels, stLoggedUser, stToast } from "../../stores";
	import ChannelSettingsProfile from "./ChannelSettingsProfile.svelte";
	import Button from "../Kit/Button.svelte";
	import Card from "../Kit/Card.svelte";
	import { ChannelType, type Channel } from "../../channels";
	import { pop } from "svelte-spa-router";
	import ClickOutside from "svelte-click-outside";

	export let channel: Channel;

	let require_password = channel.has_password;
	let password: string = "";

	let avatarPromise = Promise.resolve(
		getProfilePictureLinkFrom(channel.avatar)
	);
	let currentAvatar = "";

	let drag = false;

	let blacklisted_users = [];

	$: {
		blacklisted_users = [...channel.banned_users];
		for (const muted of channel.muted_users) {
			if (
				!blacklisted_users
					.map((u) => u.user.uuid)
					.includes(muted.user.uuid)
			) {
				blacklisted_users.push(muted);
			}
		}
	}

	$: if (!require_password) {
		password = "";
		passerr = "";
	}

	let dispatch = createEventDispatcher();
	let is_moderator = false;
	let is_administrator = false;

	let canClickOutside = false;

	let passerr = "";

	function getProfilePictureLinkFrom(from: string | null): string {
		return from ? "/pictures/" + from : "/img/default.jpg";
	}

	async function uploadFile(file: File) {
		if (
			![
				"image/png",
				"image/jpeg",
				"image.apng",
				"image/gif",
				"image/webp",
			].includes(file.type)
		) {
			return;
		}

		const pm = api.changeChannelAvatar(file, channel.uuid);
		avatarPromise = pm.then((obj) => {
			if (
				obj !== null &&
				obj !== APIStatus.NoResponse &&
				(obj as any).statusCode !== 413
			) {
				return getProfilePictureLinkFrom(obj.avatar);
			}
		});
		const res = await pm;
		if (res === null || res === APIStatus.NoResponse) {
			return;
		}
		if (res.statusCode === 413) {
			stToast.set("Error: Image is too large");
			avatarPromise = Promise.resolve(
				getProfilePictureLinkFrom(channel.avatar)
			);
			return;
		}
	}

	onMount(() => {
		setTimeout(() => (canClickOutside = true), 200);
	});

	$: is_moderator = channel.moderators.includes($stLoggedUser?.uuid);
	$: is_administrator = channel.administrator === $stLoggedUser?.uuid;

	function changePassword() {
		api.setChannelPassword(
			channel.uuid,
			password.length != 0 ? password : undefined
		);
		$stChannels[channel.uuid].has_password = password.length != 0;
		password = "";
	}

	function destroyChannel() {
		if (destroyChannelText === "Destroy channel") {
			destroyChannelText = "Are you sure ?";
			return;
		}
		api.deleteChannel(channel.uuid);
	}

	function checkPassword() {
		passerr = "";
		if (password?.length > 100) {
			passerr = "Passwords are limited to 100 characters";
		}
	}

	let destroyChannelText = "Destroy channel";
</script>

<ClickOutside
	on:clickoutside={() => {
		if (canClickOutside) dispatch("back");
	}}
>
	<div class="card">
		<Card>
			<div class="settings">
				<div class="title">Settings for {channel.name}</div>
				<div class="category">
					<div class="member-lists">
						<div class="members">
							<div class="category-name">Members</div>
							<div class="profiles">
								{#each channel.users as user}
									<ChannelSettingsProfile
										{user}
										channel={channel.uuid}
										is_in_channel={channel.users
											.map((u) => u.uuid)
											.includes(user.uuid)}
										{is_moderator}
										{is_administrator}
										on:ban
										on:mute
									/>
								{/each}
							</div>
						</div>
						{#if is_moderator || is_administrator}
							<div class="members">
								<div class="category-name">Blacklist</div>
								{#if blacklisted_users?.length > 0}
									<div class="profiles">
										{#each blacklisted_users as blacklisted}
											<ChannelSettingsProfile
												user={blacklisted.user}
												channel={channel.uuid}
												is_in_channel={channel.users
													.map((u) => u.uuid)
													.includes(
														blacklisted.user.uuid
													)}
												{is_moderator}
												{is_administrator}
												banned={channel.banned_users
													.map((u) => u.user.uuid)
													.includes(
														blacklisted.user.uuid
													)}
												muted={channel.muted_users
													.map((u) => u.user.uuid)
													.includes(
														blacklisted.user.uuid
													)}
												on:ban
												on:mute
											/>
										{/each}
									</div>
								{:else}
									<div class="no-blacklist">
										No users were banned or muted
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
				<div class="category">
					<div class="category-name">General</div>
					<Button
						red
						timeoutVisible
						timeout={2000}
						on:click={async () => {
							await api.leaveChannel(channel.uuid);
							if (channel.type === ChannelType.Private) {
								stChannels.update((channels) => {
									delete channels[channel.uuid];
									return channels;
								});
							}
							if (window.innerWidth <= 800) {
								pop();
								return;
							}
							dispatch("back");
						}}
					>
						{#if channel.users.length == 1}
							Leave and destroy channel
						{:else}
							Leave channel
						{/if}
					</Button>
				</div>
				{#if is_administrator}
					<div class="category">
						<div class="category-name">Password</div>
						<div class="require-password">
							<input
								bind:checked={require_password}
								type="checkbox"
								disabled={channel.type === ChannelType.Private}
							/>
							<label for="checkbox">Require password</label>
						</div>
						<input
							bind:value={password}
							type="password"
							disabled={!require_password}
							placeholder="Channel password"
							on:input={checkPassword}
							on:blur={checkPassword}
						/>
						{#if passerr.length > 0 && require_password}
							<div style="color: red">{passerr}</div>
						{/if}
						{#if (passerr.length === 0 && password?.length != 0) || (!require_password && channel.has_password)}
							<Button on:click={changePassword}
								>Change password</Button
							>
						{/if}
					</div>
					<div class="category">
						<div class="category-name">Channel Avatar</div>
						<div class="avatar">
							{#await avatarPromise}
								<div
									class="loading"
									style={"background-image: url('" +
										currentAvatar +
										"');"}
								/>
							{:then data}
								<div
									class="inner"
									class:drag
									style={"background-image: url('" +
										data +
										"')"}
									on:click={() => {
										let input =
											document.createElement("input");
										input.type = "file";
										input.click();

										input.onchange = (e) => {
											e.preventDefault();
											if (input.files?.length === 1) {
												uploadFile(input.files[0]);
											}
										};
									}}
									on:dragenter={() => (drag = true)}
									on:dragexit={() => (drag = false)}
									on:dragover|preventDefault={() => {}}
									on:drop|preventDefault={(e) => {
										if (
											e.dataTransfer?.items?.length === 1
										) {
											uploadFile(
												e.dataTransfer.items[0].getAsFile()
											);
										}

										drag = false;
									}}
									on:change={(e) => console.log(e)}
								/>
							{/await}
						</div>
						<div class="desc">
							Supported formats: webp, png, apng, jpeg, gif
						</div>
					</div>
					<div class="category">
						<div class="category-name">Administrator</div>
						<Button
							red
							timeoutVisible
							timeout={2000}
							on:click={destroyChannel}
							>{destroyChannelText}</Button
						>
					</div>
				{/if}
				<Button
					on:click={() => {
						dispatch("back");
					}}>Back</Button
				>
			</div>
		</Card>
	</div>
</ClickOutside>

<style lang="scss">
	@keyframes pulse {
		0% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.6;
		}
	}

	.settings {
		min-width: 250px;
		display: inline-block;
	}

	.title {
		font-size: 22px;
		margin-bottom: 16px;
	}

	.category {
		display: flex;
		flex-direction: column;
		justify-content: left;
		gap: 10px;
		margin-bottom: 16px;
	}

	.no-blacklist {
		font-size: 14px;
		min-height: 60px;
		width: 100%;
		padding: 10px;
		padding-left: 20px;
		padding-right: 20px;
		display: grid;
		place-items: center;
		height: 100%;
		background: rgb(18, 18, 18);
		border-radius: 18px;
		box-sizing: border-box;
	}

	.profiles {
		display: flex;
		flex-direction: column;
		gap: 10px;
		overflow-y: auto;
	}

	.members {
		width: auto;
		flex-shrink: 0;
		flex-grow: 1;
		max-height: 500px;
		display: flex;
		flex-direction: column;
		gap: 10px;

		@media screen and (max-height: 1000px) {
			max-height: 300px;
		}

		@media screen and (max-height: 800px) {
			max-height: 300px;
		}

		@media screen and (max-height: 760px) {
			max-height: 100px;
		}
	}

	.card {
		margin: 20px;
	}

	.member-lists {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		justify-content: center;
	}

	input[type="password"] {
		font-size: 14px;
		width: calc(100% - 40px);
		height: 40px;
		line-height: 40px;
		background: #313131;
		border: none;

		color: #d8d7d2;
		resize: none;
		border-radius: 20px;

		padding-right: 20px;
		padding-left: 20px;

		&::placeholder {
			color: rgb(91, 91, 91);
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

	.desc {
		text-align: center;
		color: rgb(130, 142, 167);
		padding-bottom: 24px;
	}

	.require-password {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	input[type="checkbox"] {
		display: grid;
		place-content: center;
		-webkit-appearance: none;
		appearance: none;
		margin: 0;
		background-color: rgb(48, 48, 48);

		width: 20px;
		height: 20px;

		&:checked {
			background: #0d6ac7;

			&:before {
				content: "";
				width: 14px;
				height: 14px;
				background: #0b82fa;
			}
		}

		&:disabled,
		&:disabled + label {
			opacity: 0.5;
		}
	}

	.avatar {
		width: 100%;
		display: flex;
		justify-content: center;
		margin-top: 18px;
		margin-bottom: 18px;

		.loading {
			animation: pulse 1.2s 0.3s ease-in-out infinite;
		}

		.inner {
			&.drag {
				outline: 5px dashed rgb(255, 255, 255);
			}
		}

		.inner,
		.loading {
			position: relative;
			flex-shrink: 0;
			width: 120px;
			height: 120px;
			border-radius: 100%;
			background-size: cover;
			background-position: center;

			&:hover:not(.loading)::after {
				content: "";
				cursor: pointer;
				position: absolute;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.4);
				background-image: url("/img/photo.png");
				background-position: center;
				background-repeat: no-repeat;
				background-size: 40%;
				border-radius: 100%;
			}
		}
	}
</style>
