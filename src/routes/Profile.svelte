<script lang="ts">
	import Card from "../components/Kit/Card.svelte";
	import type { User } from "../users";
	import { api, APIStatus } from "../api";
	import SideBar from "../components/SideBar.svelte";
	import NotFound from "./NotFound.svelte";
	import MatchHistory from "../components/MatchHistory.svelte";
	import UserAvatar from "../components/Users/UserAvatar.svelte";
	import Button from "../components/Kit/Button.svelte";
	import Modal from "../components/Kit/Modal.svelte";
	import ClickOutside from "svelte-click-outside";

	export let params: {
		uuid: string;
	};

	let user: User;

	async function setUser() {
		const usr = await api.getUserData(params.uuid);
		if (
			usr !== null &&
			usr !== APIStatus.NoResponse &&
			(usr as any).statusCode !== 404
		) {
			user = usr;
			return;
		}
	}

	$: {
		if (params) {
			setUser();
		}
	}

	let levelPercentage = 20;

	let displayAddFriendModal = false;
	let displayPlayAgainstModal = false;
	let displayBlockModal = false;
</script>

<svelte:head>
	<title>{user?.username} - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
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
								Send a friend request to {user?.username} ?
							</div>
							<div class="desc">
								They will be able to accept or decline your
								request
							</div>
							<div class="modbuttons">
								<Button
									highlight={false}
									on:click={() =>
										(displayAddFriendModal = false)}
									>Back</Button
								>
								<Button>Yes</Button>
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
								Challenge {user?.username} in a casual game?
							</div>
							<div class="desc">
								They will be able to accept or decline your
								request
							</div>
							<div class="modbuttons">
								<Button
									highlight={false}
									on:click={() =>
										(displayPlayAgainstModal = false)}
									>Back</Button
								>
								<Button>Yes</Button>
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
							on:clickoutside={() => (displayBlockModal = false)}
						>
							<div class="title">
								Block {user?.username} ?
							</div>
							<div class="desc">
								They will no longer be able to play against you
								or send you direct messages
							</div>
							<div class="modbuttons">
								<Button
									highlight={false}
									on:click={() => (displayBlockModal = false)}
									>Back</Button
								>
								<Button red>Yes</Button>
							</div>
						</ClickOutside>
					</div>
				</Card>
			</div>
		</Modal>
	{/if}
	<SideBar />
	<div class="user-profile">
		<div class="column">
			<Card outline="white">
				<div class="profile">
					<div class="back" />
					<div class="avatar">
						<UserAvatar uuid={params.uuid} />
					</div>
					<div class="info">
						<div class="user">
							<div class="name">{user.username}</div>
							<div class="id">#{user.identifier}</div>
							<div class="rank" />
						</div>
						<div class="level">
							<div class="level-text">Level 16</div>
							<div class="level-back">
								<div
									class="level-inner"
									style="width: {levelPercentage}%;"
								/>
							</div>
						</div>
						<div class="buttons">
							<Button
								padding="6px"
								on:click={() =>
									(displayPlayAgainstModal = true)}
								>Play against</Button
							>
							<Button
								padding="6px"
								on:click={() => (displayAddFriendModal = true)}
								>Add friend</Button
							>
							<Button
								padding="6px"
								red
								on:click={() => (displayBlockModal = true)}
								>Block</Button
							>
						</div>
					</div>
				</div>
			</Card>
			<Card>
				<div class="home-div">
					<div class="title">Match History</div>
					<MatchHistory />
				</div>
			</Card>
		</div>
	</div>
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
			background: rgb(255, 255, 255);
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
					color: rgb(0, 0, 0);
				}

				.id {
					color: #4e4e4e;
				}
			}

			.level {
				display: flex;
				align-items: center;
				gap: 10px;

				.level-text {
					color: rgb(230, 230, 230);
					font-size: 14px;
					flex-shrink: 0;
				}
				.level-back {
					height: 10px;
					background: rgb(50, 50, 50);
					border-radius: 10px;
					width: 100%;

					.level-inner {
						height: 100%;
						border-radius: 10px;
						border-top-right-radius: 0;
						border-bottom-right-radius: 0;
						background: rgb(170, 29, 142);
					}
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
