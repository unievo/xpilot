import { McpHub } from "../../services/mcp/McpHub"
import { BrowserSettings } from "../../shared/BrowserSettings"
import { InitialisationPrompt } from "./sections/Initialisation"
import { ToolUsePrompt } from "./sections/ToolUse"
import { McpServerUsePrompt } from "./sections/McpServerUse"
import { EditingFilesPrompt } from "./sections/EditingFiles"
import { ActModePlanModePrompt } from "./sections/ActModePlanMode"
import { CapabilitiesPrompt } from "./sections/Capabilities"
import { RulesPrompt } from "./sections/Rules"
import { SystemInformationPrompt } from "./sections/SystemInformation"
import { ObjectivesPrompt } from "./sections/Objectives"
import { GuidelinesPrompt } from "./sections/Guidelines"

export const SYSTEM_PROMPT = async (
	cwd: string,
	supportsBrowserUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
	isClaude4ModelFamily: boolean = false,
) => `${InitialisationPrompt()}
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
