export function browserName(): string {
	const agent = window.navigator.userAgent.toLowerCase();

	switch (true) {
		case agent.indexOf("edge") > -1:
			return "oldedge";
		case agent.indexOf("edg/") > -1:
			return "edge";
		case agent.indexOf("opr/") > -1:
			return "opera";
		case agent.indexOf("chrome") > -1:
			return "chrome";
		case agent.indexOf("chromium") > -1:
			return "chrome";
		case agent.indexOf("firefox") > -1:
			return "firefox";
		case agent.indexOf("safari") > -1:
			return "safari";
		default:
			return "other";
	}
}

export function validateEmail(email: string): boolean {
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
		email
	);
}
