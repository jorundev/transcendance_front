<script lang="ts">
	import TabButtons from "./TabButtons.svelte";
	import TabRegion from "./TabRegion.svelte";

	export let tabs: Array<string>;

	let selectedIndex: number = 0;
	let selected: string = tabs[selectedIndex];

	function updateSelection(data: { detail: string }) {
		selected = data.detail;
		for (selectedIndex = 0; selectedIndex <= tabs.length; ++selectedIndex) {
			if (tabs[selectedIndex] == selected) {
				break;
			}
		}
	}

	function updateSelectionFromScroll(data: { detail: number }) {
		selectedIndex = data.detail;
		selected = tabs[selectedIndex];
	}
</script>

<div class="tabs">
	<TabButtons {selected} buttons={tabs} on:onselect={updateSelection} />
	<TabRegion
		{selected}
		{selectedIndex}
		on:onscroll={updateSelectionFromScroll}
	>
		<slot />
	</TabRegion>
</div>
