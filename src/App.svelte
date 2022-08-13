<script lang="ts">
	import Router from 'svelte-spa-router';
	import routes from './routes';
</script>

<div class="main">
	<Router {routes} />
</div>

<style lang="scss">
	.main {
		margin: 16px;
	}
</style>
