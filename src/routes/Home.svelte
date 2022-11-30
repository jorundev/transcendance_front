<script lang="ts">
	import { stLoggedUser, stNotifications } from "../stores";
	import { api, APIStatus, getUserProfilePictureLink } from "../api";
	import Card from "../components/Kit/Card.svelte";
	import { padIdentifier } from "../utils";
	import FriendListHorizontal from "../components/Friends/FriendListHorizontal.svelte";
	import MatchHistory from "../components/MatchHistory.svelte";
	import NotificationList from "../components/Notifications/NotificationList.svelte";
	import {
		canUseBrowserNotifications,
		NotificationType,
		type NotificationData,
	} from "../notifications";
	import NotificationModal from "../components/Notifications/NotificationModal.svelte";
	import { onMount } from "svelte";
	import { querystring, replace } from "svelte-spa-router";
	import { LobbyWinner } from "../lobbies";
	import type { User } from "../users";
	import GameEndModal from "../components/Game/GameEndModal.svelte";
	import XpBar from "../components/XPBar.svelte";

	let id = "";
	
	let query: URLSearchParams;
	$: query = new URLSearchParams($querystring);
	
	interface GameEndModalInfo {
		winner: LobbyWinner,
		player1: User;
		player2: User;
		player1Score: number;
		player2Score: number;
		xp: number;
		oldxp: number;
	}
	
	let gameEndModal: GameEndModalInfo = null;
	
	async function setGameEndModal()
	{
		window.history.replaceState({}, null, "/#/");
		const hasAll =
			query.has("p1")
			&& query.has("p2")
			&& query.has("w")
			&& query.has("pt1")
			&& query.has("pt2")
			&& query.has("xp")
			&& query.has("oldxp");
		if (hasAll) {
			try {
				const w: LobbyWinner = parseInt(query.get("w"));
				if (w !== LobbyWinner.Player1 && w !== LobbyWinner.Player2 && w !== LobbyWinner.Tie) {
					throw "";
				}	
				
				const p1 = query.get("p1");
				if (p1.length === 0) {
					throw "";
				}
				const p2 = query.get("p2");
				if (p2.length === 0) {
					throw "";
				}
				
				const player1 = await api.getUserData(p1);
				if (player1 === null || player1 === APIStatus.NoResponse || (player1 as any).statusCode === 404) {
					throw "";
				}
				
				const player2 = await api.getUserData(p2);
				if (player2 === null || player2 === APIStatus.NoResponse || (player2 as any).statusCode === 404) {
					throw "";
				}
				
				const player1Score = parseInt(query.get("pt1"));
				const player2Score = parseInt(query.get("pt2"));
				
				const xp = parseInt(query.get("xp"));
				const oldxp = parseInt(query.get("oldxp"));
				
				if (isNaN(xp) || isNaN(oldxp) || isNaN(player1Score) || isNaN(player2Score)) {
					throw "";
				}
				
				gameEndModal = {
					player1,
					player2,
					xp,
					winner: w,
					player1Score,
					player2Score,
					oldxp,
				};
			} catch (_e) {}
		} else {
			gameEndModal = null;
			replace("/");
		}
	}
	
	$: if (query) {
		setGameEndModal();
	}

	$: id = padIdentifier($stLoggedUser?.id);

	let avatarLink = "";
	$: avatarLink = getUserProfilePictureLink($stLoggedUser?.uuid);

	let levelPercentage = 50;
	let modalData: NotificationData;

	function invite(data) {
		if (data.detail.type === NotificationType.AcceptedFriendRequest) {
			onRead(data.detail);
		} else {
			modalData = data.detail;
		}
	}

	onMount(async () => {
		await canUseBrowserNotifications();
	});

	async function onRead(data: NotificationData) {
		await api.readNotification(data.uuid);
		stNotifications.update((old) => {
			delete old[data.uuid];
			return old;
		});
		modalData = undefined;
	}
</script>

<svelte:head>
	<title>Home - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
{#if gameEndModal !== null}
<GameEndModal data={gameEndModal} on:back={() => {
	gameEndModal = null;
	replace("/");
	}}></GameEndModal>
{/if}
{#if modalData !== undefined}
	<NotificationModal
		{modalData}
		on:back={() => (modalData = undefined)}
		on:read={() => onRead(modalData)}
	/>
{/if}

<div class="home">
	<div class="column">
		<Card>
			<div class="profile">
				<div
					class="avatar"
					style={"background-image: url('" + avatarLink + "')"}
				/>
				<div class="info">
					<div class="user">
						<div class="name">{$stLoggedUser?.username}</div>
						<div class="id">#{id}</div>
					</div>
					<XpBar xp={$stLoggedUser.xp}></XpBar>
				</div>
			</div>
		</Card>
		<div class="nodesktop">
			<Card>
				<div class="home-div">
					<div class="title">Friends</div>
					<FriendListHorizontal inCard />
				</div>
			</Card>
		</div>
		<div>
			<Card>
				<div class="home-div">
					<div class="title">Notifications</div>
					<NotificationList
						on:invite-click={invite}
						on:accept-invite-click={invite}
						on:noticed-friend-accepted={invite}
					/>
				</div>
			</Card>
		</div>
		<Card>
			<div class="home-div">
				<div class="title">Match History</div>
				<MatchHistory user={$stLoggedUser?.uuid}/>
			</div>
		</Card>
	</div>
	<div class="s-column nomobile">
		<div class="artwork" />
	</div>
</div>

<style lang="scss">
	.home {
		display: flex;
		justify-content: space-evenly;
		gap: 30px;
		height: 100%;

		@media screen and (max-width: 799px) {
			height: calc(100% - 52px);
		}
		overflow-y: auto;
		overflow-x: hidden;
	}

	.s-column {
		width: 300px;
		height: 100%;
	}

	.home-div {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.column {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		padding-bottom: 20px;
	}

	.artwork {
		background-image: url("/img/artwork.gif");
		background-size: 90%;
		background-repeat: no-repeat;
		background-position: center;
		height: 100%;
	}

	.profile {
		display: flex;
		align-items: center;
		gap: 16px;
		width: 100%;

		.info {
			box-sizing: border-box;
			padding-top: 10px;
			padding-bottom: 10px;
			display: flex;
			align-items: center;
			gap: 16px;
			width: 100%;

			.user {
				display: flex;

				.name {
					color: white;
				}

				.id {
					color: #787771;
				}
			}
		}
	}

	.avatar {
		border-radius: 100%;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		width: 60px;
		height: 60px;
		flex-shrink: 0;
	}

	@media screen and (max-width: 799px) {
		.column {
			width: 100%;
			padding: 16px;
			box-sizing: border-box;
		}
		.nomobile {
			display: none;
		}
	}

	@media screen and (min-width: 800px) {
		.home {
			padding-left: 72px;
			padding-right: 20px;
		}
		.column {
			max-width: 500px;
			padding-top: 30px;
			padding-bottom: 30px;
		}

		.nodesktop {
			display: none;
		}
	}
</style>
