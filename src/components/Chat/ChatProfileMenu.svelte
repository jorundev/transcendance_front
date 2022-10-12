<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import ClickOutside from "svelte-click-outside";

	export let uuid: string;
	export let moderator: boolean;
	export let administrator: boolean;
	export let user: { is_moderator: boolean; is_administrator: boolean };
	export let offsetY: number;

	let pxOffset = "0px";

	$: {
		if (offsetY + height + 68 > window.innerHeight) {
			pxOffset = window.innerHeight - (offsetY + height + 70) + "px";
		} else {
			pxOffset = "0px";
		}
	}

	$: if (user) {
		pxOffset = pxOffset;
	}

	let height = 0;

	let dispatch = createEventDispatcher();
</script>

<ClickOutside on:clickoutside={() => dispatch("back")}>
	<div
		class="cpm"
		bind:clientHeight={height}
		style="transform: translateY({pxOffset});"
	>
		{#if administrator || moderator}
			<div class="title noselect">User options</div>
		{/if}
		<div class="entry">Go to profile</div>
		<div class="entry">Invite to casual game</div>
		{#if (administrator || moderator) && !user?.is_administrator}
			<div class="title noselect">Moderator options</div>
			<div class="entry red" on:click={() => dispatch("mute", { uuid })}>
				Mute
			</div>
			<div class="entry red" on:click={() => dispatch("kick", { uuid })}>
				Kick
			</div>
			<div class="entry red" on:click={() => dispatch("ban", { uuid })}>
				Ban
			</div>
		{/if}
		{#if administrator}
			<div class="title red noselect">Administrator options</div>
			{#if user?.is_moderator}
				<div
					class="entry yellow"
					on:click={() => dispatch("demote", { uuid })}
				>
					Demote
				</div>
			{:else}
				<div
					class="entry yellow"
					on:click={() => dispatch("promote", { uuid })}
				>
					Promote
				</div>
			{/if}
		{/if}
	</div>
</ClickOutside>

<style lang="scss">
	.cpm {
		position: absolute;
		display: flex;
		left: 50px;
		top: -8px;
		z-index: 1;
		gap: 10px;
		flex-direction: column;
		min-width: 200px;
		padding: 10px;
		background: rgb(34, 34, 34);
		border-radius: 18px;
		border: 1px solid rgb(61, 61, 61);
	}

	.title {
		color: rgb(89, 89, 89);
		text-align: center;
		padding-top: 10px;
		padding-bottom: 10px;
		border-bottom: 1px solid rgb(58, 58, 58);
	}

	.entry {
		padding: 10px;
		border-radius: 10px;
		cursor: pointer;

		&.red {
			color: red;
		}
		&.yellow {
			color: rgb(255, 198, 8);
		}

		&:hover {
			background: rgb(23, 23, 23);
		}

		&:active {
			background: rgb(15, 15, 15);
		}
	}

	.noselect {
		user-select: none;
		-webkit-user-select: none;
	}
</style>
