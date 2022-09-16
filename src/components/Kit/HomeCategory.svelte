<script lang="ts">
	export let title: string;
</script>

<div class="home-category">
	<div class="title">{title}</div>
	<div class="content">
		<slot />
	</div>
</div>

<style lang="scss">
	.title {
		color: #8c8c8e;
		margin-bottom: 16px;
		margin-left: 16px;
	}

	.home-category {
		margin-top: 30px;
	}
</style>
