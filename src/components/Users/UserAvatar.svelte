<script lang="ts">
	import { getUserProfilePictureLink } from "../../api";
	import { stUsers } from "../../stores";

	export let uuid: string;

	let avatar = "/img/default.jpg";
	$: if (uuid && $stUsers) {
		avatar = getUserProfilePictureLink(uuid);
	}
</script>

<div class="user-avatar" style={"background-image: url('" + avatar + "')"} />

<style lang="scss">
	.user-avatar {
		width: 100%;
		height: 100%;

		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		border-radius: 100%;
		flex-shrink: 0;
	}
</style>
