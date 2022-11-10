<script lang="ts">
	export let outline = undefined;
	export let outlineWidth = "3px";
</script>

<div style="outline: {outlineWidth} solid {outline}"><slot /></div>

<style lang="scss">
	div {
		background: #161618;
		padding: 20px;
		border-radius: 12px;
	}
</style>
