import { agentName } from "@shared/Configuration"

export enum NEW_USER_TYPE {
	FREE = "free",
	POWER = "power",
	BYOK = "byok",
}

type UserTypeSelection = {
	title: string
	description: string
	type: NEW_USER_TYPE
}

export const STEP_CONFIG = {
	0: {
		title: `Welcome to ${agentName}`,
		description: "Get started by selecting an AI provider option:",
		buttons: [
			{ text: "Continue", action: "next", variant: "default" },
			// { text: "Login to Cline account", action: "signin", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.FREE]: {
		title: "Select a free model",
		buttons: [
			{ text: "Sign up with Cline", action: "signup", variant: "default" },
			{ text: "Back", action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.POWER]: {
		title: "Select your model",
		buttons: [
			{ text: "Sign up with Cline", action: "signup", variant: "default" },
			{ text: "Back", action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.BYOK]: {
		title: "Configure your provider",
		buttons: [
			{ text: "Continue", action: "done", variant: "default" },
			{ text: "Back", action: "back", variant: "secondary" },
		],
	},
	2: {
		title: "Almost there!",
		description: "Complete account creation in your browser. Then come back here to finish up.",
		buttons: [{ text: "Back", action: "back", variant: "secondary" }],
	},
} as const

export const getUserTypeSelections = (isVsCodePlatform: boolean): UserTypeSelection[] => [
	{
		title: "Free Models using the Cline API",
		description: "Get started at no cost using the Cline API provider",
		type: NEW_USER_TYPE.FREE,
	},
	{
		title: "Frontier Models using the Cline API",
		description: "Claude 4.5, Gemini 3, GPT-5, etc. using the Cline API provider",
		type: NEW_USER_TYPE.POWER,
	},
	{
		title: isVsCodePlatform ? "GitHub Copilot Models, or bring your own API key" : "Bring your own API key",
		description: isVsCodePlatform
			? `Use the GitHub Copilot extension models, or use your own API keys for the supported providers`
			: `Use your own API key and settings for the supported providers`,
		type: NEW_USER_TYPE.BYOK,
	},
]
