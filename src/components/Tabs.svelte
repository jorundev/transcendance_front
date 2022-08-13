<TabButtons></TabButtons>
<TabRegion>
	<TabRegionElement href="Profile">
		<div class="profile"></div>
	</TabRegionElement>
	<section class="history"></section>
</TabRegion>

<style lang="scss">
	.profile {
		height: 500px;
		background: red;
	}
	.history {
		height: 500px;
		background: green;
	}
</style>

<script lang="ts">
import TabButtons from "./TabButtons.svelte";
import TabRegion from "./TabRegion.svelte";
import TabRegionElement from "./TabRegionElement.svelte";
</script>
