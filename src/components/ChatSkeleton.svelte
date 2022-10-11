<div class="skel">
	<div class="left">
		<div class="avatar-space">
			<div class="avatar" />
		</div>
		<div class="block">
			<div class="message" style="width: 180px; height: 120px;">
				<div class="line" />
				<div class="line" />
				<div class="line" />
			</div>
			<div class="message" style="width: 140px; height: 80px;">
				<div class="line" />
				<div class="line" />
			</div>
		</div>
	</div>
	<div class="right">
		<div class="block">
			<div class="message" style="width: 180px; height: 120px;">
				<div class="line" />
				<div class="line" />
				<div class="line" />
			</div>
			<div class="message" style="width: 140px; height: 80px;">
				<div class="line" />
				<div class="line" />
			</div>
		</div>
	</div>
	<div class="left">
		<div class="avatar-space">
			<div class="avatar" />
		</div>
		<div class="block">
			<div class="message" style="width: 140px; height: 80px;">
				<div class="line" />
				<div class="line" />
			</div>
			<div class="message" style="width: 180px; height: 120px;">
				<div class="line" />
				<div class="line" />
				<div class="line" />
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	@keyframes pulse {
		0% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.6;
		}
	}

	@keyframes entry {
		from {
			opacity: 0;
		}
		to {
			opacity: 0.6;
		}
	}

	.skel {
		opacity: 0;
		animation: pulse 1.2s 0.3s ease-in-out infinite;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: auto;
		height: 100%;
		margin-left: 16px;
		margin-right: 16px;

		.left {
			.avatar-space {
				width: 40px;
				height: 100%;
			}
			.block {
				display: flex;
				flex-direction: column;
				gap: 10px;
				width: 100%;

				.message {
					background: rgb(40, 40, 40);
					min-height: 40px;
					display: flex;
					gap: 10px;
					flex-direction: column;
					justify-content: space-evenly;
					padding-left: 10px;
					padding-right: 10px;
					box-sizing: border-box;

					.line {
						width: 100%;
						height: 10px;
						background: rgb(72, 70, 68);
					}
				}
			}
			.avatar {
				width: 40px;
				height: 40px;
				border-radius: 100%;
				background: rgb(72, 70, 68);
			}
			display: flex;
			gap: 10px;
			position: relative;
			width: 240px;
			left: 0;
		}

		.right {
			display: flex;
			flex-direction: row;
			justify-content: right;

			.block {
				display: flex;
				flex-direction: column;
				justify-content: right;
				gap: 10px;

				.message {
					margin-left: auto;
					background: rgb(16, 45, 77);
					min-height: 40px;
					display: flex;
					gap: 10px;
					flex-direction: column;
					justify-content: space-evenly;
					padding-left: 10px;
					padding-right: 10px;
					box-sizing: border-box;

					.line {
						width: 100%;
						height: 10px;
						background: rgb(72, 70, 68);
					}
				}
			}
		}
	}
</style>
