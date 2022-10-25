import Home from "./routes/Home.svelte";
import Login from "./routes/Login.svelte";
import LoginByEmail from "./routes/LoginByEmail.svelte";
import Login2FA from "./routes/Login2FA.svelte";
import UserWant2FAPromptSvelte from "./routes/UserWant2FAPrompt.svelte";
import CreateAccountFromOAuthSvelte from "./routes/CreateAccountFromOAuth.svelte";
import Settings from "./routes/Settings.svelte";
import Sessions from "./routes/Sessions.svelte";
import TFASettings from "./routes/TFASettings.svelte";
import Notifications from "./routes/Notifications.svelte";
import TFAQRCode from "./routes/TFAQRCode.svelte";
import Password from "./routes/Password.svelte";

import { wrap } from "svelte-spa-router/wrap";
import { isLogged, tryLoggingIn } from "./stores";
import type { WrappedComponent } from "svelte-spa-router";
import type { SvelteComponentDev } from "svelte/internal";
import NotFound from "./routes/NotFound.svelte";
import Chat from "./routes/Chat.svelte";
import ChatInside from "./components/Chat/ChatInside.svelte";
import ChooseLobby from "./routes/ChooseLobby.svelte";

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
	"/settings/sessions": requiresLogin(Sessions),
	"/settings/2fa": requiresLogin(TFASettings),
	"/settings/password": requiresLogin(Password),
	"/chat/:uuid?": requiresLogin(Chat),
	"/chat/group/:uuid": requiresLogin(ChatInside),
	"/chat/single/:uuid": requiresLogin(ChatInside),
	"/notifications": requiresLogin(Notifications),
	"/play": requiresLogin(ChooseLobby),
	"/login": requiresNoLogin(Login),
	"/login/email": requiresNoLogin(LoginByEmail),
	"/login/2fa": requiresNoLogin(Login2FA),
	"/setup2fa" : TFAQRCode,
	"/postsignup/2fa": UserWant2FAPromptSvelte,
	"/postsignup/with": CreateAccountFromOAuthSvelte,
	"*": NotFound,
};
