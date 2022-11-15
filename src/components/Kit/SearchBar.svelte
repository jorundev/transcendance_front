<script lang="ts">
	let background: string = "#232324";

	function onFocus() {
		background = "#38383a";
	}

	function onUnfocus() {
		background = "#232324";
	}

	export let value = "";
</script>

<div class="search-bar">
	<div class="search-bar-icon" style="background-color: {background};" />
	<input
		class="search-bar-input"
		on:focus={onFocus}
		on:blur={onUnfocus}
		on:input
		bind:value
		placeholder="Search"
	/>
</div>

<style lang="scss">
	.search-bar {
		margin: 0;
		width: 100%;
		display: flex;
		padding-top: 10px;
		padding-bottom: 10px;
		box-sizing: border-box;
	}

	.search-bar-icon {
		transition: background-color 140ms;
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		background-color: #232324;
		border-top-left-radius: 12px;
		border-bottom-left-radius: 12px;
		background-image: url("../img/search.png");
		background-size: 24px;
		background-repeat: no-repeat;
		background-position: center;
	}

	.search-bar-input {
		width: 100%;
		margin: 0;
		transition: background-color 140ms, width 140ms;
		font-size: 16px;
		flex-grow: 1;
		height: 10px;
		background: #232324;
		color: #f0f0f2;
		border: none;
		padding: 15px;
		border-top-right-radius: 12px;
		border-bottom-right-radius: 12px;

		&:focus {
			outline: none;
			background: #38383a;
		}
	}
</style>
