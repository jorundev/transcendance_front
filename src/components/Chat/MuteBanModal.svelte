<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { Channel, ChannelUser } from "../../channels";
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

	let channelUser: ChannelUser;
	$: channelUser = channel.users.find((usr) => usr.uuid == userUUID);

	let user: User;
	$: {
		api.getUserData(userUUID).then((u) => {
			if (u !== null && u !== APIStatus.NoResponse) {
				user = u;
			}
		});
	}

	let dispatch = createEventDispatcher();

	function takeEffect() {
		if (mode === "ban") {
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
