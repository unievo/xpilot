import { ActionMetadata } from "./types"

export const ACTION_METADATA: ActionMetadata[] = [
	{
		id: "readFiles",
		label: "Read workspace files",
		shortName: "Read",
		icon: "codicon-search",
		subAction: {
			id: "readFilesExternally",
			label: "Read all files",
			shortName: "Read all",
			icon: "codicon-folder-opened",
			parentActionId: "readFiles",
		},
	},
	{
		id: "editFiles",
		label: "Edit workspace files",
		shortName: "Edit",
		icon: "codicon-edit",
		subAction: {
			id: "editFilesExternally",
			label: "Edit all files",
			shortName: "Edit all",
			icon: "codicon-files",
			parentActionId: "editFiles",
		},
	},
	{
		id: "executeSafeCommands",
		label: "Execute safe commands",
		shortName: "Exec",
		icon: "codicon-terminal",
		subAction: {
			id: "executeAllCommands",
			label: "Execute all commands",
			shortName: "Exec all",
			icon: "codicon-terminal-bash",
			parentActionId: "executeSafeCommands",
		},
	},
	{
		id: "useBrowser",
		label: "Search, Fetch, Use the browser",
		shortName: "Browse",
		icon: "codicon-globe",
	},
	{
		id: "useMcp",
		label: "Use MCP servers",
		shortName: "MCP",
		icon: "codicon-server",
	},
]

export const NOTIFICATIONS_SETTING: ActionMetadata = {
	id: "enableNotifications",
	label: "Enable notifications",
	shortName: "Notify",
	icon: "codicon-bell",
}
