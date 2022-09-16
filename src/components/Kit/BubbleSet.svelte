<script lang="ts">
	export let messages: Array<string>;
	export let side: "left" | "right";
</script>

{#each messages as message, i}
	<div class="bubble-wrapper {side}" class:last={i + 1 == messages.length}>
		{#if side == "left"}
			<div
				class="profile-picture"
				style={i + 1 == messages.length
					? "background-image: url('/img/default.jpg')"
					: ""}
			/>
		{/if}
		<div
			class="bubble {side}"
			class:last={i + 1 == messages.length}
			class:one-above={i != 0}
		>
			{message}
		</div>
	</div>
{/each}

<style lang="scss">
	.bubble-wrapper {
		position: relative;
		display: flex;
		flex-wrap: nowrap;

		&.last {
			margin-bottom: 20px;
			&::after {
				position: absolute;
				bottom: -18px;
				content: "00:14";
				color: gray;
				font-size: 14px;
			}
		}

		&.right {
			justify-content: right;
			&.last {
				&::after {
					right: 0;
				}
			}
		}

		&.left {
			&.last {
				margin-bottom: 20px;
				&::after {
					left: 50px;
				}
			}
		}
	}

	.profile-picture {
		top: 3px;
		position: absolute;
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 100%;
		background-size: cover;
		bottom: 0;
	}

	.bubble {
		white-space: pre;
		hyphens: auto;
		position: relative;
		width: auto;
		padding: 16px;
		padding-top: 12px;
		padding-bottom: 12px;
		border-radius: 30px;
		max-width: 400px;
		line-height: 22px;

		&.left {
			background: #272727;
			margin-left: 50px;
			border-bottom-left-radius: 0;
			&.one-above {
				border-top-left-radius: 0;
			}
		}

		&.right {
			margin-left: auto;
			background: #2183c4;
			border-bottom-right-radius: 0;
			&.one-above {
				border-top-right-radius: 0;
			}
		}
	}
</style>
