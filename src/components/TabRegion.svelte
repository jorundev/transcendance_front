<div class="tab-region">
	<div class="padder-begin"></div>
	<slot></slot>
	<div class="padder-end"></div>
</div>

<style lang="scss">
	:global(.tab-region *) {
		width: calc(100% - 32px);
		flex-shrink: 0;
		scroll-snap-align: center;
	}

	.tab-region {
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
		scroll-snap-type: x mandatory;
		width: calc(100vw);
		transform: translateX(-16px);
		gap: 16px;
	}

	.padder-begin {
		min-width: 0px;
		max-width: 0px;
		min-height: 100%;
		max-height: 100%;
	}

	.padder-end {
		width: 1px;
		min-height: 100%;
		max-height: 100%;
	}
</style>

<script lang="ts">
	function scrollIntoView({target}) {
		const el = document.querySelector(target.getAttribute())
	}
</script>
