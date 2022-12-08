<script lang="ts">
	import { pop, push } from "svelte-spa-router";

	import { stLoggedUser, stUsers } from "../stores";
	import UserAvatar from "../components/Users/UserAvatar.svelte";
	import { padIdentifier } from "../utils";
</script>

<svelte:window />
<svelte:head>
	<title>Blocked accounts - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
{#if $stLoggedUser != null}
	<div class="s">
		<div class="settings">
			<div class="top">
				<div
					class="back"
					on:click={() => {
						pop();
					}}
				/>
				<div class="title">Blocked accounts</div>
				<div class="empty" style="width: 40px;" />
			</div>
			<div class="category">User list</div>
			<div class="user-list">
				{#each Object.entries($stUsers).filter(([_, user]) => user.is_blocked) as [uuid, user] (uuid)}
					<div class="user" on:click={() => push("/profile/" + uuid)}>
						<div class="avatar">
							<UserAvatar {uuid} />
						</div>
						<div class="info">
							<div class="username">{user.username}</div>
							<div class="id">
								#{padIdentifier(parseInt(user.identifier))}
							</div>
						</div>
					</div>
				{/each}
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

	.user-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-right: 10px;
		max-width: 400px;

		.user {
			.avatar {
				width: 40px;
				height: 40px;
				flex-shrink: 0;
			}

			.info {
				display: flex;
				align-items: center;

				.id {
					color: rgb(93, 93, 93);
				}
			}

			&:hover {
				cursor: pointer;
				background: rgb(35, 35, 35);
			}

			border-radius: 10px;
			background: rgb(25, 25, 25);
			padding: 10px;
			display: flex;
			gap: 10px;
			align-items: center;
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

	@media screen and (max-width: 799px) {
		.user-list {
			max-width: none;
			width: 100%;
			padding-top: 10px;
			gap: 0;

			.user {
				background-color: black;
				border-radius: 0;
			}
		}
	}
</style>
