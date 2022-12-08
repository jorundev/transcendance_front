<script lang="ts">
	import { LobbyWinner } from "../../lobbies";
	import type { User } from "../../users";
	import Modal from "../Kit/Modal.svelte";
	import ClickOutside from "svelte-click-outside";
	import Card from "../Kit/Card.svelte";
	import { createEventDispatcher } from "svelte";
	import { stLoggedUser } from "../../stores";
	import UserAvatar from "../Users/UserAvatar.svelte";
	import XpBar from "../XPBar.svelte";
	import Button from "../Kit/Button.svelte";

	interface GameEndModalInfo {
		winner: LobbyWinner;
		player1: User;
		player2: User;
		xp: number;
		oldxp: number;
		player1Score: number;
		player2Score: number;
	}

	let dispatch = createEventDispatcher();

	export let data: GameEndModalInfo;
	let weWon =
		(data.winner === LobbyWinner.Player1 &&
			data.player1.uuid === $stLoggedUser.uuid) ||
		(data.winner === LobbyWinner.Player2 &&
			data.player2.uuid === $stLoggedUser.uuid);
</script>

<Modal>
	<div class="modal">
		<ClickOutside on:clickoutside={() => dispatch("back")}>
			<Card>
				{#if weWon}
					<div class="status won">You won!</div>
				{:else}
					<div class="status lost">You lost!</div>
				{/if}
				<div class="score">
					<div class="avatar">
						<UserAvatar uuid={data.player1.uuid} />
					</div>
					<div class="sc">{data.player1Score}</div>
					<div class="sep">|</div>
					<div class="sc">{data.player2Score}</div>
					<div class="avatar">
						<UserAvatar uuid={data.player2.uuid} />
					</div>
				</div>
				<div class="xp-gain">
					<div class="desc">You gained {data.xp} xp!</div>
					<XpBar xp={data.oldxp} xp_end={$stLoggedUser.xp} />
					<div class="ok">
						<div class="yeah">
							<Button
								padding="8px"
								on:click={() => dispatch("back")}>Ok</Button
							>
						</div>
					</div>
				</div>
			</Card>
		</ClickOutside>
	</div>
</Modal>

<style lang="scss">
	.modal {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
	}

	.score {
		margin-left: auto;
		margin-right: auto;
		max-width: 240px;
		box-sizing: border-box;
		width: 100%;
		padding: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 18px;
		padding-bottom: 18px;
	}

	.ok {
		padding-top: 10px;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.yeah {
		width: 160px;
	}

	.xp-gain {
		display: flex;
		flex-direction: column;
		gap: 10px;
		.desc {
			width: 100%;
			text-align: center;
		}
	}

	.sc {
		font-size: 22px;
	}

	.sep {
		font-size: 1.4ch;
		opacity: 0.5;
	}

	.avatar {
		width: 60px;
		height: 60px;
		flex-shrink: 0;
	}

	.status {
		width: 320px;
		text-align: center;
		font-size: 20px;
		padding: 10px;
		border-radius: 10px;

		&.won {
			background-color: rgb(31, 107, 31);
		}
		&.lost {
			background-color: rgb(172, 31, 31);
		}
	}
</style>
