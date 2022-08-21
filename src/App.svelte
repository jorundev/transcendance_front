<script lang="ts">
	import { onMount } from "svelte";

	import Router from "svelte-spa-router";
	import routes from "./App.routes";

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
</script>

<div class="main">
	<Router {routes} />
</div>

<style lang="scss">
	.main {
		width: 100%;
		height: 100%;
		padding: 16px;
		box-sizing: border-box;
	}
</style>
