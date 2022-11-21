<script lang="ts">
	import { padIdentifier } from "../../utils";
	import { UsersFriendship } from "../../api";
	import { ConnectionStatus, type FriendData } from "../../friends";

	import { stFriends } from "../../stores";
	import UserAvatar from "../Users/UserAvatar.svelte";
	import { push } from "svelte-spa-router";

	let friends: Array<[string, FriendData]> = [];
	$: friends = Object.entries($stFriends)?.filter(
		([_, ent]) => ent.friendship === UsersFriendship.True
	);
</script>

{#each friends as [uuid, friend]}
	<div class="friend" on:click={() => push("/profile/" + friend.name + "/" + friend.id)}>
		<div
			class="avatar"
			class:online={friend.status === ConnectionStatus.Online}
			class:ingame={friend.status === ConnectionStatus.InGame}
		>
			<UserAvatar {uuid} />
		</div>
		<div class="name" style={`font-size: calc(200px / (${friend.name.length} + 10));`}>
			{friend.name}
			<div class="id">#{padIdentifier(parseInt(friend.id))}</div>
		</div>
	</div>
{/each}

<style lang="scss">
	.friend {
		&:hover {
			cursor: pointer;
			background: #141414;
		}

		padding: 4px 0;
		width: 100%;
		min-width: 200px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 6px;

		.avatar {
			margin: 6px;
			margin-left: 8px;
			flex-shrink: 0;

			width: 36px;
			height: 36px;
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
