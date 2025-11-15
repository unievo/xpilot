export interface SlashCommand {
	name: string
	description?: string
	section?: "task" | "instructions" | "workflows" //| "default"
}

export const DEFAULT_SLASH_COMMANDS: SlashCommand[] = [
	{
		name: "New Task",
		description: "Start task with current context",
		section: "task",
	},
	{
		name: "Compact Task",
		description: "Summarize current task context",
		section: "task",
	},
	{
		name: "Deep Planning",
		description: "Create a comprehensive implementation plan before coding",
		section: "task",
	},
	{
		name: "Generate Instructions",
		description: "Create task based instructions",
		section: "instructions",
	},
	{
		name: "Git Instructions",
		description: "Get instructions from git",
		section: "instructions",
	},
	{
		name: "Git Workflows",
		description: "Get workflows from git",
		section: "workflows",
	},

	// {
	// 	name: "reportbug",
	// 	description: "Create a Github issue",
	// 	section: "default",
	// },
]

export function getWorkflowCommands(
	localWorkflowToggles: Record<string, boolean>,
	globalWorkflowToggles: Record<string, boolean>,
): SlashCommand[] {
	const { workflows: localWorkflows, nameSet: localWorkflowNames } = Object.entries(localWorkflowToggles)
		.filter(([_, enabled]) => enabled)
		.reduce(
			(acc, [filePath, _]) => {
				const fileName = filePath.replace(/^.*[/\\]/, "")
				const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "")
				const dirPath = filePath.replace(fileName, "").replace(/[/\\]$/, "")
				const fileDirName = dirPath.split(/[/\\]/).pop() || ""

				// Add to array of workflows
				acc.workflows.push({
					name: fileNameWithoutExtension,
					section: "workflows",
					description: "Local: /" + fileDirName,
				} as SlashCommand)

				// Add to set of names
				acc.nameSet.add(fileNameWithoutExtension)

				return acc
			},
			{ workflows: [] as SlashCommand[], nameSet: new Set<string>() },
		)

	const globalWorkflows = Object.entries(globalWorkflowToggles)
		.filter(([_, enabled]) => enabled)
		.flatMap(([filePath, _]) => {
			const fileName = filePath.replace(/^.*[/\\]/, "")
			const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "")
			const dirPath = filePath.replace(fileName, "").replace(/[/\\]$/, "")
			const fileDirName = dirPath.split(/[/\\]/).pop() || ""

			// skip if a local workflow with the same name exists
			if (localWorkflowNames.has(fileNameWithoutExtension)) {
				return []
			}

			return [
				{
					name: fileNameWithoutExtension,
					section: "workflows",
					description: "Global: /" + fileDirName,
				},
			] as SlashCommand[]
		})

	const workflows = [...localWorkflows, ...globalWorkflows]
	return workflows
}

// Regex for detecting slash commands in text
// Updated to allow whitespace inside command names
export const slashCommandRegex = /\/([a-zA-Z0-9_.\s-]+?)(?=\s|$)/
export const slashCommandRegexGlobal = new RegExp(slashCommandRegex.source, "g")
export const slashCommandDeleteRegex = /^\s*\/([a-zA-Z0-9_.\s-]+?)$/

/**
 * Removes a slash command at the cursor position
 */
export function removeSlashCommand(text: string, position: number): { newText: string; newPosition: number } {
	const beforeCursor = text.slice(0, position)
	const afterCursor = text.slice(position)

	// Check if we're at the end of a slash command
	const matchEnd = beforeCursor.match(slashCommandDeleteRegex)

	if (matchEnd) {
		// If we're at the end of a slash command, remove it
		const newText = text.slice(0, position - matchEnd[0].length) + afterCursor.replace(/^\s/, "") // removes the first space after the command
		const newPosition = position - matchEnd[0].length
		return { newText, newPosition }
	}

	// If we're not at the end of a slash command, just return the original text and position
	return { newText: text, newPosition: position }
}

/**
 * Determines whether the slash command menu should be displayed based on text input
 */
