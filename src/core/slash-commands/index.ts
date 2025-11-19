import type { ApiProviderInfo } from "@core/api"
import { ClineRulesToggles } from "@shared/cline-rules"
import fs from "fs/promises"
import { telemetryService } from "@/services/telemetry"
import {
	condenseToolResponse,
	deepPlanningToolResponse,
	gitInstructionsToolResponse,
	gitWorkflowsToolResponse,
	newRuleToolResponse,
	newTaskToolResponse,
	subagentToolResponse,
} from "../prompts/commands"
import { StateManager } from "../storage/StateManager"

type FileBasedWorkflow = {
	fullPath: string
	fileName: string
	isRemote: false
}

type RemoteWorkflow = {
	fullPath: string
	fileName: string
	isRemote: true
	contents: string
}

type Workflow = FileBasedWorkflow | RemoteWorkflow

/**
 * Processes text for slash commands and transforms them with appropriate instructions
 * This is called after parseMentions() to process any slash commands in the user's message
 */
export async function parseSlashCommands(
	text: string,
	localWorkflowToggles: ClineRulesToggles,
	globalWorkflowToggles: ClineRulesToggles,
	ulid: string,
	focusChainSettings?: { enabled: boolean },
	providerInfo?: ApiProviderInfo,
): Promise<{ processedText: string; needsClinerulesFileCheck: boolean }> {
	const SUPPORTED_DEFAULT_COMMANDS = [
		"New Task",
		"Compact Task",
		"Deep Planning", "Subagent",
		"Generate Instructions",
		"Git Instructions",
		"Git Workflows",
	] //, "Report Bug"

	const commandReplacements: Record<string, string> = {
		"New Task": newTaskToolResponse(),
		"Compact Task": condenseToolResponse(focusChainSettings),
		"Generate Instructions": newRuleToolResponse(),
		"Git Instructions": gitInstructionsToolResponse(),
		"Git Workflows": gitWorkflowsToolResponse(),
		//"Report Bug": reportBugToolResponse(),
		"Deep Planning": deepPlanningToolResponse(focusChainSettings, providerInfo),
		"Subagent": subagentToolResponse(),
	}

	// Get all available workflow commands (without file extensions)
	const globalWorkflows = Object.entries(globalWorkflowToggles)
		.filter(([_, enabled]) => enabled)
		.map(([filePath, _]) => {
			const fileName = filePath.replace(/^.*[/\\]/, "")
			const commandName = fileName.replace(/\.[^/.]+$/, "")
			return {
				fullPath: filePath,
				fileName: fileName,
				commandName: commandName,
			}
		})

	const localWorkflows = Object.entries(localWorkflowToggles)
		.filter(([_, enabled]) => enabled)
		.map(([filePath, _]) => {
			const fileName = filePath.replace(/^.*[/\\]/, "")
			const commandName = fileName.replace(/\.[^/.]+$/, "")
			return {
				fullPath: filePath,
				fileName: fileName,
				commandName: commandName,
			}
		})

	// local workflows have precedence over global workflows
	const enabledWorkflows = [...localWorkflows, ...globalWorkflows]

	// Build a list of all available commands (default + workflow)
	const allCommands = [...SUPPORTED_DEFAULT_COMMANDS, ...enabledWorkflows.map((w) => w.commandName)]

	// Sort by length (longest first) to ensure we match the longest command first
	const sortedCommands = allCommands.sort((a, b) => b.length - a.length)

	// Updated patterns to capture everything after the slash until the closing tag
	const tagPatterns = [
		{ tag: "task", regex: /<task>\s*\/([^<]*?)\s*<\/task>/is },
		{ tag: "feedback", regex: /<feedback>\s*\/([^<]*?)\s*<\/feedback>/is },
		{ tag: "answer", regex: /<answer>\s*\/([^<]*?)\s*<\/answer>/is },
		{ tag: "user_message", regex: /<user_message>\s*\/([^<]*?)\s*<\/user_message>/is },
	]

	// if we find a valid match, we will return inside that block
	for (const { tag, regex } of tagPatterns) {
		const regexObj = new RegExp(regex.source, regex.flags)
		const match = regexObj.exec(text)

		if (match) {
			// match[1] is the complete command text after the slash
			const potentialCommand = match[1].trim()

			// Find the longest matching command that starts the potential command text
			let matchedCommand = null
			for (const cmd of sortedCommands) {
				if (potentialCommand.toLowerCase().startsWith(cmd.toLowerCase())) {
					// Ensure the match is complete (followed by space/end or nothing)
					const nextChar = potentialCommand[cmd.length]
					if (!nextChar || /\s/.test(nextChar)) {
						matchedCommand = cmd
						break
					}
				}
			}

			if (!matchedCommand) {
				continue // No valid command found in this tag
			}

			// we give preference to the default commands if the user has a file with the same name
			if (SUPPORTED_DEFAULT_COMMANDS.includes(matchedCommand)) {
				const fullMatchStartIndex = match.index

				// find position of slash command within the full match
				const fullMatch = match[0]
				const commandWithSlash = "/" + matchedCommand
				const commandIndex = fullMatch.indexOf(commandWithSlash)

				if (commandIndex === -1) {
					continue // Safety check
				}

				// calculate absolute indices in the original string
				const slashCommandStartIndex = fullMatchStartIndex + commandIndex
				const slashCommandEndIndex = slashCommandStartIndex + commandWithSlash.length

				// remove the slash command and add custom instructions at the top of this message
				const textWithoutSlashCommand = text.substring(0, slashCommandStartIndex) + text.substring(slashCommandEndIndex)
				const processedText = commandReplacements[matchedCommand] + textWithoutSlashCommand

				// Track telemetry for builtin slash command usage
				telemetryService.captureSlashCommandUsed(ulid, matchedCommand, "builtin")

				return { processedText: processedText, needsClinerulesFileCheck: matchedCommand === "newrule" }
			}

			const globalWorkflows: Workflow[] = Object.entries(globalWorkflowToggles)
				.filter(([_, enabled]) => enabled)
				.map(([filePath, _]) => ({
					fullPath: filePath,
					fileName: filePath.replace(/^.*[/\\]/, ""),
					isRemote: false,
				}))

			const localWorkflows: Workflow[] = Object.entries(localWorkflowToggles)
				.filter(([_, enabled]) => enabled)
				.map(([filePath, _]) => ({
					fullPath: filePath,
					fileName: filePath.replace(/^.*[/\\]/, ""),
					isRemote: false,
				}))

			// Get remote workflows from remote config
			const stateManager = StateManager.get()
			const remoteConfigSettings = stateManager.getRemoteConfigSettings()
			const remoteWorkflows = remoteConfigSettings.remoteGlobalWorkflows || []
			const remoteWorkflowToggles = stateManager.getGlobalStateKey("remoteWorkflowToggles") || {}

			const enabledRemoteWorkflows: Workflow[] = remoteWorkflows
				.filter((workflow) => {
					// If alwaysEnabled, always include; otherwise check toggle
					return workflow.alwaysEnabled || remoteWorkflowToggles[workflow.name] !== false
				})
				.map((workflow) => ({
					fullPath: "",
					fileName: workflow.name,
					isRemote: true,
					contents: workflow.contents,
				}))

			// local workflows have precedence over global workflows, which have precedence over remote workflows
			const enabledWorkflows: Workflow[] = [...localWorkflows, ...globalWorkflows, ...enabledRemoteWorkflows]

			// Then check if the command matches any enabled workflow command name
			const matchingWorkflow = enabledWorkflows.find((workflow) => workflow.fileName === matchedCommand)

			if (matchingWorkflow) {
				try {
					// Get workflow content - either from file or from remote config
					let workflowContent: string
					if (matchingWorkflow.isRemote) {
						workflowContent = matchingWorkflow.contents.trim()
					} else {
						workflowContent = (await fs.readFile(matchingWorkflow.fullPath, "utf8")).trim()
					}

					// find position of slash command within the full match
					const fullMatchStartIndex = match.index
					const fullMatch = match[0]
					const commandWithSlash = "/" + matchedCommand
					const commandIndex = fullMatch.indexOf(commandWithSlash)

					if (commandIndex === -1) {
						continue // Safety check
					}

					// calculate absolute indices in the original string
					const slashCommandStartIndex = fullMatchStartIndex + commandIndex
					const slashCommandEndIndex = slashCommandStartIndex + commandWithSlash.length

					// remove the slash command and add custom instructions at the top of this message
					const textWithoutSlashCommand =
						text.substring(0, slashCommandStartIndex) + text.substring(slashCommandEndIndex)
					const processedText =
						`<explicit_instructions type="${matchingWorkflow.fileName}">\n${workflowContent}\n</explicit_instructions>\n` +
						textWithoutSlashCommand

					// Track telemetry for workflow command usage
					telemetryService.captureSlashCommandUsed(ulid, matchedCommand, "workflow")

					return { processedText, needsClinerulesFileCheck: false }
				} catch (error) {
					console.error(`Error reading workflow file ${matchingWorkflow.fullPath}: ${error}`)
				}
			}
		}
	}

	// if no supported commands are found, return the original text
	return { processedText: text, needsClinerulesFileCheck: false }
}
