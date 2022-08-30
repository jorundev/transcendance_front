import Home from "./routes/Home.svelte";
import Login from "./routes/Login.svelte";
import LoginByEmail from "./routes/LoginByEmail.svelte";
import NotFound from "./routes/NotFound.svelte";
import Login2FA from "./routes/Login2FA.svelte";
import UserWant2FAPromptSvelte from "./routes/UserWant2FAPrompt.svelte";
import CreateAccountFromOAuthSvelte from "./routes/CreateAccountFromOAuth.svelte";
import Settings from "./routes/Settings.svelte";

export default {
	"/": Home,
	"/settings": Settings,
	"/login": Login,
	"/login/username": LoginByEmail,
	"/login/2fa": Login2FA,
	"/postsignup/2fa": UserWant2FAPromptSvelte,
	"/postsignup/with": CreateAccountFromOAuthSvelte,
	"*": NotFound,
};
