<script lang="ts">
	export let href: string;
</script>

<section class="tab-section" {href}>
	<slot />
</section>

<style lang="scss">
	.tab-section {
		width: 100%;
		flex-shrink: 0;
		scroll-snap-align: center;
		overflow: hidden;
	}

	/* Safari 11+ */
	@media not all and (min-resolution: 0.001dpcm) {
		@supports (-webkit-appearance: none) and (stroke-color: transparent) {
			.tab-section {
				/* on Safari using 'margin-right' on the last element does NOTHING. */
				/* paddings seems to work and give the same visual result */
				/* except some scrolling requires 'margin' to be used... except on Safari */
				/* WebKit is a bitch */
				margin: 0;
				padding-left: 16px;
				padding-right: 16px;
			}
		}
	}
</style>