export function shouldShowSlashCommandsMenu(
	text: string,
	cursorPosition: number,
	localWorkflowToggles: Record<string, boolean> = {},
	globalWorkflowToggles: Record<string, boolean> = {},
): boolean {
	const beforeCursor = text.slice(0, cursorPosition)

	// first check if there is a slash before the cursor
	const slashIndex = beforeCursor.lastIndexOf("/")

	if (slashIndex === -1) {
		return false
	}

	// check if slash is at the very beginning (with optional whitespace)
	const textBeforeSlash = beforeCursor.slice(0, slashIndex)
	if (!/^\s*$/.test(textBeforeSlash)) {
		return false
	}

	// potential partial or full command
	const textAfterSlash = beforeCursor.slice(slashIndex + 1)

	// get all available commands including workflow commands
	const workflowCommands = getWorkflowCommands(localWorkflowToggles, globalWorkflowToggles)
	const allCommands = [...DEFAULT_SLASH_COMMANDS, ...workflowCommands]

	// check if we have a complete valid command followed by a space
	const hasCompleteCommand = allCommands.some((cmd) => {
		const commandName = cmd.name.toLowerCase()
		const textToCheck = textAfterSlash.toLowerCase()

		// Check if the text starts with this command and is followed by a space
		if (textToCheck.startsWith(commandName)) {
			const nextChar = textAfterSlash[commandName.length]
			// If there's a space after the command, this is a complete command
			// We should not show the menu regardless of what comes after the space
			const isComplete = nextChar === " "

			return isComplete
		}
		return false
	})

	// if we have a complete command followed by a space, don't show menu
	if (hasCompleteCommand) {
		return false
	}

	return true
}

/**
 * Gets filtered slash commands that match the current input
 */
export function getMatchingSlashCommands(
	query: string,
	localWorkflowToggles: Record<string, boolean> = {},
	globalWorkflowToggles: Record<string, boolean> = {},
): SlashCommand[] {
	const workflowCommands = getWorkflowCommands(localWorkflowToggles, globalWorkflowToggles)
	const allCommands = [...DEFAULT_SLASH_COMMANDS, ...workflowCommands]

	if (!query) {
		return allCommands
	}

	// normalize query by trimming and lowercasing for matching
	const normalizedQuery = query.trim().toLowerCase()

	// filter commands that start with the query or contain all words from the query
	return allCommands.filter((cmd) => {
		const normalizedCommandName = cmd.name.toLowerCase()

		// exact prefix match (case insensitive)
		if (normalizedCommandName.startsWith(normalizedQuery)) {
			return true
		}

		// check if all words in the query are present in the command name
		const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 0)
		if (queryWords.length > 1) {
			return queryWords.every((word) => normalizedCommandName.includes(word))
		}

		return false
	})
}

/**
 * Insert a slash command at position or replace partial command
 */
export function insertSlashCommand(
	text: string,
	commandName: string,
	partialCommandLength: number,
): { newValue: string; commandIndex: number } {
	const slashIndex = text.indexOf("/")

	// where the command ends, look for first space or end of text
	let commandEndIndex = text.indexOf(" ", slashIndex)
	if (commandEndIndex === -1) {
		// if no space found, command goes to end of text
		commandEndIndex = text.length
	}

	// replace the partial command with the full command
	const newValue =
		text.substring(0, slashIndex + 1) + commandName + (commandEndIndex < text.length ? text.substring(commandEndIndex) : " ") // add single space at the end if only slash command

	return { newValue, commandIndex: slashIndex }
}

/**
 * Determines the validation state of a slash command
 * Returns partial if we have a partial match against valid commands, or full for full match
 */
export function validateSlashCommand(
	command: string,
	localWorkflowToggles: Record<string, boolean> = {},
	globalWorkflowToggles: Record<string, boolean> = {},
): "full" | "partial" | null {
	if (!command) {
		return null
	}

	const workflowCommands = getWorkflowCommands(localWorkflowToggles, globalWorkflowToggles)
	const allCommands = [...DEFAULT_SLASH_COMMANDS, ...workflowCommands]

	// normalize command for matching
	const normalizedCommand = command.trim().toLowerCase()

	// case insensitive exact matching
	const exactMatch = allCommands.some((cmd) => cmd.name.toLowerCase() === normalizedCommand)

	if (exactMatch) {
		return "full"
	}

	// check for partial matches - either prefix match or all words present
	const partialMatch = allCommands.some((cmd) => {
		const normalizedCmdName = cmd.name.toLowerCase()

		// prefix match
		if (normalizedCmdName.startsWith(normalizedCommand)) {
			return true
		}

		// check if all words in the command are present in a valid command
		const commandWords = normalizedCommand.split(/\s+/).filter((word) => word.length > 0)
		if (commandWords.length > 1) {
			return commandWords.every((word) => normalizedCmdName.includes(word))
		}

		return false
	})

	if (partialMatch) {
		return "partial"
	}

	return null // no match
}
