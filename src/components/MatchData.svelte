<script lang="ts">
	export let hasData = false;
</script>

<div class="match">
	{#if !hasData}
		<div class="nodata">No match history yet</div>
	{/if}
</div>

<style lang="scss">
	.match {
		display: flex;
		align-items: center;
		padding-left: 10px;
		padding-right: 10px;
		min-height: 30px;
		border: 1px solid rgb(75, 75, 75);
		border-radius: 10px;

		.nodata {
			color: rgb(188, 188, 188);
		}
	}
</style>
