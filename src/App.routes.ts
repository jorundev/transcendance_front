import Home from "./routes/Home.svelte";
import Login from "./routes/Login.svelte";
import LoginByEmail from "./routes/LoginByEmail.svelte";
import Login2FA from "./routes/Login2FA.svelte";
import UserWant2FAPromptSvelte from "./routes/UserWant2FAPrompt.svelte";
import CreateAccountFromOAuthSvelte from "./routes/CreateAccountFromOAuth.svelte";
import Settings from "./routes/Settings.svelte";
import Sessions from "./routes/Sessions.svelte";
import TFASettings from "./routes/TFASettings.svelte";
import TFAQRCode from "./routes/TFAQRCode.svelte";
import Password from "./routes/Password.svelte";
import Casual from "./routes/Casual.svelte";
import Queue from "./routes/Queue.svelte";
import ProfileSettings from "./routes/ProfileSettings.svelte";
import BlockedAccounts from "./routes/BlockedAccounts.svelte";
import Game from "./routes/Game.svelte";

import { wrap } from "svelte-spa-router/wrap";
import { isLogged, stLobby, tryLoggingIn } from "./stores";
import { location, type WrappedComponent } from "svelte-spa-router";
import type { SvelteComponentDev } from "svelte/internal";
import NotFound from "./routes/NotFound.svelte";
import Chat from "./routes/Chat.svelte";
import ChatInside from "./components/Chat/ChatInside.svelte";
import ChooseLobby from "./routes/ChooseLobby.svelte";
import Profile from "./routes/Profile.svelte";
import { get } from "svelte/store";
import { api } from "./api";

location.subscribe(async (loc) => {
	if (
		get(stLobby) &&
		!loc.startsWith("/play/lobby") &&
		!loc.startsWith("/game")
	) {
		console.log("Leaving lobby");
		await api.leaveLobby(get(stLobby).uuid);
		stLobby.set(null);
	}
});

function requiresLogin(
	component: typeof SvelteComponentDev,
	props?: any
): WrappedComponent {
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
		props,
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
				return !isLogged();
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
	"/settings/profile": requiresLogin(ProfileSettings),
	"/settings/blocked-accounts": requiresLogin(BlockedAccounts),
	"/chat/:uuid?": requiresLogin(Chat),
	"/chat/inner/:uuid": requiresLogin(ChatInside),
	"/profile/:uuid": requiresLogin(Profile),
	"/profile/:user/:id": requiresLogin(Profile),
	"/play": requiresLogin(ChooseLobby),
	"/game": requiresLogin(Game),
	"/play/lobby": requiresLogin(Casual),
	"/play/queue": requiresLogin(Queue),
	"/login": requiresNoLogin(Login),
	"/login/oauth-error": requiresNoLogin(Login),
	"/login/email": requiresNoLogin(LoginByEmail),
	"/login/2fa": requiresNoLogin(Login2FA),
	"/setup2fa": TFAQRCode,
	"/postsignup/2fa": UserWant2FAPromptSvelte,
	"/postsignup/with": CreateAccountFromOAuthSvelte,
	"*": NotFound,
};
