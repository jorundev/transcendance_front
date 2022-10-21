<script lang="ts">
	import { stLoggedUser } from "../stores";
	import { getUserProfilePictureLink } from "../api";
	import Card from "../components/Kit/Card.svelte";
	import SideBar from "../components/SideBar.svelte";
	import { padIdentifier } from "../utils";
	import FriendListHorizontal from "../components/Friends/FriendListHorizontal.svelte";
	import MatchHistory from "../components/MatchHistory.svelte";
	import NotificationList from "../components/Notifications/NotificationList.svelte";

	let id = "";

	$: id = padIdentifier($stLoggedUser?.id);

	let avatarLink = "";
	$: avatarLink = getUserProfilePictureLink($stLoggedUser.uuid);

	let levelPercentage = 50;
</script>

<svelte:head>
	<title>Home - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
<SideBar active="home"/>
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
		<div class="nodesktop">
			<Card>
				<div class="home-div">
					<div class="title">Friends</div>
					<FriendListHorizontal />
				</div>
			</Card>
		</div>
		<Card>
			<div class="home-div">
				<div class="title">Match History</div>
				<MatchHistory />
			</div>
		</Card>
		<div class="nomobile">
			<Card>
				<div class="home-div">
					<div class="title">Notifications</div>
					<NotificationList />
				</div>
			</Card>
		</div>
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
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		height: 100%;
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
		border-radius: 100%;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		width: 60px;
		height: 60px;
		flex-shrink: 0;
	}

	@media screen and (max-width: 800px) {
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
			max-width: 400px;
			margin-top: 30px;
			margin-bottom: 30px;
		}

		.nodesktop {
			display: none;
		}
	}
</style>
