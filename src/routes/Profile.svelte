<script lang="ts">
	import Card from "../components/Kit/Card.svelte";
	import type { User } from "../users";
	import { api, APIStatus, UsersFriendship } from "../api";
	import { LobbyPlayerReadyState } from "../lobbies";
	import NotFound from "./NotFound.svelte";
	import MatchHistory from "../components/MatchHistory.svelte";
	import UserAvatar from "../components/Users/UserAvatar.svelte";
	import Button from "../components/Kit/Button.svelte";
	import Modal from "../components/Kit/Modal.svelte";
	import ClickOutside from "svelte-click-outside";
	import { padIdentifier } from "../utils";
	import {
		stFriends,
		stLobby,
		stLoggedUser,
		stToast,
		stUsers,
	} from "../stores";
	import { onMount } from "svelte";
	import { push, replace } from "svelte-spa-router";
	import { ConnectionStatus } from "../friends";
	import XpBar from "../components/XPBar.svelte";

	export let params: {
		uuid?: string;
		user?: string;
		id?: string;
	};

	async function mount() {
		setTimeout(() => (show = true), 200);
		if (!params.uuid) {
			const auser = await api.getUserDataByUserAndId(
				params.user,
				params.id
			);
			if (
				auser === null ||
				auser === APIStatus.NoResponse ||
				(auser as any).statusCode === 404 ||
				(auser as any).statusCode === 400
			) {
				user = undefined;
				replace("/profile/404");
			} else {
				params = {
					uuid: auser.uuid,
				};
			}
		}
	}

	onMount(() => {
		mount();
	});

	let user: User;

	let show = false;

	async function setUser() {
		const usr = await api.getUserData(params.uuid);
		if (
			usr !== null &&
			usr !== APIStatus.NoResponse &&
			(usr as any).statusCode !== 404 &&
			(usr as any).statusCode !== 400
		) {
			user = usr;
		} else {
			user = null;
			return;
		}
		if (
			!$stFriends[params.uuid] &&
			user.friendship === UsersFriendship.Requested
		) {
			$stFriends[params.uuid] = {
				uuid: params.uuid,
				name: user.username,
				id: user.identifier,
				avatar: user.avatar,
				friendship: user.friendship,
				status: user.is_online,
			};
		}
	}

	$: {
		if (params.uuid && $stUsers) {
			setUser();
		} else if (!params.uuid) {
			show = false;
			mount();
		}
	}

	let profileID = "";
	$: profileID = padIdentifier(parseInt(user?.identifier));

	let levelPercentage = 20;

	let displayAddFriendModal = false;
	let displayPlayAgainstModal = false;
	let displayBlockModal = false;
	let displayCancelRequestModal = false;

	function clearModals() {
		displayAddFriendModal = false;
		displayPlayAgainstModal = false;
		displayBlockModal = false;
		displayCancelRequestModal = false;
	}

	let pending = false;
	let requested = false;
	let friends = false;

	let isBlocked = false;
	$: isBlocked = user?.is_blocked;

	$: {
		pending = false;
		requested = false;
		friends = false;
		if ($stFriends?.[params.uuid]) {
			switch ($stFriends[params.uuid].friendship) {
				case UsersFriendship.True:
					friends = true;
					break;
				case UsersFriendship.Pending:
					pending = true;
					break;
				case UsersFriendship.Requested:
					requested = true;
					break;
			}
		}
	}

	async function sendFriendRequest() {
		const resp = await api.sendFriendRequest(params.uuid);
		if (
			resp !== null &&
			resp !== APIStatus.NoResponse &&
			(resp as any).statusCode !== 404 &&
			(resp as any).statusCode !== 404
		) {
			$stFriends[params.uuid] = {
				uuid: params.uuid,
				avatar: user?.avatar,
				name: user?.username,
				id: user?.identifier,
				status: user.is_online,
				friendship: resp.friendship,
			};
			clearModals();
		} else if (
			(resp as any).statusCode === 404 ||
			(resp as any).statusCode === 400
		) {
			stToast.set("Error when sending friend request");
		}
	}

	async function cancelFriendRequest() {
		const resp = await api.removeFriend(params.uuid);
		if (resp !== null && resp !== APIStatus.NoResponse) {
			stFriends.update((old) => {
				delete old[params.uuid];
				return old;
			});
			clearModals();
		}
	}

	async function block() {
		if (!user?.is_blocked) {
			await api.blockUser(params.uuid);
		} else {
			await api.unblockUser(params.uuid);
		}
		displayBlockModal = false;
	}

	async function play() {
		if (user?.is_online === ConnectionStatus.InGame) {
			const lobby = await api.joinLobby(user?.lobby);
			if (
				lobby === null ||
				lobby === APIStatus.NoResponse ||
				(lobby as any).statusCode === 400
			) {
				stToast.set("Something wrong happened when joining the lobby");
				return;
			}
			$stLobby = lobby;
			setTimeout(() => push("/play/lobby"), 0);
			displayPlayAgainstModal = false;
			return;
		}

		const lobby = await api.createLobby();
		if (
			lobby === null ||
			lobby === APIStatus.NoResponse ||
			(lobby as any).statusCode === 400
		) {
			stToast.set("Something wrong happened when creating lobby");
			return;
		}
		lobby.players[1] = params.uuid;
		lobby.players_status[1] = LobbyPlayerReadyState.Invited;
		$stLobby = lobby;
		setTimeout(() => push("/play/lobby"), 0);
		displayPlayAgainstModal = false;
		await api.invitePlayerToLobby(params.uuid);
	}
