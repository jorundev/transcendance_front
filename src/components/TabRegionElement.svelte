<section class="tab-section" href="{href}"><slot></slot></section>

<style lang="scss">
	:global(.tab-section *) {
		width: 100%;
	}
</style>

<script lang="ts">
	export let href: string;
</script>
