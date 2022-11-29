<script lang="ts">
	import type { LobbyWinner } from "../../lobbies";
	import type { User } from "../../users";
	import Modal from "../Kit/Modal.svelte";
	import ClickOutside from "svelte-click-outside";
	import Card from "../Kit/Card.svelte";
	import { createEventDispatcher } from "svelte";
	import { stLoggedUser } from "../../stores";
	import UserAvatar from "../Users/UserAvatar.svelte";

	interface GameEndModalInfo {
		winner: LobbyWinner;
		player1: User;
		player2: User;
		xp: number;
        player1Score: number;
		player2Score: number;
	}

	let dispatch = createEventDispatcher();

	export let data: GameEndModalInfo;
	let weWon = data.player1.uuid === $stLoggedUser.uuid;
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
                        <UserAvatar uuid={data.player1.uuid}></UserAvatar>
                    </div>
                    <div class="sc">{data.player1Score}</div>
                    <div class="sep">|</div>
                    <div class="sc">{data.player2Score}</div>
                    <div class="avatar">
                        <UserAvatar uuid={data.player2.uuid}></UserAvatar>
                    </div>
                </div>
                <div class="xp-gain"></div>
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
        box-sizing: border-box;
        width: 100%;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .sc {
        font-size: 18px;
    }
    
    .sep {
        font-size: 1.4ch;
        opacity: .5;
    }
    
    .avatar {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
    }

	.status {
		width: 240px;
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
