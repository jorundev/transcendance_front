<script lang="ts">
	import { fade } from "svelte/transition";
</script>

<div class="modal" transition:fade={{ duration: 150 }}>
	<slot />
</div>

<style lang="scss">
	.modal {
		position: fixed;
		overflow: hidden;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background-color: #000000a7;
		z-index: 100;
	}
</style>
