<script lang="ts">
	import { api } from "../../api";
	import ClickOutside from "svelte-click-outside";
	import type { ChatMessage } from "../../channels";
	export let message: ChatMessage;
	export let side: "left" | "right";
	export let last: boolean;
	export let one_above: boolean;
	export let channel: string;

	let defaultWidth: number;
	let defaultHeight: number;

	let display_options = false;
	let removing_options = false;

	$: if (message.value == null) {
		display_options = false;
	}

	function contextMenu() {
		if (message.value != null && side == "right") {
			removing_options = false;
			display_options = true;
		}
	}

	function removeOptions() {
		setTimeout(() => {
			display_options = false;
		}, 200);
		removing_options = true;
	}

	async function deleteMessage() {
		if (message.value != null) {
			return api.deleteMessage(channel, message.id);
		}
	}
</script>

<div
	class="bubble {side}"
	class:last={!last}
	class:one-above={one_above}
	class:pending={!message.confirmed}
	class:red={display_options}
	class:no-pre-wrap={display_options}
	class:deleted={message.value == null}
	on:contextmenu|preventDefault={contextMenu}
>
	{#if !display_options}
		<div
			class="message"
			class:deleted={message.value == null}
			bind:clientWidth={defaultWidth}
			bind:clientHeight={defaultHeight}
		>
			{#if message.value != null}
				{message.value}
			{:else}
				{"This message was deleted"}
			{/if}
		</div>
	{:else}
		<ClickOutside on:clickoutside={removeOptions}>
			<div
				class="options"
				class:bye={removing_options}
				style="width: {defaultWidth}px; height: {defaultHeight}px;"
			>
				<div class="inner" on:click={async () => await deleteMessage()}>
					Delete ?
				</div>
			</div>
		</ClickOutside>
	{/if}
</div>

<style lang="scss">
	.bubble {
		user-select: text;
		-webkit-user-select: text;
		word-break: break-word;
		word-wrap: break-word;
		white-space: pre-wrap;
		hyphens: auto;
		position: relative;
		width: auto;
		padding: 16px;
		padding-top: 12px;
		padding-bottom: 12px;
		border-radius: 30px;
		max-width: 400px;
		line-height: 22px;
		margin-top: 3px;
		margin-bottom: 3px;

		&.deleted {
			opacity: 0.8;
		}

		.message.deleted {
			color: rgb(200, 200, 200);
		}

		&.no-pre-wrap {
			white-space: normal;
		}

		&.left {
			background: #272727;
			margin-left: 50px;
			border-bottom-left-radius: 0;
			&.one-above {
				border-top-left-radius: 0;
			}
		}

		&.right {
			margin-left: auto;
			background: #2183c4;
			border-bottom-right-radius: 0;
			&.one-above {
				border-top-right-radius: 0;
			}

			&.pending {
				background: rgb(46, 46, 46);
			}

			&.red {
				background-color: red;
			}
		}
	}

	@keyframes optionspawn {
		from {
			min-width: 0;
			min-height: 0;
		}
		to {
			min-width: 100px;
			min-height: 50px;
		}
	}

	@keyframes optionkill {
		from {
			min-width: 100px;
			min-height: 50px;
		}
		to {
			min-width: 0;
			min-height: 0;
		}
	}

	.options {
		user-select: none;
		-webkit-user-select: none;
		animation: optionspawn 0.2s ease-in-out;
		min-width: 100px;
		min-height: 50px;
		height: 100%;
		width: 100%;

		&.bye {
			animation: optionkill 0.2s ease-in-out;
			min-width: 0;
			min-height: 0;
		}

		.inner {
			display: grid;
			place-items: center;
			overflow: hidden;
			width: 100%;
			height: 100%;
			border-radius: 10px;
			transition: background-color 0.03s;

			&:hover {
				background-color: rgb(202, 0, 0);
			}

			&:active {
				background-color: rgb(167, 0, 0);
			}
		}
	}
</style>
