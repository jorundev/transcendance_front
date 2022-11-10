<script lang="ts">
	import { padIdentifier } from "../../utils";
	import { UsersFriendship } from "../../api";
	import { ConnectionStatus } from "../../friends";
	import { stFriends } from "../../stores";
	import UserAvatar from "../Users/UserAvatar.svelte";
</script>

<div class="friends cancelcard">
	{#each Object.entries($stFriends).filter(([_, ent]) => ent.friendship === UsersFriendship.True) as [uuid, friend]}
		<div class="friend">
			<div
				class="avatar"
				class:online={friend.status === ConnectionStatus.Online}
				class:ingame={friend.status === ConnectionStatus.InGame}
			>
				<UserAvatar {uuid} />
			</div>
			<div class="name">
				{friend.name}
				<div class="id">#{padIdentifier(parseInt(friend.id))}</div>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	.cancelcard {
		display: flex;
		gap: 16px;
		align-items: center;
		transform: translateX(-20px);
		width: calc(100% + 40px);
		padding-left: 20px;
		padding-right: 20px;
		box-sizing: border-box;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.friend {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;

		.avatar {
			margin: 10px;
			width: 60px;
			height: 60px;
			z-index: 10000;
			border-radius: 100%;

			&.online {
				outline: 3px solid rgb(0, 206, 0);
			}
			&.ingame {
				outline: 3px solid rgb(206, 0, 0);
			}
		}

		.name {
			display: flex;

			.id {
				color: rgb(92, 92, 92);
			}
		}
	}
</style>
