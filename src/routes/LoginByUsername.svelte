<script lang="ts">
	enum State {
		LogIn,
		SignIn,
	}

	let username: string = "";
	let password: string = "";

	let active: boolean;

	$: active = username.length != 0 && password.length != 0;

	let state = State.LogIn;
</script>

<div class="login">
	<div class="sub">
		{#if state == State.LogIn}
			<div class="title">Login by username</div>
			<input placeholder="username" bind:value={username} />
			<input
				type="password"
				placeholder="password"
				bind:value={password}
			/>
			<button class={active ? "active" : ""}>Login</button>
			<a
				href={undefined}
				on:click={() => {
					state = State.SignIn;
				}}>Don't have an account ? Click here</a
			>
		{/if}
		{#if state == State.SignIn}
			<div class="title">Create an account</div>
			<input placeholder="username" bind:value={username} />
			<input
				type="password"
				placeholder="password"
				bind:value={password}
			/>
			<button class={active ? "active" : ""}>Sign in</button>
			<a
				href={undefined}
				on:click={() => {
					state = State.LogIn;
				}}>Already have an account ? Click here</a
			>
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
