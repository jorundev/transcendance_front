<script lang="ts">
	import { validateEmail } from "../utils";
	import { replace } from "svelte-spa-router";
	import { stServerDown, stToast } from "../stores";

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
	
	$: if (state === State.SignUp) {
		checkEmail();
		if (password.length > 0) {
			checkPassword();
		}
		checkUsername();
	}

	let isEmailValid = true;
	let isPasswordValid = true;

	let errormsg = "";
	let passerr = "";
	let confirmerr = "";
	let usererr = "";

	$: active =
		email.length != 0 &&
		password.length != 0 &&
		(state == State.LogIn || confirm.length != 0) &&
		(state == State.LogIn || username.length != 0) &&
		(state === State.LogIn || (
		passerr.length === 0 &&
		confirmerr.length === 0 &&
		usererr.length === 0)) &&
		isEmailValid;

	async function login(firstConnection: boolean) {
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
				if (res.status == 202) {
					replace("/login/2fa");
				}
				if (res.status == 200) {
					if (firstConnection) {
						replace("/postsignup/2fa");
						return;
					} else {
						replace("/");
						return;
					}
				} else if (res.status == 401 || res.status == 400) {
					errormsg = "Invalid email or password";
					show_error = true;
					return;
				} else if (res.status >= 500 && res.status <= 599) {
					stToast.set("Something wrong happened with the server");
					stServerDown.set(true);
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
		})
			.then(async (res) => {
				if (res.status == 201) {
					await login(true);
				} else if (res.status == 400) {
					errormsg = "Email address is already taken";
					show_error = true;
				} else if (res.status >= 500 && res.status <= 599) {
					stToast.set("Something wrong happened with the server");
					stServerDown.set(true);
				}
			})
			.catch((err) => {
				console.log("Critical error: ", err);
			});
	}
	
	function checkUsername() {
		if (username.length > 16) {
			usererr = "Usernames are limited to 16 characters";
			return ;
		}
		
		const validCharacters: Array<string> = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789"];
		
		if ([...username].filter((c) => !validCharacters.includes(c)).length > 0) {
			usererr = "Usernames are limited to alphanumerical characters and underscores";
			return ;
		}
		
		usererr = "";
	}

	function checkEmail() {
		isEmailValid = validateEmail(email) || email.length == 0;
	}
	
	function checkPassword() {
		isPasswordValid = false;
		
		if (password.length === 0) {
			passerr = "Password cannot be empty";
			return ;
		}
		
		if (password.length < 8) {
			passerr = "Password should be at least 8 characters long";
			return ;
		}
		
		if (password.toLowerCase() === password || password.toUpperCase() === password) {
			passerr = "Password should contain uppercase AND lowercase letters";
			return ;
		}
		
		const numbers: Array<string> = [..."0123456789"];
		
		if ([...password].filter((c) => numbers.includes(c)).length === 0) {
			passerr = "Password should contain numbers";
			return ;
		}
		
		const specialChars: Array<string> = [...`"'/|!@#$%^&*()[]{}<>`];
		
		if ([...password].filter((c) => specialChars.includes(c)).length === 0){
			passerr = "Password should contain special characters -> " + `"'/|!@#$%^&*()[]{}<>`;
			return ;
		}
		
		isPasswordValid = true;
		passerr = "";
	}
</script>

<svelte:window
	on:keydown={async (ev) => {
		if (ev.key == "Enter") {
			if (state == State.LogIn) {
				await login(false);
			} else {
				await signup();
			}
		}
	}}
/>
<div class="login">
	<div class="sub">
		{#if state == State.LogIn}
			<div class="title">Login using email</div>
			<input
				class={isEmailValid ? "" : "invalid"}
				placeholder="Email"
				bind:value={email}
				on:input={checkEmail}
				on:blur={checkEmail}
			/>
			<input
				type="password"
				placeholder="Password"
				bind:value={password}
			/>
			<button
				class={active ? "active" : ""}
				on:click={async () => await login(false)}>Login</button
			>
			<a
				href={undefined}
				on:click={() => {
					state = State.SignUp;
				}}>Don't have an account ? Click here</a
			>
			{#if show_error}
				<div style="color: red;">{errormsg}</div>
			{/if}
		{/if}
		{#if state == State.SignUp}
			<div class="title">Create an account</div>
			<input placeholder="Username" bind:value={username} on:blur={checkUsername} on:input={checkUsername}/>
			{#if usererr.length > 0}
				<div style="color: red;">{usererr}</div>
			{/if}
			<input
				class={isEmailValid ? "" : "invalid"}
				placeholder="Email"
				bind:value={email}
				on:blur={checkEmail}
				on:input={checkEmail}
			/>
			<input
				type="password"
				placeholder="Password"
				bind:value={password}
				on:input={checkPassword}
				on:blur={checkPassword}
			/>
			{#if passerr.length > 0}
				<div style="color: red;">{passerr}</div>
			{/if}
			<input
				type="password"
				placeholder="Confirm password"
				bind:value={confirm}
				on:input={() => confirmerr = (password !== confirm) ? "Passwords do not match" : ""}
				on:blur={() => confirmerr = (password !== confirm) ? "Passwords do not match" : ""}
			/>
			{#if confirmerr.length > 0}
				<div style="color: red;">{confirmerr}</div>
			{/if}
			<button
				class:active
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
</style>
