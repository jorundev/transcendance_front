<script lang="ts">
	import {
		type NotificationData,
		NotificationType,
		isGameInviteNotificationData,
	} from "../../notifications";
	import Button from "../Kit/Button.svelte";
	import Card from "../Kit/Card.svelte";
	import ClickOutside from "svelte-click-outside";
	import Modal from "../Kit/Modal.svelte";
	import { createEventDispatcher } from "svelte";
	import { onMount } from "svelte";
	import { api, APIStatus } from "../../api";
	import type { User } from "../../users";
	import { stFriends, stLobby, stToast } from "../../stores";
	import { push } from "svelte-spa-router";

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

	async function sendFriendRequest() {
		const resp = await api.sendFriendRequest(modalData.user);
		if (resp !== null && resp !== APIStatus.NoResponse) {
			stFriends.update((old) => {
				old[modalData.user] = {
					uuid: modalData.user,
					avatar: user?.avatar,
					name: user?.username,
					id: user?.identifier,
					status: user.is_online,
					friendship: resp.friendship,
				};
				return old;
			});
			dispatch("read");
		}
	}

	async function removeFriend() {
		const resp = await api.removeFriend(modalData.user);
		if (resp !== null && resp !== APIStatus.NoResponse) {
			stFriends.update((old) => {
				delete old[modalData.user];
				return old;
			});
			dispatch("read");
		}
	}

	async function goToLobby() {
		if (isGameInviteNotificationData(modalData)) {
			const lobby = await api.joinLobby(modalData.lobby);
			if (
				lobby !== null &&
				lobby !== APIStatus.NoResponse &&
				(lobby as any).statusCode !== 400 &&
				(lobby as any).statusCode !== 404
			) {
				dispatch("read");
				if (lobby) {
					$stLobby = lobby;
					setTimeout(() => push("/play/lobby"), 0);
				}
			} else if (
				(lobby as any).status === 400
			) {
				stToast.set("You already are in the lobby");
				dispatch("read");
			} else if (
				(lobby as any).status === 404
			) {
				stToast.set("This lobby does not exists anymore");
				dispatch("read");
			}
		}
	}
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
							<Button red on:click={removeFriend}>No</Button>
							<Button on:click={sendFriendRequest}>Yes</Button>
						</div>
					{:else if modalData.type === NotificationType.GameInvite}
						<div class="title">Join casual lobby ?</div>
						<div class="desc">
							If you accept, you will be brought to a casual lobby
							with
							{user?.username}
						</div>
						<div class="buttons">
							<Button
								red
								on:click={async () => {
									await api.readNotification(modalData.uuid);
									if (
										isGameInviteNotificationData(modalData)
									) {
										await api.declineLobbyInvite(
											modalData.lobby
										);
									}
									dispatch("back");
								}}>No</Button
							>
							<Button on:click={goToLobby}>Yes</Button>
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
