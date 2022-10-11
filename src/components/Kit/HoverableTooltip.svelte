<script lang="ts">
	import ClickOutside from "svelte-click-outside";

	export let tooltip: string;

	let elem: HTMLElement | null;
	let w: number;
	let h: number;

	$: w = elem == null ? 0 : elem.offsetWidth;
	$: h = elem == null ? 0 : elem.offsetHeight;
	let is_hovered = false;
</script>

<div
	class="hover-wrap {is_hovered ? 'selected' : ''}"
	data-id={tooltip}
	style="--trans-y:{-h}px; --trans-x:{w / 2}px;"
	on:mouseenter={() => {
		is_hovered = tooltip.length != 0;
	}}
	on:click={() => {
		is_hovered = true;
	}}
	on:mouseleave={() => {
		is_hovered = false;
	}}
>
	<ClickOutside
		on:clickoutside={() => {
			is_hovered = false;
		}}
	>
		<div bind:this={elem}>
			<slot />
		</div>
	</ClickOutside>
</div>

<style lang="scss">
	.hover-wrap {
		padding: 0;
		margin: 0;
		&.selected::after {
			content: attr(data-id);
			user-select: none;
			-webkit-user-select: none;
			font-size: 12px;
			position: absolute;
			padding: 2px;
			padding-left: 10px;
			padding-right: 10px;
			background: #121212;
			border-radius: 4px;
			border: 1px solid white;
			transform: attr(data-off);
			transform: translateY(var(--trans-y)) + translateX(var(--trans-x)) +
				translateX(-50%) + translateY(-100%) + translateY(-3px);
		}
	}
</style>
