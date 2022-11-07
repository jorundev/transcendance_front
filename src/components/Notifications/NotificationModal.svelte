<script lang="ts">
	import {
		type NotificationData,
		NotificationType,
	} from "../../notifications";
	import Button from "../Kit/Button.svelte";
	import Card from "../Kit/Card.svelte";
	import ClickOutside from "svelte-click-outside";
	import Modal from "../Kit/Modal.svelte";
	import { createEventDispatcher } from "svelte";
	import { onMount } from "svelte";
	import { api, APIStatus } from "../../api";
	import type { User } from "../../users";

	let canGoBack = false;

	onMount(() => {
		setTimeout(() => (canGoBack = true), 200);
	});

	export let modalData: NotificationData;

	let user: User;

	$: api.getUserData(modalData.user).then((usr) => {
		if (usr !== null && usr !== APIStatus.NoResponse) {
			user = usr;
		}
	});

	let dispatch = createEventDispatcher();
</script>

<Modal>
	<div class="modal">
		<ClickOutside
			on:clickoutside={() => {
				if (canGoBack) {
					dispatch("back");
				}
			}}
		>
			<Card>
				<div class="card">
					{#if modalData.type === NotificationType.FriendRequest}
						<div class="title">Accept friend request ?</div>
						<div class="desc">
							If you accept, you will be friends with
							{user?.username}
						</div>
						<div class="buttons">
							<Button red>No</Button>
							<Button>Yes</Button>
						</div>
					{:else if modalData.type === NotificationType.GameInvite}
						<div class="title">Join casual lobby ?</div>
						<div class="desc">
							If you accept, you will be brought to a casual lobby
							with
							{user?.username}
						</div>
						<div class="buttons">
							<Button red>No</Button>
							<Button>Yes</Button>
						</div>
					{/if}
				</div>
			</Card>
		</ClickOutside>
	</div>
</Modal>

<style lang="scss">
	.modal {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
	}

	.card {
		.title {
			font-size: 20px;
			margin-bottom: 10px;
		}

		.buttons {
			margin-top: 20px;
			display: flex;
			gap: 10px;
		}
	}
</style>
