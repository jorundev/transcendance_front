<script lang="ts" context="module">
	import { stUsers } from "../../stores";

	export enum ChannelType {
		Single,
		Group,
	}

	export interface Channel {
		type: ChannelType;
		id: string;
		last_message: {
			sender: string | null;
			value: string;
			date: Date;
		};
	}
</script>

<script lang="ts">
	import { push } from "svelte-spa-router";

	export let info: Channel;
	let time_since_lm: number = 0;
	let time_str: string = "";
	let truncated_msg: string = "";

	$: {
		truncated_msg = info.last_message.value;
		if (info.last_message.value.length > 50) {
			truncated_msg = truncated_msg.substring(0, 50) + "...";
		}
	}

	function getTimeStr(ts: number): string {
		if (ts < 15) {
			return "now";
		}

		if (ts < 60) {
			let n_seconds = Math.floor(ts);
			return n_seconds + ` second${n_seconds != 1 ? "s" : ""} ago`;
		}

		if (ts < 3600) {
			let n_minutes = Math.floor(ts / 60);
			return n_minutes + ` minute${n_minutes != 1 ? "s" : ""} ago`;
		}

		if (ts < 3600 * 24) {
			let n_hours = Math.floor(ts / 3600);
			return n_hours + ` hour${n_hours != 1 ? "s" : ""} ago`;
		}

		let n_days = Math.floor(ts / (3600 * 24));
		return n_days + ` day${n_days != 1 ? "s" : ""} ago`;
	}

	$: time_since_lm =
		(new Date().valueOf() - info.last_message.date.valueOf()) / 1000;

	$: time_str = getTimeStr(time_since_lm);

	function goToMessages() {
		if (info.type == ChannelType.Single) {
			push("/chat/single/" + info.id);
		} else {
			push("/chat/group/" + info.id);
		}
	}
</script>

{#if $stUsers}
	<div class="channel" on:click={goToMessages}>
		<div class="profile-picture" />
		<div class="data-line">
			<div class="username">
				<!-- TODO -->
				{$stUsers[info.id]?.username}#{$stUsers[info.id]?.id} · {time_str}
			</div>
			<div class="last-message">{truncated_msg}</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.channel {
		display: flex;
		gap: 18px;
		align-items: center;
		height: 80px;
		padding-bottom: 6px;
		padding-top: 6px;
		margin-bottom: 6px;
		padding-left: 10px;

		&:hover {
			background: rgb(20, 20, 20);
			border-radius: 20px;
			cursor: pointer;
		}
	}

	.profile-picture {
		flex-shrink: 0;
		width: 68px;
		height: 68px;
		background-image: url("/img/default.jpg");
		background-size: cover;
		border-radius: 100%;
	}

	.data-line {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.last-message {
		color: #787771;
	}
</style>
