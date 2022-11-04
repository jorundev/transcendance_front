<script lang="ts">
	import { colorFromString } from "../../utils";

	export let displayName: string;
	export let id: string;
	export let avatarLink = undefined;
	export let direct = false;
	export let outline = true;

	export let fontSize: string = "22px";

	let bg = "#FFFFFF";

	$: {
		if (avatarLink) {
			bg = "background-image: url('/pictures/" + avatarLink + "')";
		} else {
			bg = direct
				? "background-image: url('/img/default.jpg')"
				: "background-color: " +
				  colorFromString(displayName + "#" + id);
		}
	}
</script>

<div
	class="avatar"
	style="{bg}; font-size: {fontSize}"
	data-char={avatarLink || direct ? "" : displayName[0].toUpperCase()}
	class:direct={direct && outline}
/>

<style lang="scss">
	.avatar {
		display: grid;
		place-items: center;
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 100%;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;

		&::after {
			content: attr(data-char);
			position: absolute;
			font-weight: lighter;
			transform: translateY(-0px);
		}

		&.direct {
			outline: 3px solid rgb(255, 255, 255);
		}
	}
</style>