</script>

<svelte:head>
	<title>{user?.username} - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
{#if show || user}
	{#if !user}
		<NotFound />
	{:else}
		{#if displayAddFriendModal}
			<Modal>
				<div class="modal">
					<Card>
						<div class="card">
							<ClickOutside
								on:clickoutside={() =>
									(displayAddFriendModal = false)}
							>
								<div class="title">
									{#if requested}
										Accept friend request from {user?.username}
										?
									{:else}
										Send a friend request to {user?.username}
										?
									{/if}
								</div>
								<div class="desc">
									{#if requested}
										They will be added to you friends list
									{:else}
										They will be able to accept or decline
										your request
									{/if}
								</div>
								<div class="modbuttons">
									<Button
										timeoutVisible
										timeout={400}
										highlight={false}
										on:click={() =>
											(displayAddFriendModal = false)}
										>Back</Button
									>
									<Button
										on:click={sendFriendRequest}
										timeoutVisible
										timeout={400}>Yes</Button
									>
								</div>
							</ClickOutside>
						</div>
					</Card>
				</div>
			</Modal>
		{:else if displayPlayAgainstModal}
			<Modal>
				<div class="modal">
					<Card>
						<div class="card">
							<ClickOutside
								on:clickoutside={() =>
									(displayPlayAgainstModal = false)}
							>
								<div class="title">
									{#if user?.is_online !== ConnectionStatus.InGame}
										Challenge {user?.username} in a casual game?
									{:else}
										Spectate {user?.username}'s game?
									{/if}
								</div>
								<div class="desc">
									{#if user?.is_online !== ConnectionStatus.InGame}
										They will be able to accept or decline
										your request
									{:else}
										You will be able to watch his game live
									{/if}
								</div>
								<div class="modbuttons">
									<Button
										timeoutVisible
										timeout={400}
										highlight={false}
										on:click={() =>
											(displayPlayAgainstModal = false)}
										>Back</Button
									>
									<Button
										on:click={play}
										timeoutVisible
										timeout={400}>Yes</Button
									>
								</div>
							</ClickOutside>
						</div>
					</Card>
				</div>
			</Modal>
		{:else if displayBlockModal}
			<Modal>
				<div class="modal">
					<Card>
						<div class="card">
							<ClickOutside
								on:clickoutside={() =>
									(displayBlockModal = false)}
							>
								<div class="title">
									{#if !user?.is_blocked}
										Block {user?.username} ?
									{:else}
										Unblock {user?.username} ?
									{/if}
								</div>
								<div class="desc">
									{#if !user?.is_blocked}
										They will no longer be able to play
										against you or send you direct messages
									{:else}
										They will be able to play against you
										and send you direct messages
									{/if}
								</div>
								<div class="modbuttons">
									<Button
										timeoutVisible
										timeout={400}
										highlight={false}
										on:click={() =>
											(displayBlockModal = false)}
										>Back</Button
									>
									<Button
										timeoutVisible
										timeout={400}
										red={!user?.is_blocked}
										on:click={block}>Yes</Button
									>
								</div>
							</ClickOutside>
						</div>
					</Card>
				</div>
			</Modal>
		{:else if displayCancelRequestModal}
			<Modal>
				<div class="modal">
					<Card>
						<div class="card">
							<ClickOutside
								on:clickoutside={() =>
									(displayCancelRequestModal = false)}
							>
								<div class="title">
									{#if friends}
										Remove {user?.username} from friend list?
									{:else}
										Cancel friend request?
									{/if}
								</div>
								<div class="desc">
									{#if friends}
										You will also be removed from their
										friend list
									{:else}
										They will no longer see that you sent a
										friend request
									{/if}
								</div>
								<div class="modbuttons">
									<Button
										timeoutVisible
										timeout={400}
										highlight={false}
										on:click={() =>
											(displayCancelRequestModal = false)}
										>Back</Button
									>
									<Button
										red
										on:click={cancelFriendRequest}
										timeoutVisible
										timeout={400}>Yes</Button
									>
								</div>
							</ClickOutside>
						</div>
					</Card>
				</div>
			</Modal>
		{/if}
		<div class="user-profile">
			<div class="column">
				<Card outline="rgb(232, 138, 138)">
					<div class="profile">
						<div class="back" />
						<div class="avatar">
							<UserAvatar uuid={params.uuid} />
						</div>
						<div class="info">
							<div class="user">
								<div class="name">{user.username}</div>
								<div class="id">#{profileID}</div>
								<div class="rank" />
							</div>
							<XpBar xp={user.xp} />
							<div class="buttons">
								{#if user?.is_online !== ConnectionStatus.InGame}
									<Button
										padding="6px"
										timeoutVisible
										timeout={400}
										on:click={() =>
											(displayPlayAgainstModal = true)}
										active={show &&
											$stLoggedUser.uuid !==
												params.uuid &&
											!user?.is_blocked &&
											!user?.has_blocked}
										>Play against</Button
									>
								{:else}
									<Button
										timeoutVisible
										timeout={400}
										padding="6px"
										on:click={() =>
											(displayPlayAgainstModal = true)}
										active={show &&
											$stLoggedUser.uuid !==
												params.uuid &&
											!user?.is_blocked &&
											!user?.has_blocked}>Spectate</Button
									>
								{/if}

								{#if pending}
									<Button
										timeoutVisible
										timeout={400}
										highlight={false}
										padding="6px"
										on:click={() =>
											(displayCancelRequestModal = true)}
										active={show &&
											$stLoggedUser.uuid !== params.uuid}
										>Request sent</Button
									>
								{:else if requested}
									<Button
										timeoutVisible
										timeout={400}
										padding="6px"
										on:click={() =>
											(displayAddFriendModal = true)}
										active={show &&
											$stLoggedUser.uuid !== params.uuid}
										>Accept friend request</Button
									>
								{:else if friends}
									<Button
										timeoutVisible
										timeout={400}
										red
										padding="6px"
										on:click={() =>
											(displayCancelRequestModal = true)}
										active={show &&
											$stLoggedUser.uuid !== params.uuid}
										>Remove friend</Button
									>
								{:else}
									<Button
										timeoutVisible
										timeout={400}
										padding="6px"
										on:click={() =>
											(displayAddFriendModal = true)}
										active={show &&
											$stLoggedUser.uuid !==
												params.uuid &&
											!user?.is_blocked &&
											!user?.has_blocked}
										>Add friend</Button
									>
								{/if}
								{#if isBlocked}
									<Button
										timeoutVisible
										timeout={400}
										padding="6px"
										on:click={() =>
											(displayBlockModal = true)}
										active={show &&
											$stLoggedUser.uuid !== params.uuid}
										>Unblock</Button
									>{:else}
									<Button
										timeoutVisible
										timeout={400}
										padding="6px"
										red
										on:click={() =>
											(displayBlockModal = true)}
										active={show &&
											$stLoggedUser.uuid !== params.uuid}
										>Block</Button
									>
								{/if}
							</div>
						</div>
					</div>
				</Card>
				{#if !user?.has_blocked}
					<div class="content">
						<Card>
							<div class="home-div">
								<div class="title">Match History</div>
								<MatchHistory user={user?.uuid} />
							</div>
						</Card>
					</div>
				{:else}
					<div class="blocked">This user has blocked you.</div>
				{/if}
			</div>
		</div>
	{/if}
{/if}

<style lang="scss">
	.user-profile {
		display: flex;
		justify-content: center;
		padding: 16px;

		@media screen and (min-width: 800px) {
			padding: 0;
			margin-left: 56px;
			margin-top: 18px;
		}
	}

	.home-div {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.column {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		height: 100%;

		@media screen and (min-width: 800px) {
			max-width: 600px;
		}
	}

	.buttons {
		max-width: 400px;
		display: flex;
		gap: 10px;
	}

	.profile {
		display: flex;
		gap: 16px;
		width: 100%;
		position: relative;
		transform-style: preserve-3d;

		.back {
			border-top-left-radius: 10px;
			border-top-right-radius: 10px;
			transform: translateX(-20px) + translateY(-20px) + translateZ(-1px);
			position: absolute;
			top: 0;
			width: calc(100% + 40px);
			height: 56px;
			background: rgb(232, 138, 138);
		}

		.info {
			padding-top: 10px;
			padding-bottom: 10px;
			display: flex;
			flex-direction: column;
			gap: 16px;
			width: 100%;
			font-size: 20px;

			.user {
				display: flex;

				.name {
					color: rgb(154, 0, 0);
				}

				.id {
					color: #420000;
				}
			}
		}
	}
	.avatar {
		width: 80px;
		height: 80px;
		flex-shrink: 0;
		outline: 3px solid #161618;
		border-radius: 100%;
	}

	.blocked {
		text-align: center;
		padding-top: 20px;
		font-size: 24px;
	}

	.modal {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;

		.title {
			font-size: 20px;
			margin-bottom: 16px;
		}

		.modbuttons {
			display: flex;
			gap: 10px;
			margin-top: 10px;
			width: 100%;
		}
	}
</style>
