<script lang="ts">
	import { stLoggedUser } from "../stores";
	import { getUserProfilePictureLink } from "../api";
	import Card from "../components/Kit/Card.svelte";
	import SideBar from "../components/SideBar.svelte";

	let id: string = "";

	$: {
		let pad = "0000";
		pad += $stLoggedUser.id;
		id = pad.substring(4);
	}

	let avatarLink = "";
	$: avatarLink = getUserProfilePictureLink($stLoggedUser.uuid);

	let levelPercentage = 50;
</script>

<SideBar />
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
						<div class="name">{$stLoggedUser.username}</div>
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
	</div>
</div>

<style lang="scss">
	.column {
		display: flex;
		flex-direction: column;
		width: 100%;
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
					color: rgb(210, 210, 210);
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
	}

	@media screen and (max-width: 800px) {
		.column {
			width: 100%;
			padding: 16px;
			box-sizing: border-box;
		}
	}

	@media screen and (min-width: 800px) {
		.column {
			max-width: 400px;
			margin-left: 100px;
			margin-right: 30px;
			margin-top: 30px;
			margin-bottom: 30px;
		}
	}

	@media screen and (min-width: 1600px) {
	}
</style>
