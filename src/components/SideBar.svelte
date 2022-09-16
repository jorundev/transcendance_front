<div class="sidebar">
	<div class="elem first" />
	<div class="elem" />
	<div class="elem" />
</div>

<style lang="scss">
	.sidebar {
		display: flex;
		flex-shrink: 0;

		.elem {
			width: 70px;
			height: 70px;
			background: blue;
			flex-shrink: 0;
		}
	}

	@media screen and (max-width: 800px) {
		.sidebar {
			position: absolute;
			bottom: 0;
			width: 100%;
			height: 70px;
			justify-content: space-evenly;
		}
	}

	@media screen and (min-width: 800px) {
		.sidebar {
			padding-top: 50px;
			border-right: 1px solid #ffffff42;
			position: relative;
			height: 100%;
			width: 70px;
			flex-direction: column;
			gap: 35px;

			.elem.first {
				border-bottom: 1px solid #ffffff42;
			}
		}
	}

	@media screen and (min-width: 1600px) {
		.sidebar {
			border-left: 1px solid #ffffff42;
		}
	}
</style>
