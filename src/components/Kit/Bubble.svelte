<script lang="ts">
	import { stUsers } from "../../stores";
	import type { ChatMessage } from "../../channels";
	export let message: ChatMessage;
	export let side: "left" | "right";
	export let last: boolean;
	export let one_above: boolean;

	let reveal = false;
</script>

<div class="bubble {side}" class:last class:one-above={one_above}>
	{#if $stUsers[message.sender].is_blocked && !reveal}
		<div class="message blocked" on:click={() => (reveal = true)}>
			You have blocked this user. Click to reveal message
		</div>
	{:else}
		<div class="message">
			{message.value}
		</div>
	{/if}
</div>

<style lang="scss">
	.bubble {
		user-select: none;
		-webkit-user-select: none;
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

		.blocked {
			opacity: 0.5;
			cursor: pointer;
			color: rgb(179, 179, 179);
		}

		&.deleted {
			opacity: 0.8;
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
	}
</style>
