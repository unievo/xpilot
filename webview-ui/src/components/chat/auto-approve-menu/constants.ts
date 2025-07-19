import { agentName } from "@shared/Configuration"
import { ActionMetadata } from "./types"

export const ACTION_METADATA: ActionMetadata[] = [
	{
		id: "enableAutoApprove",
		label: "Enable actions",
		shortName: "Enabled",
		description: "Toggle the auto-approve feature on or off.",
		icon: "codicon-play-circle",
	},
	{
		id: "enableAll",
		label: "Toggle all",
		shortName: "All",
		description: "Toggle all actions on or off.",
		icon: "codicon-checklist",
	},
	{
		id: "readFiles",
		label: "Read project files",
		shortName: "Read",
		description: `Allows ${agentName} to read files within your workspace.`,
		icon: "codicon-search",
		subAction: {
			id: "readFilesExternally",
			label: "Read all files",
			shortName: "all",
			description: `Allows ${agentName} to read any file on your computer.`,
			icon: "codicon-folder-opened",
			parentActionId: "readFiles",
		},
	},
	{
		id: "editFiles",
		label: "Edit project files",
		shortName: "Edit",
		description: `Allows ${agentName} to modify files within your workspace.`,
		icon: "codicon-edit",
		subAction: {
			id: "editFilesExternally",
			label: "Edit all files",
			shortName: "all",
			description: `Allows ${agentName} to modify any file on your computer.`,
			icon: "codicon-files",
			parentActionId: "editFiles",
		},
	},
	{
		id: "executeSafeCommands",
		label: "Execute safe commands",
		shortName: "Cmds",
		description: `Allows ${agentName} to execute safe terminal commands. If the model determines a command can have impactful or potentially destructive effects, it will still require approval.`,
		icon: "codicon-terminal",
		subAction: {
			id: "executeAllCommands",
			label: "Execute all commands",
			shortName: "all",
			description: `Allows ${agentName} to execute all terminal commands. Use at your own risk.`,
			icon: "codicon-terminal-bash",
			parentActionId: "executeSafeCommands",
		},
	},
	{
		id: "useBrowser",
		label: "Use the browser",
		shortName: "Browse",
		description: `Allows ${agentName} to fetch web content, or launch and interact with any website in a browser.`,
		icon: "codicon-globe",
	},
	{
		id: "useMcp",
		label: "Use MCP servers",
		shortName: "MCP",
		description: `Allows ${agentName} to use configured MCP servers.`,
		icon: "codicon-server",
	},
]

export const NOTIFICATIONS_SETTING: ActionMetadata = {
	id: "enableNotifications",
	label: "Enable notifications",
	shortName: "Notify",
	description: `Receive system notifications when ${agentName} requires approval to proceed or when a task is completed.`,
	icon: "codicon-bell",
}
