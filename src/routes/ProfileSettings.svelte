<script lang="ts">
	import { pop } from "svelte-spa-router";
	import { stLoggedUser } from "../stores";
	import SideBar from "../components/SideBar.svelte";
	import { api, APIStatus } from "../api";

	let innerWidth = 0;

	function getProfilePictureLink(): string {
		return $stLoggedUser && $stLoggedUser.avatar
			? "/pictures/" + $stLoggedUser.avatar
			: "/img/default.jpg";
	}
	
	function getProfilePictureLinkFrom(from: string | null): string {
		return from
			? "/pictures/" + from
			: "/img/default.jpg";
	}

	let avatarPromise = Promise.resolve(getProfilePictureLink());
	let currentAvatar = "";
	
	$: avatarPromise.then((img) => currentAvatar = img);
	
	let drag = false;

	async function uploadFile(file: File) {
		if (
			![
				"image/png",
				"image/jpeg",
				"image.apng",
				"image/gif",
				"image.webp",
			].includes(file.type)
		) {
			return;
		}
		
		const pm = api.changeAvatar(file);
		avatarPromise = pm.then((obj) => {
			if (obj !== null && obj !== APIStatus.NoResponse) {
				return getProfilePictureLinkFrom(obj.avatar);
			}
		});
		const res = await pm;
		if (res === null || res === APIStatus.NoResponse) {
			return ;
		}
		if (res.statusCode === 413) {
			avatarPromise = Promise.resolve(getProfilePictureLink());
			return ;
		}
	}
</script>

<svelte:window bind:innerWidth />
<svelte:head>
	<title>Profile - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
{#if $stLoggedUser != null}
	<SideBar active="settings" />
	<div class="s">
		<div class="settings">
			<div class="top">
				<div
					class="back"
					on:click={() => {
						pop();
					}}
				/>
				<div class="title">Profile</div>
				<div class="empty" style="width: 40px;" />
			</div>
			<div class="category">Avatar</div>
			<div class="avatar">
				{#await avatarPromise}
					<div class="loading" style={"background-image: url('" + currentAvatar + "');"} />
				{:then data} 
				<div
					class="inner"
					class:drag
					style={"background-image: url('" +
						data +
						"')"}
					on:click={() => {
						let input = document.createElement("input");
						input.type = "file";
						input.click();

						input.onchange = (e) => {
							e.preventDefault();
							if (input.files?.length === 1) {
								uploadFile(input.files[0]);
							}
						};
					}}
					on:dragenter={() => (drag = true)}
					on:dragexit={() => (drag = false)}
					on:dragover|preventDefault={() => {}}
					on:drop|preventDefault={(e) => {
						if (e.dataTransfer?.items?.length === 1) {
							uploadFile(e.dataTransfer.items[0].getAsFile());
						}

						drag = false;
					}}
					on:change={(e) => console.log(e)}
				/>
				{/await}
			</div>
			<div class="category">Username</div>
			<div class="input">
				<input type="text" disabled value={$stLoggedUser.username} />
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	@keyframes pulse {
		0% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.6;
		}
	}
	
	.s {
		display: flex;
		justify-content: center;
	}

	.settings {
		user-select: none;
		-webkit-user-select: none;
		width: 100%;
		display: flex;
		flex-direction: column;
		max-width: 1200px;
		padding-top: 10px;
	}

	.title {
		user-select: none;
		-webkit-user-select: none;
		margin-top: 10px;
		margin-bottom: 16px;
		text-align: center;
		font-size: 18px;
	}

	.top {
		display: flex;
		justify-content: space-between;
	}

	.back {
		cursor: pointer;
		width: 40px;
		height: 40px;
		background-image: url("/img/left.png");
		background-size: 50%;
		background-position: center;
		background-repeat: no-repeat;
	}

	.category {
		margin-left: 10px;
		margin-right: 10px;
		margin-top: 4px;
		user-select: none;
		-webkit-user-select: none;
		transform: translateX(-16px);
		padding: 8px;
		padding-left: 16px;
		color: rgb(94, 94, 94);
		font-size: 14px;
		width: 100%;
		background: rgb(29, 29, 29);
		font-weight: bold;
		text-transform: uppercase;
	}

	.modal {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		position: absolute;
	}

	.avatar {
		width: 100%;
		display: flex;
		justify-content: center;
		margin-top: 18px;
		margin-bottom: 18px;

		.inner, .loading {
			&.loading {
				animation: pulse 1.2s 0.3s ease-in-out infinite;
			}
			
			position: relative;
			flex-shrink: 0;
			width: 120px;
			height: 120px;
			border-radius: 100%;
			background-size: cover;

			&:hover:not(.loading)::after {
				content: "";
				cursor: pointer;
				position: absolute;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.4);
				background-image: url("/img/photo.png");
				background-position: center;
				background-repeat: no-repeat;
				background-size: 40%;
				border-radius: 100%;
			}

			&.drag {
				outline: 5px dashed rgb(255, 255, 255);
			}
		}
	}

	.change-avatar {
		.title {
			text-align: left;
			font-size: 20px;
			padding-bottom: 10px;
		}

		min-width: 200px;
	}

	.input {
		margin: 20px;
	}

	input[type="text"] {
		font-size: 14px;
		width: calc(100% - 40px);
		height: 40px;
		line-height: 40px;
		background: rgb(38, 40, 42);
		border: none;

		color: #e9e8e4;
		resize: none;
		border-radius: 20px;

		padding-right: 20px;
		padding-left: 20px;

		&::placeholder {
			color: rgb(168, 166, 162);
		}

		&:focus {
			background: #282828;
			outline: none;
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 0.3;
			background: rgb(104, 104, 104);
			&::placeholder {
				color: rgb(177, 177, 177);
			}
		}
	}

	@media screen and (min-width: 800px) {
		.settings {
			padding-left: 59px;
			padding-top: 20px;
			max-width: none;
			border-right: 1px solid rgb(40, 40, 40);
			height: 100vh;
		}
		.title {
			margin-bottom: 10px;
			margin-left: 10px;
			font-size: 28px;
		}
		.category {
			margin-top: 20px;
			margin-bottom: 10px;
			padding-top: 20px;
			border-top: 1px solid rgb(40, 40, 40);
			background: transparent;
			text-transform: none;
			color: white;
			font-size: 24px;
		}
		.top {
			justify-content: left;
			align-items: center;
		}

		.input {
			margin-top: 0;
			margin-bottom: 0;
		}

		.avatar {
			justify-content: left;
			padding-left: 20px;
			margin-top: 8px;
		}
	}
</style>
