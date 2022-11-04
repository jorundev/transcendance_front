<script lang="ts">
	import type { GameInviteNotificationData } from "../../notifications";
	import { api, APIStatus, getUserProfilePictureLink } from "../../api";
	import type { User } from "../../users";

	export let data: GameInviteNotificationData;
	let user: User = undefined;
	$: api.getUserData(data.user).then((data) => {
		if (data != APIStatus.NoResponse) {
			user = data;
		}
	});

	let avatar = getUserProfilePictureLink(data.user);
	$: avatar = getUserProfilePictureLink(data.user);
</script>

<div class="invite">
	<div class="icons">
		<div class="logo" />
		<div class="avatar" style="background-image: url('{avatar}')" />
	</div>
	<div class="resume">
		<div class="inner">
			<div class="username">
				{user?.username}
				<div class="id">#{user?.identifier}</div>
			</div>
			<div>challenged you to a battle</div>
		</div>
	</div>
</div>

<style lang="scss">
	.invite {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.resume {
		display: flex;

		.id {
			color: #787771;
		}

		.inner {
			display: flex;
			gap: 0.44ch;
		}
	}

	.username {
		display: flex;
	}

	.icons {
		display: flex;
		gap: 4px;
	}

	.logo {
		flex-shrink: 0;
		width: 30px;
		height: 30px;
		background-size: 80%;
		background-position: center;
		background-repeat: no-repeat;
		background-image: url("/img/swords.png");
	}

	.avatar {
		flex-shrink: 0;
		width: 30px;
		height: 30px;
		border-radius: 100%;
		background-size: cover;
	}
</style>
