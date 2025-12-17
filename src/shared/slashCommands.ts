export interface SlashCommand {
	name: string
	description?: string
	section?: "task" | "instructions" | "workflows" //| "default"
	cliCompatible?: boolean
}

export const BASE_SLASH_COMMANDS: SlashCommand[] = [
	{
		name: "newtask",
		description: "Start task with current context",
		section: "task",
		cliCompatible: true,
	},
	{
		name: "compact",
		description: "Summarize current task context",
		section: "task",
		cliCompatible: true,
	},
	{
		name: "new-instructions",
		description: "Create task based instructions",
		section: "instructions",
		cliCompatible: true,
	},
	// {
	// 	name: "reportbug",
	// 	description: "Create a Github issue with Cline",
	// 	section: "default",
	// 	cliCompatible: true,
	// },
	{
		name: "deep-planning",
		description: "Create a comprehensive implementation plan before coding",
		section: "task",
		cliCompatible: true,
	},
	{
		name: "subagent",
		description: "Invoke a Cline CLI subagent for focused research tasks",
		section: "task",
		cliCompatible: true,
	},
	{
		name: "git-instructions",
		description: "Get instructions from git",
		section: "instructions",
		cliCompatible: false,
	},
	{
		name: "git-workflows",
		description: "Get workflows from git",
		section: "workflows",
		cliCompatible: false,
	},
]

// VS Code-only slash commands
export const VSCODE_ONLY_COMMANDS: SlashCommand[] = [
	{
		name: "explain-changes",
		description: "Explain code changes between git refs (PRs, commits, branches, etc.)",
		section: "task",
	},
]
