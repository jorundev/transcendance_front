<div class="modal">
	<slot />
</div>

<style lang="scss">
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background-color: #000000a7;
		z-index: 2;
	}
</style>
