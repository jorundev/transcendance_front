<div class="{selected ? 'selected' : ''}">
	<slot></slot>
</div>

<style lang="scss">
	div {
		cursor: pointer;
		padding: 12px;
		border-radius: 12px;
		display: inline-block;
		color: #8d8d8f;
		flex: 0 0 auto;
		&.selected {
			background: #161618;
			color: white;
		}
		transition: color 200ms;

		&:hover {
			color: #b4b4b4;
		}
	}
</style>

<script lang="ts">
	export let selected: boolean = false;
</script>
