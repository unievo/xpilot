import { McpHub } from "../../services/mcp/McpHub"
import { BrowserSettings } from "../../shared/BrowserSettings"
import { ActModePlanModePrompt } from "./sections/ActModePlanMode"
import { CapabilitiesPrompt } from "./sections/Capabilities"
import { EditingFilesPrompt } from "./sections/EditingFiles"
import { GuidelinesPrompt } from "./sections/Guidelines"
import { InitialisationPrompt } from "./sections/Initialisation"
import { McpServerUsePrompt } from "./sections/McpServerUse"
import { ObjectivesPrompt } from "./sections/Objectives"
import { RulesPrompt } from "./sections/Rules"
import { SystemInformationPrompt } from "./sections/SystemInformation"
import { ToolUsePrompt } from "./sections/ToolUse"

export const SYSTEM_PROMPT = async (
	cwd: string,
	supportsBrowserUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
	_isNextGenModel: boolean = false,
) => {
	return `
${InitialisationPrompt()}
${await SystemInformationPrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)}
${await ToolUsePrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)}
${await EditingFilesPrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)}
${await ActModePlanModePrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)}
${await CapabilitiesPrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)}
${await RulesPrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)}
${await ObjectivesPrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)}
${await McpServerUsePrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)}
${await GuidelinesPrompt(cwd, supportsBrowserUse, mcpHub, browserSettings)}
`
}
