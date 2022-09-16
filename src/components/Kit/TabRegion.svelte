<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { browserName } from "../../utils";
	export let selectedIndex: number;
	export let selected: string;

	let scrolling: boolean = false;

	let scrollRegion: Element | null;

	const dispatch = createEventDispatcher<{ onscroll: number }>();

	$: scrollIntoView(selectedIndex);

	function scrollIntoView(index: number) {
		if (scrollRegion == null) {
			return;
		}

		let elements = scrollRegion.querySelectorAll(".tab-section");
		const positions = Array.from(elements).map(
			(el) => (el as HTMLElement).offsetLeft
		);
		const closest_left = closest(positions, scrollRegion.scrollLeft + 16);

		// WebKit annoys me
		if (browserName() == "safari") {
			if (
				closest_left != scrollRegion.scrollLeft - 16 &&
				closest_left != scrollRegion.scrollLeft
			) {
				return;
			}
		} else if (!scrolling && closest_left != scrollRegion.scrollLeft) {
			return;
		}

		scrolling = true;
		setTimeout(() => (scrolling = false), 500);

		let el = scrollRegion.querySelector(`.tab-section[href=${selected}]`);
		if (el == null) {
			return;
		}

		/* "behavior: 'smooth'" does not work on Safari 14 (last version supported on macOS Mojave) */
		/* 42 Lyon computers are still running on macOS Mojave */
		/* So there are no animations on those versions. It works but it looks like shit */
		/* Too bad! */
		scrollRegion.scrollTo({
			top: 0,
			left: el.scrollWidth * index + 16,
			behavior: "smooth",
		});
	}

	function closest(arr: number[], goal: number): number {
		return arr.reduce((prev, curr) => {
			return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
		});
	}

	function onScroll() {
		if (!scrolling) {
			let elements = scrollRegion.querySelectorAll(".tab-section");

			const positions = Array.from(elements).map(
				(el) => (el as HTMLElement).offsetLeft
			);
			const closest_left = closest(
				positions,
				scrollRegion.scrollLeft + 16
			);

			let index: number = 0;
			for (let el of elements) {
				const hel = el as HTMLElement;
				if (hel.offsetLeft == closest_left) {
					if (selectedIndex != index) {
						dispatch("onscroll", index);
					}
					break;
				}
				++index;
			}
		}
	}
</script>

<div class="tab-region" bind:this={scrollRegion} on:scroll={onScroll}>
	<slot />
</div>

<style lang="scss">
	.tab-region {
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
		scroll-snap-type: x mandatory;
		width: 100%;

		&::-webkit-scrollbar {
			display: none;
		}
	}
</style>
