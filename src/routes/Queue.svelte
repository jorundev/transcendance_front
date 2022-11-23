<script lang="ts">
	import { api, APIStatus } from "../api";
	import { stLobby, stToast } from "../stores";
	import { onMount, onDestroy } from "svelte";
	import { pop, replace } from "svelte-spa-router";

	let inQueue = false;
    
    $: {
        if (inQueue && $stLobby) {
            inQueue = false;
            replace("/play/casual");
        }
    }

	onMount(async () => {
		if ($stLobby) {
			await api.leaveLobby($stLobby.uuid);
			$stLobby = null;
		}

		const resp = await api.joinQueue();
		if (resp === null || resp === APIStatus.NoResponse) {
			stToast.set("Something wrong happened when trying to join a queue");
			pop();
			return;
		} else if ((resp as any).statusCode === 400) {
			stToast.set("You already are in a queue");
            pop();
            inQueue = false;
            return ;
		}

		inQueue = true;
	});

	onDestroy(async () => {
		if (inQueue) {
			const resp = await api.leaveQueue();
			if (
				resp === null ||
				resp === APIStatus.NoResponse ||
				(resp as any).statusCode === 400
			) {
				stToast.set(
					"Something wrong happened when trying to leave queue"
				);
				pop();
				return;
			}
			inQueue = false;
		}
	});
</script>

<div class="queue">
	<div class="inner">
		<div class="wait">
			<div class="title">
				Please wait as we find a suitable opponent...
			</div>
			<div class="spinner-wrapper">
				<div class="spinner">
                    <div class="bounce1"></div>
                    <div class="bounce2"></div>
                    <div class="bounce3"></div>
                </div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.queue {
		width: 100%;
		height: 100%;
		box-sizing: border-box;

		.inner {
			width: 100%;
			height: 100%;
			display: grid;
			place-items: center;

			.wait {
				display: flex;
				flex-direction: column;
			}

			.title {
				font-size: 20px;
			}
		}
	}
    
    .spinner-wrapper {
        transform: translateY(-40px);
    }

	.spinner {
		margin: 100px auto 0;
		width: 70px;
		text-align: center;
	}

	.spinner > div {
		width: 18px;
		height: 18px;
		background-color: #333;

		border-radius: 100%;
		display: inline-block;
		-webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
		animation: sk-bouncedelay 1.4s infinite ease-in-out both;
	}

	.spinner .bounce1 {
		-webkit-animation-delay: -0.32s;
		animation-delay: -0.32s;
	}

	.spinner .bounce2 {
		-webkit-animation-delay: -0.16s;
		animation-delay: -0.16s;
	}

	@-webkit-keyframes sk-bouncedelay {
		0%,
		80%,
		100% {
			-webkit-transform: scale(0);
		}
		40% {
			-webkit-transform: scale(1);
		}
	}

	@keyframes sk-bouncedelay {
		0%,
		80%,
		100% {
			-webkit-transform: scale(0);
			transform: scale(0);
		}
		40% {
			-webkit-transform: scale(1);
			transform: scale(1);
		}
	}

	@media screen and (min-width: 800px) {
		.queue {
			padding-left: 80px;
			padding-right: 32px;
		}
	}
</style>
