<script>
	import Button from "../Kit/Button.svelte";
	import Card from "../Kit/Card.svelte";
</script>

<div class="notifications">
	<Card>
		<div class="game-invite">
			<div class="user">
				<div class="avatar" />
				<div class="name">username</div>
				<div class="id">#9999</div>
			</div>
			<div class="desc">has challenged you to a game!</div>
		</div>
		<div class="buttons">
			<Button red>Decline</Button>
			<Button>Accept</Button>
		</div>
	</Card>
</div>

<style lang="scss">
	.notifications {
		margin: 20px;
		margin-left: 73px;
	}

	.avatar {
		width: 60px;
		height: 60px;
		background-image: url("/img/default.jpg");
		background-size: 100%;
		border-radius: 100%;
		margin-right: 12px;
	}

	.desc {
		text-align: center;
		padding: 16px;
		font-size: 18px;
	}

	.game-invite {
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
	}

	.user {
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(47, 47, 47);
		padding: 16px;
		padding-left: 20px;
		padding-right: 20px;
		border-radius: 10px;
	}

	.buttons {
		justify-content: center;
		max-width: 800px;
		width: 100%;
		margin-left: auto;
		margin-right: auto;
		display: flex;
		gap: 10px;
	}
</style>
