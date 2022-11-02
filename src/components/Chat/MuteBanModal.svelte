<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { Channel } from "../../channels";
	import Button from "../Kit/Button.svelte";
	import Card from "../Kit/Card.svelte";
	import DurationPicker from "../Kit/DurationPicker.svelte";
	import Modal from "../Kit/Modal.svelte";
	import ClickOutside from "svelte-click-outside";
	import { onMount } from "svelte";
	import type { User } from "../../users";
	import { api, APIStatus } from "../../api";

	export let userUUID: string;
	export let channel: Channel;
	export let mode: "ban" | "mute";

	let time: number;
	let canGoBack = false;

	let title = "";
	$: title = mode[0].toUpperCase() + mode.substring(1);

	let user: User;
	$: {
		api.getUserData(userUUID).then((u) => {
			if (u !== null && u !== APIStatus.NoResponse) {
				user = u;
			}
		});
	}

	let dispatch = createEventDispatcher();

	async function takeEffect() {
		if (mode === "ban") {
			await api.banUserFromChannel(userUUID, channel.uuid, time);
			console.log("Banned user for " + time + " seconds");
			dispatch("ban");
		} else if (mode === "mute") {
			await api.muteUserFromChannel(userUUID, channel.uuid, time);
			console.log("Muted user for " + time + " seconds");
			dispatch("mute");
		}
	}

	onMount(() => {
		setTimeout(() => (canGoBack = true), 200);
	});
</script>

<Modal>
	<div class="card">
		<div class="inner">
			<Card>
				<ClickOutside
					on:clickoutside={() => {
						if (canGoBack) {
							dispatch("back");
						}
					}}
				>
					<div class="title">{title} {user?.username}?</div>
					<DurationPicker on:time={(e) => (time = e.detail)} />
					<div class="buttons">
						<Button
							highlight={false}
							on:click={() => {
								if (canGoBack) {
									dispatch("back");
								}
							}}>Back</Button
						>
						<Button red on:click={takeEffect}>{title}</Button>
					</div>
				</ClickOutside>
			</Card>
		</div>
	</div>
</Modal>

<style lang="scss">
	.card {
		display: grid;
		height: 100%;
		place-content: center;

		.inner {
			display: flex;
			flex-direction: column;
			min-width: 300px;
		}

		.buttons {
			min-width: 400px;
			display: flex;
			gap: 10px;
			margin-top: 16px;
		}

		.title {
			margin-bottom: 6px;
			font-size: large;
		}
	}
</style>
