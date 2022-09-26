<script lang="ts">
	import { getUserProfilePictureLink } from "../../api";

	export let messages: Array<{
		value: string;
		date: string;
		username: string;
		confirmed: boolean;
		sender: string;
	}>;
	export let side: "left" | "right";
</script>

{#each [...messages].reverse() as message, i}
	<div
		class="bubble-wrapper {side}"
		class:last={i == 0}
		data-date={message.date}
		data-username={side == "left" ? message.username + " · " : ""}
	>
		{#if side == "left"}
			<div
				class="profile-picture"
				style={i == 0
					? `background-image: url("${getUserProfilePictureLink(
							message.sender
					  )}")`
					: ""}
			/>
		{/if}
		<div
			class="bubble {side}"
			class:last={i != 0}
			class:one-above={i + 1 != messages.length}
			class:pending={!message.confirmed}
		>
			{message.value}
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
				content: attr(data-username) attr(data-date);
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
		position: absolute;
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 100%;
		background-size: cover;
		bottom: 2px;
	}

	.bubble {
		word-break: break-word;
		word-wrap: break-word;
		white-space: pre-wrap;
		hyphens: auto;
		position: relative;
		width: auto;
		padding: 16px;
		padding-top: 12px;
		padding-bottom: 12px;
		border-radius: 30px;
		max-width: 400px;
		line-height: 22px;
		margin-top: 3px;
		margin-bottom: 3px;

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

			&.pending {
				background: rgb(46, 46, 46);
			}
		}
	}
</style>
