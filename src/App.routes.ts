import Home from './routes/Home.svelte';
import Login from './routes/Login.svelte';
import LoginByUsername from './routes/LoginByUsername.svelte';
import NotFound from './routes/NotFound.svelte';

export default {
	'/': Home,
	'/login': Login,
	'/login/username': LoginByUsername,
	// The catch-all route must always be last
	'*': NotFound
};
