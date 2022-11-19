<script lang="ts">
	import { padIdentifier } from "../../utils";
	import { UsersFriendship } from "../../api";
	import { ConnectionStatus, type FriendData } from "../../friends";
	import { stFriends } from "../../stores";
	import UserAvatar from "../Users/UserAvatar.svelte";
	import { push } from "svelte-spa-router";

	export let inCard = false;
	let friends: Array<[string, FriendData]> = [];
	$: if ($stFriends)
		friends = Object.entries($stFriends)?.filter(
			([_, ent]) => ent.friendship === UsersFriendship.True
		);
</script>

<div class="friends cancelcard" class:inCard>
	{#each friends as [uuid, friend]}
		<div class="friend" on:click={() => push("/profile/" + uuid)}>
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
		box-sizing: border-box;
		overflow-x: auto;
		overflow-y: hidden;
		width: 100%;

		&.inCard {
			width: calc(100% + 40px);
			transform: translateX(-20px);
			padding-left: 20px;
			padding-right: 20px;
		}
	}

	.friend {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		cursor: pointer;

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
