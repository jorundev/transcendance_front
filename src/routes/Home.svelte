<script lang="ts">
	import Tabs from "../components/Kit/Tabs.svelte";
	import TabRegionElement from "../components/Kit/TabRegionElement.svelte";
	import ProfileCard from "../components/ProfileCard.svelte";
	import { stLoggedUser } from "../stores";
	import { api } from "../api";
	import { onMount } from "svelte";

	let serverDown = false;

	onMount(() => {
		serverDown = false;
		stLoggedUser.set(null);
	});

	stLoggedUser.subscribe(async (value) => {
		if (value == null) {
			let response = await api.whoami();
			if (response == null) {
				serverDown = true;
				return;
			}
			serverDown = false;
			stLoggedUser.set({
				username: response.username,
				uuid: response.uuid,
				id: response.identifier,
				profile_picture: response.profile_picture,
			});
		} else {
			if ($stLoggedUser.uuid != value.uuid) {
				stLoggedUser.set(null);
			}
		}
	});

	const tabs: Array<string> = ["Profile", "Friends"];
</script>

{#if serverDown}
	<div class="sorry">Server is down. Try again later!</div>
{/if}

{#if $stLoggedUser != null}
	<button
		on:click={async () => {
			let users = await api.users();
			for (const user of users) {
				console.log(user);
			}
		}}>Print users to console</button
	>
	<button
		on:click={async () => {
			let users = await api.users();
			for (const user of users) {
				fetch("/api/users/" + user.uuid, { method: "DELETE" });
			}
		}}>Wipe users</button
	>
	<button
		on:click={async () => {
			api.logout();
			stLoggedUser.set(null);
		}}>Logout</button
	>
	<Tabs {tabs}>
		<TabRegionElement href="Profile">
			<div class="profile-tab">
				<ProfileCard
					username={$stLoggedUser.username}
					id={$stLoggedUser.id}
				/>
			</div>
		</TabRegionElement>
		<TabRegionElement href="Friends">
			<div class="profile-tab">
				<ProfileCard
					username={$stLoggedUser.username}
					id={$stLoggedUser.id}
				/>
			</div>
		</TabRegionElement>
	</Tabs>
{/if}

<style lang="scss">
	.profile-tab {
		height: 300px;
		width: 100%;
	}
	.sorry {
		color: gray;
		text-align: center;
		font-size: 40px;
	}
</style>
