<script lang="ts">
	import SideBar from "../components/SideBar.svelte";

	let picture: boolean = true;
</script>

<svelte:head>
	<title>404 - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
<SideBar />
<div class="center">
	<div>
		<h1>{picture ? "404" : "GATO TEQUILA"}</h1>
		<img
			title="ah! so sorry!"
			alt="ah! so sorry!"
			src={picture ? "/img/404.jpg" : "/img/tequila.jpg"}
			on:click={() => {
				picture = !picture;
			}}
		/>
	</div>
</div>

<style>
	h1 {
		text-align: center;
		margin: 20px;
		font-size: 80px;
	}

	@keyframes jiggle {
		from {
			transform: scale(50);
		}
		to {
			transform: scale(1);
		}
	}

	img {
		display: block;
		animation: jiggle 0.2s;
		margin-left: auto;
		margin-right: auto;
	}

	.center {
		height: 100%;
		display: grid;
		align-items: center;
		justify-content: center;
	}
</style>
