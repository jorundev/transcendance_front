<script lang="ts">
	import HoverableTooltip from "./Kit/HoverableTooltip.svelte";
	import { stLoggedUser } from "../stores";
	import HomeCategory from "./Kit/HomeCategory.svelte";
	import FriendsScroll from "./Kit/FriendsScroll.svelte";
	type Rank =
		| "sachiel"
		| "shamshel"
		| "ramiel"
		| "gaghiel"
		| "israfel"
		| "sandalphon"
		| "matarael"
		| "sahaquiel"
		| "ireul"
		| "leliel"
		| "bardiel"
		| "zeruel"
		| "arael"
		| "armisael";

	let percentage = 50;
	let rank: Rank = "sachiel";

	let rank_description: string = "Sachiel - Third Angel";

	export let username: string;
	export let id: number;

	let id_str = "";

	$: {
		let s = "000" + id;
		id_str = s.substring(s.length - 4);
	}

	function getProfilePictureLink(): string {
		return $stLoggedUser.profile_picture
			? "/pictures/" + $stLoggedUser.profile_picture
			: "/img/default.jpg";
	}
</script>

<div class="profile-card">
	<div class="profile-line-1">
		<div
			class="profile-picture"
			style="{"background-image: url('" +
				getProfilePictureLink() +
				"');"};"
		/>
		<div class="profile-info-1">
			<div class="profile-name-and-rank">
				<div class="profile-name">{username}</div>
				<div class="profile-id">#{id_str}</div>
				<HoverableTooltip tooltip={rank_description}>
					<div
						class="profile-rank"
						style="background-image: url('img/angels/{rank}.svg');"
					/>
				</HoverableTooltip>
			</div>
			<div class="level-info">
				<div class="profile-level">Level 16</div>
				<div class="level-bar">
					<div class="done" style="width: {percentage}%;" />
				</div>
			</div>
		</div>
	</div>
</div>
<HomeCategory title="Friends">
	<FriendsScroll />
</HomeCategory>

<style lang="scss">
	.profile-card {
		width: 100%;
		background: #161618;
		padding: 20px;
		border-radius: 12px;
		box-sizing: border-box;
	}

	.profile-line-1 {
		color: #f3f3f3;
		width: 100%;
		display: flex;
	}

	.profile-name {
		margin-top: 10px;
		margin-bottom: 10px;
		font-size: 20px;
	}

	.profile-info-1 {
		width: 100%;
		margin-left: 18px;
	}

	.level-info {
		width: 100%;
	}

	.profile-name-and-rank {
		display: flex;
	}

	.level-bar {
		width: 100%;
		height: 10px;
		margin-top: 10px;
		border-radius: 4px;
		max-width: 400px;
		background: rgb(60, 60, 60);

		.done {
			height: 100%;
			border-radius: 4px;
			background: rgb(202, 17, 85);
		}
	}

	.profile-rank {
		background-size: cover;
		margin-top: 10px;
		margin-left: 8px;
		width: 18px;
		height: 18px;
	}

	.profile-picture {
		flex-shrink: 0;
		width: 80px;
		height: 80px;
		background-size: cover;
		border-radius: 100%;
	}

	.profile-id {
		margin-top: 13px;
		margin-left: 1px;
		color: rgb(225, 225, 225);
		height: auto;
	}
</style>
