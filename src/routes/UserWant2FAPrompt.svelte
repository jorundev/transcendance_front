<script lang="ts">
	import { onMount } from "svelte";

	import { querystring, replace } from "svelte-spa-router";

	import Button from "../components/Kit/Button.svelte";
	import Card from "../components/Kit/Card.svelte";

	let qrData: string | null = null;
	let timeout = false;

	onMount(async () => {
		qrData = await getQRCode();
	});

	querystring.subscribe((query) => {
		const params = new URLSearchParams(query);
		if (params.has("timeout")) {
			timeout = true;
		}
	});

	let clicked_enable = false;

	async function getQRCode(): Promise<string> {
		let ret: string | null = null;
		await fetch("/api/auth/2fa", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(async (res) => {
				if (res.status == 202) {
					ret = await res.text();
					if (ret == null) {
						return "/img/frame.png";
					}
				} else if (res.status == 401) {
					replace("/login");
					return;
				}
			})
			.catch((e) => {
				console.error(e);
			});

		return ret ? ret : "/img/frame.png";
	}
</script>

<div class="page">
	<div class="center">
		<Card>
			{#if !clicked_enable}
				<div class="lock" />
				<div class="title">Enable Two-Factor Authentication ?</div>
				{#if timeout}
					<div class="title" style="color: red;">
						Request has expired. Please try again
					</div>
				{/if}
				<Button
					text="Enable"
					on:click={() => (clicked_enable = true)}
				/>
				<div
					class="next"
					on:click={() => {
						replace("/");
					}}
				>
					Continue
				</div>
			{:else}
				<div
					class="qr"
					style={"background-image: url('" + qrData + "');"}
				/>
				<div class="title">
					Scan this QR Code with a 2FA application
				</div>
				<Button text="Done" on:click={() => replace("/login/2fa")} />
			{/if}
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

	.qr {
		width: 300px;
		height: 300px;
		margin-left: auto;
		margin-right: auto;
		background-size: cover;
	}
</style>
