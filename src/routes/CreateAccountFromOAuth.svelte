<script lang="ts">
	import { validateEmail } from "../utils";
	import { querystring, replace } from "svelte-spa-router";

	interface LoginRequest {
		email: string;
		password: string;
	}

	interface SignupRequest {
		username: string;
		password: string;
		email: string;
		confirm: string;
		avatar?: string;
	}

	let show_error: boolean = false;

	let username: string = "";
	let email: string = "";
	let password: string = "";
	let confirm: string = "";
	let profile_picture_link: string | null = null;

	let isEmailValid = true;
	let active: boolean;

	querystring.subscribe((query) => {
		const params = new URLSearchParams(query);
		window.history.replaceState({}, null, "/#/postsignup/with");

		if (!params.has("email")) {
			return;
		}

		email = params.get("email");
		username = params.has("username") ? params.get("username") : "";
		profile_picture_link = params.has("avatar")
			? params.get("avatar")
			: null;
	});

	function getProfilePictureLink(): string {
		if (profile_picture_link) {
			return profile_picture_link;
		}
		return "/img/default.jpg";
	}

	let errormsg = "";

	$: active =
		email.length != 0 &&
		password.length != 0 &&
		confirm.length != 0 &&
		username.length != 0 &&
		isEmailValid;

	async function login() {
		if (!active) {
			return;
		}

		const req: LoginRequest = {
			email,
			password,
		};

		await fetch("/api/auth/signin", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req),
		})
			.then((res) => {
				if (res.status == 200) {
					replace("/postsignup/2fa");
				} else if (res.status == 401) {
					show_error = true;
				}
			})
			.catch((e) => {
				console.error(e);
			});
	}

	async function signup() {
		if (!active) {
			return;
		}

		if (password != confirm) {
			errormsg = "Passwords do not match";
			show_error = true;
			return;
		}

		let req: SignupRequest = {
			username,
			password,
			confirm,
			email,
		};

		if (profile_picture_link) {
			req.avatar = profile_picture_link;
		}

		await fetch("/api/auth/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req),
		})
			.then(async (res) => {
				if (res.status == 201) {
					await login();
				}
			})
			.catch((e) => {
				console.log("Critical error: ", e);
			});
	}

	function checkEmail() {
		isEmailValid = validateEmail(email) || email.length == 0;
	}
</script>

<svelte:window
	on:keydown={async (ev) => {
		if (ev.key == "Enter") {
			await signup();
		}
	}}
/>

<div class="login">
	<div class="sub">
		<div class="title">Create an account</div>
		<div
			class="profile-picture"
			style={"background-image: url('" + getProfilePictureLink() + "');"}
		/>
		<input placeholder="Username" bind:value={username} />
		<input
			class={isEmailValid ? "" : "invalid"}
			placeholder="Email"
			bind:value={email}
			disabled
			on:input={checkEmail}
			on:blur={checkEmail}
		/>
		<input type="password" placeholder="Password" bind:value={password} />
		<input
			type="password"
			placeholder="Confirm password"
			bind:value={confirm}
		/>
		<button
			class={active ? "active" : ""}
			on:click={async () => await signup()}>Sign up</button
		>
		{#if show_error}
			<div style="color: red;">{errormsg}</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.login {
		height: 100%;
		display: grid;
		align-items: center;
		justify-content: center;

		.sub {
			text-align: center;
			width: 300px;
			display: flex;
			flex-direction: column;
			gap: 10px;
		}
	}

	input {
		margin: 0;
		transition: background-color 140ms, width 140ms;
		font-size: 16px;
		flex-grow: 1;
		height: 10px;
		background: #232324;
		color: #f0f0f2;
		border: none;
		padding: 15px;
		border-radius: 12px;

		&:focus {
			outline: none;
			background: #38383a;
		}

		&:disabled {
			color: rgb(139, 139, 139);
			background: #3f3f3f;
		}

		&.invalid {
			color: red;
		}
	}

	button {
		font-size: 16px;
		width: 100%;
		color: #868686;
		background: #4b4b4b;
		border: none;
		border-radius: 12px;
		padding: 12px;
		margin-left: auto;
		margin-right: auto;

		transition: background-color 0.1s, color 0.1s;

		&.active {
			cursor: pointer;
			color: white;
			background: #0b82fa;

			&:hover {
				background: #0a73dd;
			}

			&:active {
				background: #0969c9;
			}
		}
	}

	.title {
		font-size: 20px;
		margin-bottom: 10px;
	}

	.profile-picture {
		width: 100px;
		height: 100px;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 10px;
		border-radius: 100%;
		background-size: cover;
	}
</style>
