<script lang="ts">
	import Card from "../components/Kit/Card.svelte";
	import type { User } from "../users";
	import { api, APIStatus } from "../api";
	import SideBar from "../components/SideBar.svelte";
	import NotFound from "./NotFound.svelte";
	import MatchHistory from "../components/MatchHistory.svelte";
	import UserAvatar from "../components/Users/UserAvatar.svelte";
	import Button from "../components/Kit/Button.svelte";

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
</script>

<svelte:head>
	<title>{user?.username} - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
{#if !user}
	<NotFound />
{:else}
	<SideBar />
	<div class="user-profile">
		<div class="column">
			<Card>
				<div class="profile">
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
					</div>
				</div>
			</Card>
			<Card>
				<div class="home-div">
					<div class="title">Match History</div>
					<MatchHistory />
				</div>
			</Card>
			<Button>Play against</Button>
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
			margin-top: 14px;
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

	.profile {
		display: flex;
		gap: 16px;
		width: 100%;

		.info {
			padding-top: 10px;
			padding-bottom: 10px;
			display: flex;
			flex-direction: column;
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
		width: 60px;
		height: 60px;
		flex-shrink: 0;
	}
</style>
