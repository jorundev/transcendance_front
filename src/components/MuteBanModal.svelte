<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { Channel, ChannelUser } from "../stores";
	import Button from "./Kit/Button.svelte";
	import Card from "./Kit/Card.svelte";
	import DurationPicker from "./Kit/DurationPicker.svelte";
	import Modal from "./Kit/Modal.svelte";

	export let userUUID: string;
	export let channel: Channel;
	export let mode: "ban" | "mute";

	let time: number;

	let title = "";
	$: title = mode[0].toUpperCase() + mode.substring(1);

	let user: ChannelUser;
	$: user = channel.users.find((usr) => usr.uuid == userUUID);

	let dispatch = createEventDispatcher();

	function takeEffect() {
		if (mode === "ban") {
		}
	}
</script>

<Modal>
	<div class="card">
		<div class="inner">
			<Card>
				<div class="title">{title} {user.name}?</div>
				<DurationPicker on:time={(e) => (time = e.detail)} />
				<div class="buttons">
					<Button red on:click={takeEffect}>{title}</Button>
					<Button on:click={() => dispatch("back")}>Back</Button>
				</div>
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
			display: flex;
			gap: 10px;
		}

		.title {
			margin-bottom: 6px;
			font-size: large;
		}
	}

	input[type="number"] {
		background-color: rgb(33, 33, 33);
		color: white;
		border: none;
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		border-radius: 10px;
		margin-top: 10px;
		margin-bottom: 10px;

		&:focus {
			outline: none;
		}
	}
</style>
