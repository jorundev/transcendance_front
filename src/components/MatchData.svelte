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
		border-radius: 10px;
		background: rgb(18, 18, 18);
        border: 1px solid rgb(50, 50, 51);

		.nodata {
			color: rgb(207, 207, 207);
		}
	}
</style>
