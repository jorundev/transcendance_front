<script lang="ts">
	import Tabs from "../components/Kit/Tabs.svelte";
	import TabRegionElement from "../components/Kit/TabRegionElement.svelte";
	import ProfileCard from "../components/ProfileCard.svelte";

	const tabs: Array<string> = ["Profile", "Friends"];
</script>

<Tabs {tabs}>
	<TabRegionElement href="Profile">
		<div class="profile-tab">
			<ProfileCard />
		</div>
	</TabRegionElement>
	<TabRegionElement href="Friends">
		<div class="profile-tab">
			<ProfileCard />
		</div>
	</TabRegionElement>
</Tabs>

<style lang="scss">
	.profile-tab {
		height: 300px;
		width: 100%;
	}
	.history-tab {
		height: 300px;
		width: 100%;
	}
</style>
