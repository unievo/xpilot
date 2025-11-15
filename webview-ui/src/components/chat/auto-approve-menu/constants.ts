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
		description: `Read files within your workspace.`,
		icon: "codicon-search",
		subAction: {
			id: "readFilesExternally",
			label: "Read all files",
			shortName: "all",
			description: `Read files outside your workspace.`,
			icon: "codicon-folder-opened",
			parentActionId: "readFiles",
		},
	},
	{
		id: "editFiles",
		label: "Edit project files",
		shortName: "Edit",
		description: `Modify files within your workspace.`,
		icon: "codicon-edit",
		subAction: {
			id: "editFilesExternally",
			label: "Edit all files",
			shortName: "all",
			description: `Modify files outside your workspace.`,
			icon: "codicon-files",
			parentActionId: "editFiles",
		},
	},
	{
		id: "executeSafeCommands",
		label: "Execute safe commands",
		shortName: "Exec",
		description: `Execute safe terminal commands. If the model determines a command can have impactful or potentially destructive effects, it will still require approval.`,
		icon: "codicon-terminal",
		subAction: {
			id: "executeAllCommands",
			label: "Execute all commands",
			shortName: "all",
			description: `Execute all terminal commands without approval. Use at your own risk!`,
			icon: "codicon-terminal-bash",
			parentActionId: "executeSafeCommands",
		},
	},
	{
		id: "useMcp",
		label: "Use MCP servers",
		shortName: "MCP",
		description: `Allows ${agentName} to use configured MCP servers.`,
		icon: "codicon-server",
	},
	{
		id: "useBrowser",
		label: "Fetch web content and use the browser",
		shortName: "Browse",
		description: `Use the fetch web content tool and launch and interact with any website in a browser.`,
		icon: "codicon-globe",
	},
]

export const NOTIFICATIONS_SETTING: ActionMetadata = {
	id: "enableNotifications",
	label: "Enable notifications",
	shortName: "Notify",
	description: `Receive system notifications when ${agentName} requires approval to proceed or when a task is completed.`,
	icon: "codicon-bell",
}
