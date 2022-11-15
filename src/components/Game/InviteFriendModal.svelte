<script lang="ts">
	import SearchBar from "../Kit/SearchBar.svelte";
	import InviteFriendsItem from "./InviteFriendsItem.svelte";
	import ClickOutside from "svelte-click-outside";
	import { createEventDispatcher, onMount } from "svelte";
	import { stFriends } from "../../stores";

	let canGoBack = false;

	let value = "";

	let dispatch = createEventDispatcher();

	onMount(() => {
		setTimeout(() => (canGoBack = true), 200);
	});

	let searchList: Array<string> = [];

	$: {
		searchList = Object.entries($stFriends)
			.filter(([_, data]) => {
				return data.name.startsWith(value);
			})
			.map(([uuid, _]) => uuid);
	}
</script>

<div class="invite">
	<div class="inner">
		<ClickOutside
			on:clickoutside={() => {
				if (canGoBack) dispatch("back");
			}}
		>
			<SearchBar bind:value />
			<div class="items">
				{#each searchList as friend}
					<InviteFriendsItem uuid={friend} on:invite />
				{/each}
			</div>
		</ClickOutside>
	</div>
</div>

<style lang="scss">
	.invite {
		width: 100%;
		max-width: 660px;
		//background: red;
		height: 800px;
	}

	.items {
		max-height: 400px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.inner {
		background: black;
		margin: 20px;
		position: relative;
		padding: 10px;
		border-radius: 10px;
		outline: 1px solid rgb(54, 54, 54);
	}
</style>
