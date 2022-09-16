<script lang="ts">
	import { stLoggedUser } from "../../stores";

	import { onMount } from "svelte";
	import BubbleSet from "./BubbleSet.svelte";

	let chatDiv: HTMLDivElement;
	let textArea: HTMLInputElement;

	const text_area_height = "80px";

	interface ChatMessage {
		sender: string;
		value: string;
		date: string;
	}

	interface MessageSet {
		side: "left" | "right";
		messages: Array<string>;
	}

	let messages: Array<ChatMessage> = [
		{
			sender: "",
			value: "Lorem ipsum dolor sit amet.",
			date: "00:07",
		},
		{
			sender: "",
			value: "Lorem ipsum dolor sit amet.",
			date: "00:07",
		},
		{
			sender: "",
			value: "Lorem ipsum dolor sit amet.",
			date: "00:07",
		},
		{
			sender: $stLoggedUser.uuid,
			value: "ta gueule",
			date: "00:09",
		},
		{
			sender: "",
			value: "Lorem ipsum dolor sit amet.",
			date: "00:10",
		},
	];

	let groups: Array<MessageSet> = [];

	function updateMessages() {
		groups = [];
		let previous: ChatMessage | null = null;
		for (const message of messages) {
			if (previous?.sender == message.sender) {
				groups[groups.length - 1].messages.push(message.value);
			} else {
				groups.push({
					side:
						message.sender == $stLoggedUser.uuid ? "right" : "left",
					messages: [message.value],
				});
			}
			previous = message;
		}
	}

	function sendMessage() {
		const value = textArea.value.trim();
		textArea.value = "";
		if (value == "") {
			return;
		}
		messages.push({
			sender: $stLoggedUser?.uuid,
			value,
			date: "",
		});

		updateMessages();
	}

	onMount(() => {
		chatDiv.scrollTo(0, 9999999);
		updateMessages();
	});
</script>

<div class="chat">
	<div class="top">
		<div
			class="profile-picture"
			style="background-image: url('/img/default.jpg')"
		/>
		<div class="name">Sample</div>
	</div>
	<div class="bubbles" bind:this={chatDiv}>
		{#each groups as set}
			<BubbleSet side={set.side} messages={set.messages} />
		{/each}
		<div class="pad" />
	</div>
	<div class="response-bar" style="height: {text_area_height}">
		<input
			placeholder="Start a message"
			class="input"
			tabindex="0"
			bind:this={textArea}
			on:keypress={(e) => {
				if (e.key == "Enter") {
					sendMessage();
				}
			}}
		/>
		<div class="send" on:click={sendMessage} />
	</div>
</div>

<style lang="scss">
	.bubbles {
		position: relative;
		padding-top: 10px;
		overflow: auto;
		height: calc(100vh - var(--scrollbar-height) - 197px);
		width: 100%;
		transform: translateX(-16px);
		padding-left: 16px;
		padding-right: 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;

		&::-webkit-scrollbar {
			background-color: black;
		}

		::-webkit-scrollbar-track {
			border-radius: 10px;
			width: 1px;
		}

		&::-webkit-scrollbar-thumb {
			background-color: rgb(59, 59, 59);
			border-radius: 10px;
		}
	}

	.response-bar {
		border-top: 1px solid #232323;
		gap: 8px;
		padding: 16px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		position: fixed;
		bottom: 0;
		left: 0;
		background-color: black;
		width: 100%;
	}

	.input {
		font-size: 14px;
		width: 100%;
		height: 40px;
		line-height: 40px;
		padding: 4px;
		padding-left: 14px;
		padding-right: 14px;
		background: #1b1b1b;
		border: none;
		color: #d8d7d2;
		resize: none;
		border-radius: 20px;

		&::placeholder {
			color: rgb(91, 91, 91);
		}

		&:focus {
			background: #282828;
			outline: none;
		}
	}

	.pad {
		width: 100%;
		padding-bottom: 10px;
	}

	.send {
		cursor: pointer;
		background-color: #48a0db;
		height: 30px;
		padding: 4px;
		width: 40px;
		border-radius: 14px;
		background-position: center;
		background-repeat: no-repeat;
		background-size: 20px;
		background-image: url("/img/send.png");
	}

	.top {
		justify-content: center;
		gap: 14px;
		align-items: center;
		display: flex;
		height: 80px;
		border-bottom: 1px solid #232323;
		background: black;
		padding-bottom: 10px;
	}

	.profile-picture {
		flex-shrink: 0;
		border-radius: 100%;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		width: 50px;
		height: 50px;
	}
</style>
