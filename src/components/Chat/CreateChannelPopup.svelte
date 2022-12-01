<script lang="ts">
	import { api, APIStatus, ChannelVisibility } from "../../api";
	import { createEventDispatcher } from "svelte";
	import Button from "../Kit/Button.svelte";
	import Card from "../Kit/Card.svelte";
	import { onMount } from "svelte";
	import ClickOutside from "svelte-click-outside";
	import { stChannels } from "../../stores";

	let dispatch = createEventDispatcher();

	let has_password = false;
	let has_password_cache = false;
	let error = "";

	let channel_value: string = "";
	let password_value: string = "";

	let channel_type: "public" | "private" = "public";

	$: {
		if (!has_password) {
			password_value = "";
		}
	}
	
	let canClickOutside = false;
	
	onMount(() => {
		setTimeout(() => canClickOutside = true, 200);
	});

	function setPasswordCache() {
		has_password_cache = has_password;
	}

	async function createChannel(): Promise<string | null> {
		let visibility =
			channel_type == "public"
				? ChannelVisibility.Public
				: ChannelVisibility.Private;
		const resp = await api.createChannel(
			visibility,
			channel_value,
			password_value.length > 0 ? password_value : undefined
		);

		if (resp === null || resp == APIStatus.NoResponse) {
			return null;
		}

		if (resp.statusCode == 400) {
			error = resp.message;
		}

		for (let i = 0; i < 10; ++i) {
			await new Promise((resolve) => setTimeout(resolve, 150));
			if ($stChannels[resp.uuid] !== undefined && $stChannels[resp.uuid].joined) {
				break ;
			}
		}

		return resp.uuid;
	}
	
	$: console.log(error);
	
	function checkChannelName() {
		if (channel_value.length > 32) {
			error = "Channel names are limited to 32 characters";
			return ;
		}
		
		const validCharacters: Array<string> = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789"];
		
		if ([...channel_value].filter((c) => !validCharacters.includes(c)).length > 0) {
			error = "Channel names are limited to alphanumerical characters and underscores";
			return ;
		}
		
		error = "";
	}

	$: {
		if (channel_type === "private") {
			setPasswordCache();
			has_password = true;
		} else if (channel_type === "public") {
			has_password = has_password_cache;
		}
	}
</script>

<div class="csp">
	<ClickOutside on:clickoutside={() => {
		if (canClickOutside) dispatch("back");
	}}>
	<Card>
		<div class="title">Create channel</div>
		<div class="body">
			<div class="visib">
				<input
					bind:group={channel_type}
					type="radio"
					name="visibility"
					id="public"
					value="public"
					checked={true}
				/>
				<label for="public">Public</label>
				<input
					bind:group={channel_type}
					type="radio"
					name="visibility"
					id="private"
					value="private"
				/>
				<label for="private">Private</label>
			</div>
			<div class="password">
				<input
					disabled={channel_type === "private"}
					type="checkbox"
					id="password"
					bind:checked={has_password}
				/>
				<label for="password">Require a password</label>
			</div>
			<input
				type="text"
				placeholder="Channel Name"
				bind:value={channel_value}
				on:input={checkChannelName}
				on:blur={checkChannelName}
			/>
			{#if error.length > 0}
				<div style="color: red; padding-bottom: 16px; max-width: 400px;">{error}</div>
			{/if}
			<input
				type="password"
				placeholder="Password"
				bind:value={password_value}
				disabled={!has_password}
			/>
			<div class="buttons">
				<Button
					highlight={false}
					on:click={() => {
						dispatch("back");
					}}>Back</Button
				>
				<Button
					active={channel_value.length > 0 &&
						(!has_password || password_value.length > 0) && error.length === 0}
					timeoutVisible
					timeout={2000}
					on:click={async () => {
						if (
							channel_value.length > 0 &&
							(!has_password || password_value.length > 0)
						) {
							const uuid = await createChannel();
							if (uuid != null) {
								dispatch("create", { uuid });
							}
						}
					}}>Create</Button
				>
			</div>
		</div>
	</Card>
	</ClickOutside>
</div>

<style lang="scss">
	.csp {
		min-width: 400px;
	}

	.title {
		font-size: 22px;
		margin-bottom: 20px;
	}

	.body {
		display: flex;
		flex-direction: column;
	}

	input[type="text"],
	input[type="password"] {
		font-size: 14px;
		width: calc(100% - 40px);
		height: 40px;
		line-height: 40px;
		background: #313131;
		border: none;
		margin-bottom: 16px;
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

	.visib {
		display: flex;
		width: 100%;
		margin-bottom: 18px;
		gap: 10px;

		label {
			width: 100%;
			text-align: center;
			user-select: none;
			-webkit-user-select: none;
			display: block;
		}
	}

	input[type="radio"] {
		display: none;

		+ label {
			background: rgb(48, 48, 48);
			padding: 10px;
			border-radius: 10px;
		}

		&:checked + label {
			background: #0b82fa;
		}
	}

	.buttons {
		display: flex;
		gap: 6px;
	}

	.password {
		user-select: none;
		-webkit-user-select: none;
		display: flex;
		justify-content: center;
		gap: 10px;
		line-height: 20px;
		margin-bottom: 16px;

		* {
			cursor: pointer;
		}

		input {
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
	}
</style>
