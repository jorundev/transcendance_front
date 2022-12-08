import * as EmailValidator from "email-validator";

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
	return EmailValidator.validate(email);
}

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; ++i) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
}

function numberToColor(i: number): string {
	const abs = Math.abs(i);
	const components = [abs & 0xff, (abs >> 8) & 0xff, (abs >> 16) & 0xff];
	for (let i = 0; i < 3; ++i) {
		components[i] /= 3;
	}
	return (
		"rgb(" +
		components[0] +
		", " +
		components[1] +
		", " +
		components[2] +
		")"
	);
}

export function colorFromString(str: string): string {
	return numberToColor(hashString(str));
}

export function padIdentifier(id: number): string {
	if (id === undefined) {
		return "????";
	}
	let pad = "0000";
	pad += id;
	return pad.substring(pad.length - 4);
}
