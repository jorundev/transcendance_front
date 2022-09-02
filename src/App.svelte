<script lang="ts">
	import { onMount } from "svelte";

	import Router, { replace } from "svelte-spa-router";
	import routes from "./App.routes";
	import { stLoggedUser, stServerDown, tryLoggingIn } from "./stores";

	onMount(async () => {
		document.documentElement.style.setProperty(
			"--scrollbar-width",
			window.innerWidth - document.documentElement.clientWidth + "px"
		);
		document.documentElement.style.setProperty(
			"--scrollbar-height",
			window.innerHeight - document.documentElement.clientHeight + "px"
		);
	});

	/*stLoggedUser.subscribe(async (value) => {
		if (value == null) {
			tryLoggingIn();
		} else {
			if ($stLoggedUser.uuid != value.uuid) {
				stLoggedUser.set(null);
			}
		}
	});*/

	function conditionsFailed(event) {
		if (!event.detail.userData) {
			return;
		}

		if (event.detail.userData.redirect) {
			replace(event.detail.userData.redirect);
		}
	}
</script>

<div class="main">
	{#if $stServerDown}
		<div class="sorry">Server is down. Try again later!</div>
	{:else}
		<Router
			{routes}
			restoreScrollState={true}
			on:conditionsFailed={conditionsFailed}
		/>
	{/if}
</div>

<style lang="scss">
	.main {
		width: 100%;
		height: 100%;
		padding: 16px;
		box-sizing: border-box;
		overflow: hidden;
	}

	.sorry {
		color: gray;
		text-align: center;
		font-size: 40px;
	}
</style>
