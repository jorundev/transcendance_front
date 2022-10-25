<script lang="ts">
	import { replace } from "svelte-spa-router";

	import Button from "../components/Kit/Button.svelte";
	import Card from "../components/Kit/Card.svelte";

	let clicked_enable = false;
</script>

<div class="page">
	<div class="center">
		<Card>
			<div class="lock" />
			<div class="title">Enable Two-Factor Authentication ?</div>
			<Button
				text="Enable"
				on:click={() => replace("/setup2fa")}
			/>
			<div
				class="next"
				on:click={() => {
					replace("/");
				}}
			>
				Continue
			</div>
		</Card>
	</div>
</div>

<style lang="scss">
	.page {
		width: 100%;
		height: 100%;
		display: grid;
		align-items: center;
		justify-content: center;
	}

	.center {
		max-width: 600px;
	}

	.title {
		text-align: center;
		font-size: 18px;
		margin: 20px;
	}

	.lock {
		background-image: url("/img/lock.svg");
		background-size: cover;
		width: 80px;
		height: 80px;
		margin: 20px;
		margin-top: 10px;
		margin-left: auto;
		margin-right: auto;
	}

	.next {
		color: rgb(206, 206, 206);
		user-select: none;
		-webkit-user-select: none;
		cursor: pointer;
		text-align: right;
		font-size: 16px;
		margin-top: 16px;
		margin-right: 10px;
	}
</style>
