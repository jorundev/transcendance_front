import Home from "./routes/Home.svelte";
import Login from "./routes/Login.svelte";
import LoginByEmail from "./routes/LoginByEmail.svelte";
import Login2FA from "./routes/Login2FA.svelte";
import UserWant2FAPromptSvelte from "./routes/UserWant2FAPrompt.svelte";
import CreateAccountFromOAuthSvelte from "./routes/CreateAccountFromOAuth.svelte";
import Settings from "./routes/Settings.svelte";

import { wrap } from "svelte-spa-router/wrap";
import { isLogged, tryLoggingIn } from "./stores";
import type { WrappedComponent } from "svelte-spa-router";
import type { SvelteComponentDev } from "svelte/internal";

/*export default {
	"/": Home,
	"/settings": Settings,
	"/login": Login,
	"/login/username": LoginByEmail,
	"/login/2fa": Login2FA,
	"/postsignup/2fa": UserWant2FAPromptSvelte,
	"/postsignup/with": CreateAccountFromOAuthSvelte,
	"*": NotFound,
};*/

function requiresLogin(component: typeof SvelteComponentDev): WrappedComponent {
	return wrap({
		component,
		userData: {
			redirect: "/login",
		},
		conditions: [
			async () => {
				return await tryLoggingIn();
			},
		],
	});
}
function requiresNoLogin(
	component: typeof SvelteComponentDev
): WrappedComponent {
	return wrap({
		component,
		userData: {
			redirect: "/",
		},
		conditions: [
			async () => {
				return !(await isLogged());
			},
		],
	});
}

export default {
	"/": requiresLogin(Home),
	"/settings": requiresLogin(Settings),
	"/login": requiresNoLogin(Login),
	"/login/username": requiresNoLogin(LoginByEmail),
	"/login/2fa": requiresNoLogin(Login2FA),
	"/postsignup/2fa": UserWant2FAPromptSvelte,
	"/postsignup/with": CreateAccountFromOAuthSvelte,
};
