<script lang="ts">
	import { stLoggedUser } from "../stores";
	import ClickOutside from "svelte-click-outside";
	import { api } from "../api";
	import { push } from "svelte-spa-router";

	let isFocused = false;
	let slideLeftAnimPlaying = false;

	function getProfilePictureLink(): string {
		return $stLoggedUser.profile_picture
			? "/pictures/" + $stLoggedUser.profile_picture
			: "/img/default.jpg";
	}
</script>

<ClickOutside
	on:clickoutside={() => {
		slideLeftAnimPlaying = true;
		setTimeout(() => {
			isFocused = false;
			slideLeftAnimPlaying = false;
		}, 200);
	}}
>
	<div class="top-bar">
		<div
			class="profile-button"
			on:click={() => (isFocused = true)}
			style={"background-image: url('" + getProfilePictureLink() + "');"}
		/>
	</div>
	{#if isFocused}
		<div class="after {slideLeftAnimPlaying ? 'back' : ''}">
			<div
				class="menu-item console"
				on:click={async () => {
					let users = await api.users();
					for (const user of users) {
						console.log(user);
					}
				}}
			>
				Print users to console
			</div>
			<div
				class="menu-item wipe"
				on:click={async () => {
					let users = await api.users();
					for (const user of users) {
						fetch("/api/users/" + user.uuid, { method: "DELETE" });
					}
				}}
			>
				Wipe all users
			</div>
			<div
				class="menu-item settings"
				on:click={() => {
					push("/settings");
				}}
			>
				Settings
			</div>
			<div
				class="menu-item logout"
				on:click={async () => {
					api.logout();
					stLoggedUser.set(null);
				}}
			>
				Log out
			</div>
		</div>
	{/if}
</ClickOutside>

<style lang="scss">
	.top-bar {
		overflow: hidden;
		position: relative;
		width: 100%;
		height: 44px;
		margin-bottom: 6px;
	}

	.after {
		display: flex;
		height: 100%;
		overflow: hidden;
		margin-top: 10px;
		flex-direction: column;
		position: absolute;
		z-index: 11;
		right: 0;
		animation: rightslide 0.2s ease-out;
		background: black;
		padding: 20px;
		border-left: 1px solid rgb(60, 60, 60);

		&.back {
			animation: leftslide 0.2s ease-out;
		}

		.menu-item {
			cursor: pointer;
			border-radius: 8px;
			padding-left: 40px;
			padding-right: 40px;
			padding-top: 18px;
			padding-bottom: 18px;
			background-size: 20px;
			background-repeat: no-repeat;
			background-position: 10px;
			box-sizing: border-box;

			&:hover {
				background-color: rgb(23, 23, 23);
			}

			&.logout {
				color: red;
				background-image: url("/img/logout.png");
			}

			&.console {
				background-image: url("/img/down.svg");
			}

			&.wipe {
				background-image: url("/img/loop.png");
			}

			&.settings {
				background-image: url("/img/settings.png");
			}
		}
	}

	.profile-button {
		overflow: hidden;
		position: absolute;
		right: 0;
		background: rgb(37, 37, 37);
		width: 42px;
		height: 42px;
		border-radius: 100%;
		border: 1px solid #424242;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		z-index: 11;
	}

	@keyframes rightslide {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@keyframes leftslide {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(100%);
		}
	}

	button {
		font-size: 14px;
		border: none;
		background: #1e1e1e;
		color: white;
		border-radius: 10px;
		border: 1px solid rgb(40, 40, 40);
		padding: 8px;

		&:hover {
			background: #2e2e2e;
		}
	}
</style>
