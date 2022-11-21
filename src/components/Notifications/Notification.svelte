<script lang="ts">
	import { createEventDispatcher } from "svelte";
</script>

<div class="notification" on:click|stopPropagation>
	<div class="content">
		<slot />
	</div>
</div>

<style lang="scss">
	.notification {
		cursor: pointer;
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
		border-radius: 10px;
		background: rgb(18, 18, 18);
		border: 1px solid rgb(50, 50, 50);

		&:hover {
			background: rgb(50, 50, 50);
		}
	}
</style>
