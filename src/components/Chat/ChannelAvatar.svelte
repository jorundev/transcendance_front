<script lang="ts">
	import { colorFromString } from "../../utils";

	export let displayName: string;
	export let id: string;
	export let avatarLink = undefined;

	export let fontSize: string = "22px";

	let bg = "#FFFFFF";

	$: bg = avatarLink
		? "url('" + avatarLink + "')"
		: colorFromString(displayName + "#" + id);
</script>

<div
	class="avatar"
	style="background: {bg}; font-size: {fontSize}"
	data-char={avatarLink ? "" : displayName[0].toUpperCase()}
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
	}
</style>
