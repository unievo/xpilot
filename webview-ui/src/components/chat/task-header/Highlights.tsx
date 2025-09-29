import { mentionRegexGlobal } from "@shared/context-mentions"
import { StringRequest } from "@shared/proto/cline/common"
import { FileServiceClient } from "@/services/grpc-client"
import { DEFAULT_SLASH_COMMANDS, getWorkflowCommands } from "@/utils/slash-commands"

// // Optimized highlighting functions
// const highlightSlashCommands = (text: string, withShadow = true) => {
// 	const match = text.match(/^\s*\/([a-zA-Z0-9_-]+)(\s*|$)/)
// 	if (!match || validateSlashCommand(match[1]) !== "full") {
// 		return text
// 	}

// 	const commandName = match[1]
// 	const commandEndIndex = match[0].length
// 	const beforeCommand = text.substring(0, text.indexOf("/"))
// 	const afterCommand = match[2] + text.substring(commandEndIndex)

// 	return [
// 		beforeCommand,
// 		<span className={withShadow ? "mention-context-highlight-with-shadow" : "mention-context-highlight"} key="slashCommand">
// 			/{commandName}
// 		</span>,
// 		afterCommand,
// 	]
// }

// export const highlightMentions = (text: string, withShadow = true) => {
// 	if (!mentionRegexGlobal.test(text)) {
// 		return text
// 	}

// 	const parts = text.split(mentionRegexGlobal)
// 	const result: (string | JSX.Element)[] = []

// 	for (let i = 0; i < parts.length; i++) {
// 		if (i % 2 === 0) {
// 			if (parts[i]) {
// 				result.push(parts[i])
// 			}
// 		} else {
// 			result.push(
// 				<span
// 					className={`${withShadow ? "mention-context-highlight-with-shadow" : "mention-context-highlight"} cursor-pointer`}
// 					key={`mention-${Math.floor(i / 2)}`}
// 					onClick={() => FileServiceClient.openMention(StringRequest.create({ value: parts[i] }))}>
// 					@{parts[i]}
// 				</span>,
// 			)
// 		}
// 	}

// 	return result.length === 1 ? result[0] : result
// }

// export const highlightText = (text?: string, withShadow = true) => {
// 	if (!text) {
// 		return text
// 	}

// 	const slashResult = highlightSlashCommands(text, withShadow)

// 	if (slashResult === text) {
// 		return highlightMentions(text, withShadow)
// 	}

// 	if (Array.isArray(slashResult) && slashResult.length === 3) {
// 		const [beforeCommand, commandElement, afterCommand] = slashResult as [string, JSX.Element, string]
// 		const mentionResult = highlightMentions(afterCommand, withShadow)

// 		return Array.isArray(mentionResult)
// 			? [beforeCommand, commandElement, ...mentionResult]
// 			: [beforeCommand, commandElement, mentionResult]
// 	}

// 	return slashResult
// }

/**
 * Highlights slash-command in this text if it exists
 */
const highlightSlashCommands = (
	text: string,
	withShadow = true,
	localWorkflowToggles: Record<string, boolean> = {},
	globalWorkflowToggles: Record<string, boolean> = {},
) => {
	if (!text.trim().startsWith("/")) {
		return text
	}

	// Get all available commands including workflows
	const workflowCommands = getWorkflowCommands(localWorkflowToggles, globalWorkflowToggles)
	const allCommands = [...DEFAULT_SLASH_COMMANDS, ...workflowCommands]

	// Sort by length (longest first) to ensure we match the longest command first
	const sortedCommands = allCommands.sort((a, b) => b.name.length - a.name.length)

	// Extract the text after the slash
	const textAfterSlash = text.substring(1)

	// Find the longest matching valid command that is complete
	let longestMatch = ""
	let longestMatchLength = 0

	for (const command of sortedCommands) {
		const commandName = command.name.toLowerCase()
		const textToMatch = textAfterSlash.toLowerCase()

		// Check if the command matches exactly at the start of the text
		if (textToMatch.startsWith(commandName)) {
			// Ensure the match is followed by a space or end of text (complete command)
			const nextChar = textAfterSlash[commandName.length]
			if (!nextChar || nextChar === " ") {
				if (commandName.length > longestMatchLength) {
					longestMatch = command.name
					longestMatchLength = commandName.length
				}
			}
		}
	}

	// If we found a complete valid command match, highlight only that command
	if (longestMatch) {
		const commandEndIndex = 1 + longestMatchLength // +1 for the slash
		const beforeCommand = text.substring(0, 0) // empty since command starts at beginning
		const afterCommand = text.substring(commandEndIndex)

		return [
			beforeCommand,
			<span
				className={withShadow ? "mention-context-highlight-with-shadow" : "mention-context-highlight"}
				key="slashCommand">
				/{longestMatch}
			</span>,
			afterCommand,
		]
	}

	// return text
}

/**
 * Highlights & formats all mentions inside this text
 */
export const highlightMentions = (text: string, withShadow = true) => {
	const parts = text.split(mentionRegexGlobal)

	return parts.map((part, index) => {
		if (index % 2 === 0) {
			// This is regular text
			return part
		} else {
			// This is a mention
			return (
				<span
					className={withShadow ? "mention-context-highlight-with-shadow" : "mention-context-highlight"}
					key={`mention-${Math.floor(index / 2)}`}
					onClick={() => FileServiceClient.openMention(StringRequest.create({ value: part }))}
					style={{ cursor: "pointer" }}>
					@{part}
				</span>
			)
		}
	})
}

/**
 * Handles parsing both mentions and slash-commands
 */
export const highlightText = (
	text?: string,
	withShadow = true,
	localWorkflowToggles: Record<string, boolean> = {},
	globalWorkflowToggles: Record<string, boolean> = {},
) => {
	if (!text) {
		return text
	}

	const resultWithSlashHighlighting = highlightSlashCommands(text, withShadow, localWorkflowToggles, globalWorkflowToggles)

	if (resultWithSlashHighlighting === text) {
		// no highlighting done
		return highlightMentions(resultWithSlashHighlighting, withShadow)
	}

	if (Array.isArray(resultWithSlashHighlighting) && resultWithSlashHighlighting.length === 3) {
		const [beforeCommand, commandElement, afterCommand] = resultWithSlashHighlighting as [string, JSX.Element, string]

		return [beforeCommand, commandElement, ...highlightMentions(afterCommand, withShadow)]
	}

	return [text]
}
