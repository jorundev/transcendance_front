<script lang="ts">
	import { api, APIStatus } from "../api";
	import { stLobby, stToast } from "../stores";
	import { push } from "svelte-spa-router";
	import Card from "../components/Kit/Card.svelte";
	import LobbyList from "../components/Game/LobbyList.svelte";

	async function createCasualLobby() {
		if ($stLobby === null) {
			const lobby = await api.createLobby();
			if (lobby === null || lobby === APIStatus.NoResponse || (lobby as any).statusCode === 400) {
				stToast.set("Something wrong happened when creating lobby");
				return;
			}
			$stLobby = lobby;
		}
		setTimeout(() => push("/play/lobby"), 0);
	}
</script>

<svelte:head><title>Play - NEW SHINJI MEGA PONG ULTIMATE</title></svelte:head>
<div class="play">
	<div class="your-rank">
		<Card>
			<div class="content">
				<div class="rank-logo" />
				<div class="rank">
					<div class="rank-name">Sachiel</div>
					<div class="rank-number">Rank 3</div>
				</div>
			</div>
		</Card>
		<div class="title">Your Rank</div>
	</div>
	<div class="choices">
		<div class="choice" on:click={createCasualLobby}>
			<div class="top">
				<div class="title">CHOOSE AN OPPONENT</div>
				<div class="subtitle">Play against people you invite</div>
			</div>
			<div class="card blue" />
		</div>
		<div class="choice" on:click={() => push("/play/queue")}>
			<div class="top">
				<div class="title">JOIN THE QUEUE</div>
				<div class="subtitle">And gain more XP</div>
			</div>
			<div class="card red" />
		</div>
	</div>
	<div class="games">
		<div class="title">Current games</div>
		<div class="list">
			<LobbyList />
		</div>
	</div>
</div>

<style lang="scss">
	.choices {
		display: flex;
		width: 100%;
		gap: 20px;
		justify-content: space-around;
	}
	.games {
		width: 100%;

		border: 1px solid rgb(50, 50, 50);
		border-radius: 10px;

		.title {
			width: 100%;
			padding: 10px;
			box-sizing: border-box;
		}

		.list {
			max-height: 400px;
			padding: 10px;
			display: flex;
			flex-direction: column;
			gap: 10px;
			overflow-x: hidden;
			overflow-y: auto;
		}
	}
	.play {
		display: flex;
		gap: 30px;
		flex-direction: column;
		align-items: center;
		margin: 20px;
		margin-top: 40px;
		margin-left: 100px;
		display: flex;
		justify-content: center;

		.your-rank {
			width: 260px;
			display: flex;
			flex-direction: column;
			height: 148px;
			background: rgb(21, 98, 21);
			border-radius: 14px;

			.title {
				transform: translateY(5px);
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 18px;
			}
		}

		.content {
			min-width: 200px;
			display: flex;
			justify-content: center;
		}

		.rank-logo {
			background-image: url("/img/angels/sachiel.svg");
			background-size: cover;
			width: 80px;
			height: 80px;
			border-radius: 100%;
		}

		.rank {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin-left: 16px;
			font-size: 14px;

			.rank-name {
				font-size: 20px;
			}
		}
	}

	.choice {
		cursor: pointer;
		position: relative;
		width: 100%;

		.top {
			transition: font-size 0.2s;
			user-select: none;
			font-size: 40px;
			position: absolute;
			flex-direction: column;
			z-index: 2;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100%;
			
			.title {
				text-align: center;
			}

			.subtitle {
				margin: 10px;
				font-size: 18px;
				text-align: center;
			}

			&:hover {
				font-size: 46px;
			}
		}
	}

	.card {
		cursor: pointer;
		position: relative;
		width: 100%;
		height: 180px;
		border-radius: 10px;

		@keyframes layer1 {
			from {
				background-position: 0 0;
			}
			to {
				background-position: -100% -100%;
			}
		}

		@keyframes layer2 {
			from {
				background-position: 0 0;
			}
			to {
				background-position: -100% 100%;
			}
		}

		&:before {
			content: "";
			animation: layer1 100s linear infinite;
			background-size: 1000px;
			z-index: 1;
			position: absolute;
			width: 100%;
			height: 100%;
			background-image: url("/img/fog.png");
			mix-blend-mode: hard-light;
			opacity: 0.5;
			border-radius: 10px;
		}

		&:after {
			content: "";
			animation: layer2 100s linear infinite;
			background-size: 1000px;
			z-index: 1;
			position: absolute;
			width: 100%;
			height: 100%;
			background-image: url("/img/stars.jpg");
			mix-blend-mode: overlay;
			border-radius: 10px;
		}

		&.red {
			background: rgb(255, 0, 0);
		}

		&.blue {
			background: rgb(0, 0, 255);
			&:before {
				animation: layer2 100s linear infinite;
			}
			&:after {
				animation: layer1 100s linear infinite;
			}
		}
	}

	@media screen and (max-width: 799px) {
		.play {
			margin-left: 20px;
		}

		.card {
			height: 140px;
		}

		.choices {
			flex-direction: column;
		}
	}
</style>
