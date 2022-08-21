<script lang="ts">
	import HoverableTooltip from "./Kit/HoverableTooltip.svelte";

	export let name: string;
</script>

<HoverableTooltip tooltip={name}>
	<div class="achievement" />
</HoverableTooltip>

<style lang="scss">
	.achievement {
		border-radius: 100%;
		width: 28px;
		height: 28px;
		background: black;
	}
</style>
