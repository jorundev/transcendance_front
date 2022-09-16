<script lang="ts">
	/*import Tabs from "../components/Kit/Tabs.svelte";
	import TabRegionElement from "../components/Kit/TabRegionElement.svelte";
	import ProfileCard from "../components/ProfileCard.svelte";
	import { stLoggedUser } from "../stores";
	import TopBar from "../components/TopBar.svelte";
	import AchievementsCard from "../components/AchievementsCard.svelte";
	import MainNav from "../components/Kit/MainNav.svelte";

	const tabs: Array<string> = ["Profile", "Achievements"];*/

	import SideBar from "../components/SideBar.svelte";
</script>

<SideBar />

<!--
<div class="home">
	<MainNav current="home" />
	<div class="content">
		<TopBar />
		<Tabs {tabs}>
			<TabRegionElement href="Profile">
				<div class="profile-tab">
					<ProfileCard
						username={$stLoggedUser.username}
						id={$stLoggedUser.id}
					/>
				</div>
			</TabRegionElement>
			<TabRegionElement href="Achievements">
				<div class="profile-tab">
					<AchievementsCard />
				</div>
			</TabRegionElement>
		</Tabs>
	</div>
</div>
-->
<style lang="scss">
	/*.profile-tab {
		height: 300px;
		width: auto;
	}

	@media screen and (min-width: 800px) {
		.home {
			display: flex;
		}

		.content {
			width: calc(100% - 70px);
			max-width: 1200px;
		}
	}*/
</style>
