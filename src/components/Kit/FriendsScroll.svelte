<script lang="ts">
	//TODO: take this as a prop
	const friends = [
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
		"name",
	];
</script>

<div class="friends">
	{#each friends as friend}
		<div class="friend">
			<div
				class="friend-picture"
				style="background-image: url('/img/default.jpg');"
			/>
			<p>{friend}</p>
		</div>
	{/each}
</div>

<style lang="scss">
	.friends {
		overflow-x: scroll;
		overflow-y: hidden;
		display: flex;
		align-items: center;
		width: calc(100vw - var(--scrollbar-width));

		-ms-overflow-style: none;
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}

	.friend {
		text-align: center;
	}

	.friend-picture {
		width: 80px;
		height: 80px;
		border-radius: 100%;
		margin-left: 16px;
		margin-right: 16px;
		margin-bottom: 10px;
		background-size: cover;
	}

	@media screen and (min-width: 800px) {
	}
</style>
