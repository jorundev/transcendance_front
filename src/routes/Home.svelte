<script lang="ts">
	import Tabs from "../components/Kit/Tabs.svelte";
	import TabRegionElement from "../components/Kit/TabRegionElement.svelte";
	import ProfileCard from "../components/ProfileCard.svelte";
	import { stLoggedUser } from "../stores";
	import TopBar from "../components/TopBar.svelte";
	import AchievementsCard from "../components/AchievementsCard.svelte";

	const tabs: Array<string> = ["Profile", "Achievements"];
</script>

{#if $stLoggedUser != null}
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
{/if}

<style lang="scss">
	.profile-tab {
		height: 300px;
		width: 100%;
	}
</style>
