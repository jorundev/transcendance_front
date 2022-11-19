<script lang="ts">
	import { pop, push } from "svelte-spa-router";

	import { stLoggedUser } from "../stores";
	import SideBar from "../components/SideBar.svelte";
	import Button from "../components/Kit/Button.svelte";
	import { api } from "../api";
	import Modal from "../components/Kit/Modal.svelte";
	import Card from "../components/Kit/Card.svelte";
	import ClickOutside from "svelte-click-outside";
	
	let innerWidth = 0;
	
	let tfaDisableWarning = false;
</script>

<svelte:window bind:innerWidth />
<svelte:head>
	<title>Two-Factor Authentication - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
{#if $stLoggedUser != null}
	{#if tfaDisableWarning}
	<Modal>
		<div class="warning">
			<ClickOutside on:clickoutside={() => tfaDisableWarning = false}>
			<div class="card">
				<Card>
					<div class="wtitle">Disable 2FA</div>
					<div class="text">Are you sure you want to disable Two-Factor Authentication ? Without it, your account is less secure.</div>
					<div class="buttons">
						<Button highlight={false} on:click={() => tfaDisableWarning = false}>Back</Button>
						<Button on:click={() => {
							api.remove2FA();
							stLoggedUser.update((old) => {
								old.tfa = false;
								return old;
							});
							tfaDisableWarning = false;
						}}>Yes</Button>
					</div>
				</Card>
			</div>
			</ClickOutside>
		</div>
	</Modal>
	{/if}
	<!-- <SideBar active="settings"/> -->
	<div class="s">
		<div class="settings">
			<div class="top">
				<div
					class="back"
					on:click={() => {
						pop();
					}}
				/>
				<div class="title">Two-Factor Authentication</div>
				<div class="empty" style="width: 40px;" />
			</div>
			<div class="category">Status</div>
			<p class="status">
				{#if $stLoggedUser.tfa}
					Two-Factor Authentication is currently <span class="enabled">enabled</span>.
				{:else}
					Two-Factor Authentication is currently <span class="disabled">disabled</span>. To add security to your account, consider activating it
				{/if}
			</p>
			<div class="button">
				{#if $stLoggedUser.tfa}
					<Button red on:click={() => {
						tfaDisableWarning = true;
					}}>Disable</Button>
				{:else}
					<Button on:click={() => push("/setup2fa")}>Enable</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.s {
		display: flex;
		justify-content: center;
	}

	.settings {
		box-sizing: border-box;
		user-select: none;
		-webkit-user-select: none;
		width: 100%;
		display: flex;
		flex-direction: column;
		max-width: 1200px;
		padding-top: 10px;
	}
	
	.warning {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		
		.text {
			font-size: 18px;
			margin-bottom: 26px;
		}
		
		.card {
			max-width: 600px;
		}
		
		.wtitle {
			font-size: 24px;
			margin-bottom: 10px;;
		}
		
		.buttons {
			display: flex;
			gap: 10px;
		}
	}

	.title {
		user-select: none;
		-webkit-user-select: none;
		margin-top: 10px;
		margin-bottom: 16px;
		text-align: center;
		font-size: 18px;
	}

	.top {
		display: flex;
		justify-content: space-between;
	}

	.back {
		cursor: pointer;
		width: 40px;
		height: 40px;
		background-image: url("/img/left.png");
		background-size: 50%;
		background-position: center;
		background-repeat: no-repeat;
	}
	
	.status {
		margin-left: 12px;
		margin-right: 12px;
		font-size: 18px;
		line-height: 22px;
	}
	
	.enabled {
		color: rgb(0, 193, 0);
	}
	
	.disabled {
		color: red;
	}
	
	.button {
		margin-left: 12px;
		margin-right: 12px;
		margin-top: 16px;
		max-width: 400px;
	}
	
	.category {
		margin-left: 10px;
		margin-right: 10px;
		margin-top: 4px;
		user-select: none;
		-webkit-user-select: none;
		transform: translateX(-16px);
		padding: 8px;
		padding-left: 16px;
		color: rgb(94, 94, 94);
		font-size: 14px;
		width: 100%;
		background: rgb(29, 29, 29);
		font-weight: bold;
		text-transform: uppercase;
	}
	
	@media screen and (min-width: 800px) {
		.settings {
			padding-left: 59px;
			padding-top: 20px;
			max-width: none;
			border-right: 1px solid rgb(40, 40, 40);
			height: 100vh;
		}
		.title {
			margin-bottom: 10px;
			margin-left: 10px;
			font-size: 28px;
		}
		.category {
			margin-top: 20px;
			margin-bottom: 10px;
			padding-top: 20px;
			border-top: 1px solid rgb(40, 40, 40);
			background: transparent;
			text-transform: none;
			color: white;
			font-size: 24px;
		}
		.top {
			display: flex;
			justify-content: left;
			align-items: center;
		}
	}
	
	@media screen and (max-width: 800px) {
		.status {
			text-align: center;
			margin-top: 20px;
		}
		
		.warning {
			.card {
				max-width: 420px;
			}
		}
		
		
		.button {
			margin-left: auto;
			margin-right: auto;
			min-width: 200px;
		}
	}
</style>
