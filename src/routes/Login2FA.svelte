<script lang="ts">
	import SvelteSegmentedInput from 'svelte-segmented-input';
	import Button from "../components/Kit/Button.svelte";
	import Card from "../components/Kit/Card.svelte";
	import { replace } from "svelte-spa-router";
	import { stServerDown, stToast } from '../stores';

	let buttonText = "Continue";
	let buttonActive = true;
	let play_wiggle = false;

	let full_query: string = "";

	function validate() {
		buttonText = "Validating...";
		buttonActive = false;

		let req = {
			code: full_query,
		};

		fetch("/api/auth/2fa", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req),
		})
			.then((res) => {
				if (res.status == 500) {
					replace("/postsignup/2fa?timeout");
				} else if (res.status == 403) {
					replace("/login");
				} else if (res.status == 200) {
					replace("/");
				} else if (res.status == 417) {
					full_query = "";
					buttonText = "Continue";
					play_wiggle = true;
					setTimeout(() => {
						play_wiggle = false;
						buttonActive = true;
					}, 300);
					return;
				}
			})
			.catch((e) => {
				console.error(e);
				stToast.set("Something wrong happened with the server");
				stServerDown.set(true);
			});
	}

	$: {
		if (full_query.length === 6 && buttonActive) {
			validate();
		}
	}
</script>

<div class="page">
	<div class="center">
		<Card>
			<div class="lock" />
			<div class="title">Two-Factor Authentication</div>
			<div class="text">
				Please enter the 6-digit code from your 2FA application
			</div>
			<div class="digit-zone" class:wiggle={play_wiggle}>
				<SvelteSegmentedInput bind:value={full_query} length={6} style={{textColor: "white", borderColor: "gray"}}></SvelteSegmentedInput>
			</div>
			<Button
				text={buttonText}
				active={buttonActive}
				on:click={validate}
			/>
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
		margin-top: 0;
		margin-left: auto;
		margin-right: auto;
	}

	.text {
		padding-bottom: 20px;
		text-align: center;
	}

	@keyframes wiggle {
		0% {
			transform: translateX(-10px);
		}
		25% {
			transform: translateX(10px);
		}
		50% {
			transform: translateX(-10px);
		}
		75% {
			transform: translateX(10px);
		}
		100% {
			transform: translateX(0px);
		}
	}

	.wiggle {
		animation: wiggle 0.3s infinite;
	}

	.digit-zone {
		justify-content: space-around;
		padding-left: 20px;
		padding-right: 20px;
		margin-bottom: 20px;
		height: 60px;
		display: flex;
		gap: 10px;
	}

	@media screen and (max-width: 500px) {
		.digit-zone {
			width: auto;
			padding: 0;
			gap: 5px;
		}
	}
</style>
