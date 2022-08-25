<script lang="ts">
	import { stLoggedUser } from "../stores";
	import { replace } from "svelte-spa-router";

	enum State {
		LogIn,
		SignUp,
	}

	interface LoginRequest {
		email: string;
		password: string;
	}

	interface SignupRequest {
		username: string;
		password: string;
		email: string;
		confirm: string;
	}

	let show_error: boolean = false;

	let username: string = "";
	let email: string = "";
	let password: string = "";
	let confirm: string = "";

	let active: boolean;

	let state = State.LogIn;

	let errormsg = "";

	$: active =
		email.length != 0 &&
		password.length != 0 &&
		(state == State.LogIn || confirm.length != 0) &&
		(state == State.LogIn || username.length != 0);

	async function login() {
		if (!active) {
			return;
		}

		stLoggedUser.set(null);

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
					replace("/");
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

		const req: SignupRequest = {
			username,
			password,
			confirm,
			email,
		};

		await fetch("/api/auth/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req),
		}).then(async (res) => {
			if (res.status == 201) {
				await login();
			}
		});
	}
</script>

<div class="login">
	<div class="sub">
		{#if state == State.LogIn}
			<div class="title">Login by username</div>
			<input placeholder="Email" bind:value={email} />
			<input
				type="password"
				placeholder="Password"
				bind:value={password}
			/>
			<button
				class={active ? "active" : ""}
				on:click={async () => await login()}>Login</button
			>
			<a
				href={undefined}
				on:click={() => {
					state = State.SignUp;
				}}>Don't have an account ? Click here</a
			>
			{#if show_error}
				<div style="color: red;">Invalid username or password</div>
			{/if}
		{/if}
		{#if state == State.SignUp}
			<div class="title">Create an account</div>
			<input placeholder="Username" bind:value={username} />
			<input placeholder="Email" bind:value={email} />
			<br />
			<input
				type="password"
				placeholder="Password"
				bind:value={password}
			/>
			<input
				type="password"
				placeholder="Confirm password"
				bind:value={confirm}
			/>
			<button
				class={active ? "active" : ""}
				on:click={async () => await signup()}>Sign up</button
			>
			<a
				href={undefined}
				on:click={() => {
					state = State.LogIn;
					show_error = false;
				}}>Already have an account ? Click here</a
			>
			{#if show_error}
				<div style="color: red;">{errormsg}</div>
			{/if}
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

	a {
		text-decoration: none;
		color: rgb(20, 129, 255);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
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
</style>
