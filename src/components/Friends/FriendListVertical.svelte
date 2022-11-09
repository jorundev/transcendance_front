<script>
	import { ConnectionStatus } from "../../friends";

	import { stFriends } from "../../stores";
	import UserAvatar from "../Users/UserAvatar.svelte";
</script>

{#each Object.entries($stFriends) as [uuid, friend]}
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
			<div class="id">#{friend.id}</div>
		</div>
	</div>
{/each}

<style lang="scss">
	.friend {
		&:hover {
			cursor: pointer;
			background: #141414;
		}

		width: 100%;
		min-width: 200px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 6px;

		.avatar {
			margin: 6px;
			margin-left: 8px;

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
			font-size: 15px;
			display: flex;

			.id {
				color: rgb(92, 92, 92);
			}
		}
	}
</style>
