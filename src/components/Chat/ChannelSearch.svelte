<script lang="ts">
	import { stChannels } from "../../stores";
	import ClickOutside from "svelte-click-outside";
	import ChannelSearchEntry from "./ChannelSearchEntry.svelte";
	import { createEventDispatcher } from "svelte";
	import type { Channel } from "../../channels";
	import { padIdentifier } from "../../utils";

	let searchValue: string;

	$: if (searchValue) {
		searchValue = searchValue.replaceAll(" ", "-");
	}

	let background: string = "#232324";
	let focused = false;
	let menu = false;

	let searchInput: HTMLInputElement;
	let overlayDiv: HTMLDivElement;

	let searchWidth: number;
	let dispatch = createEventDispatcher();

	function onFocus() {
		focused = true;
		menu = true;
		background = "#38383a";
	}

	function onUnfocus() {
		focused = false;
		background = "#232324";
	}

	let pubs: Array<Channel> = [];

	function onInput() {
		if (searchValue === undefined) {
			searchValue = "";
		}
		const publics: Array<Channel> = [];
		const toks = searchValue.split("#");

		let name = toks[0];
		if (name === undefined) {
			name = "";
		}
		let number = parseInt(toks[1]);
		if (isNaN(number)) {
			number = undefined;
		}

		for (const [_, channel] of Object.entries($stChannels)) {
			if (channel.joined) {
				continue;
			}
			if (channel.name.includes(name)) {
				if (
					(number !== undefined &&
						(channel.id + "").includes(number + "")) ||
					number === undefined
				) {
					publics.push(channel);
				}
			}
		}
		pubs = publics;
	}
</script>

<div class="search-bar" bind:clientWidth={searchWidth}>
	<div
		class:menu
		class="search-bar-icon"
		style="background-color: {background};"
	/>
	<input
		bind:this={searchInput}
		bind:value={searchValue}
		on:input={onInput}
		on:focus={onInput}
		class="search-bar-input"
		class:menu
		on:focus={onFocus}
		on:blur={onUnfocus}
		placeholder="Search"
	/>
	{#if menu}
		<ClickOutside
			exclude={[searchInput, overlayDiv]}
			on:clickoutside={() => {
				if (!focused) menu = false;
			}}
		/>
		<div
			class="overlay"
			style="min-width: {searchWidth - 2}px;"
			bind:this={overlayDiv}
		>
			{#each pubs as pub}
				<ChannelSearchEntry
					on:click={() => {
						dispatch("join", { channel: pub });
						menu = false;
					}}
					pub
					password={pub.has_password}
					displayName={pub.name}
					channelID={padIdentifier(pub.id)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.search-bar {
		margin: 0;
		width: 100%;
		display: flex;
		padding-top: 10px;
		padding-bottom: 10px;
		box-sizing: border-box;
	}

	.search-bar-icon {
		transition: background-color 140ms;
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		background-color: #232324;
		border-top-left-radius: 12px;
		border-bottom-left-radius: 12px;
		background-image: url("../img/search.png");
		background-size: 24px;
		background-repeat: no-repeat;
		background-position: center;
		&.menu {
			border-bottom-left-radius: 0;
		}
	}

	.search-bar-input {
		position: relative;
		width: 100%;
		margin: 0;
		transition: background-color 140ms, width 140ms;
		font-size: 16px;
		flex-grow: 1;
		height: 10px;
		background: #232324;
		color: #f0f0f2;
		border: none;
		padding: 15px;
		border-top-right-radius: 12px;
		border-bottom-right-radius: 12px;

		&:focus {
			outline: none;
			background: #38383a;
		}

		&.menu {
			border-bottom-right-radius: 0;
		}
	}

	.overlay {
		position: absolute;
		z-index: 2;
		display: flex;
		flex-direction: column;
		top: 50px;
		background: #1f1f20;
		border: 1px solid rgb(61, 61, 61);
		padding-bottom: 18px;

		border-bottom-left-radius: 18px;
		border-bottom-right-radius: 18px;
	}
</style>
