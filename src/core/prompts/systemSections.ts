import { McpHub } from "../../services/mcp/McpHub"
import { BrowserSettings } from "../../shared/BrowserSettings"
import { InitialisationPrompt } from "./sections/Initialisation"
import { ToolUsePrompt } from "./sections/ToolUse"
import { McpServerUsePrompt } from "./sections/MpcServerUse"
import { McpServerCreatePrompt } from "./sections/McpServerCreate"
import { EditingFilesPrompt } from "./sections/EditingFiles"
import { ActModePlanModePrompt } from "./sections/ActModePlanMode"
import { CapabilitiesPrompt } from "./sections/Capabilities"
import { RulesPrompt } from "./sections/Rules"
import { SystemInformationPrompt } from "./sections/SystemInformation"
import { ObjectivesPrompt } from "./sections/Objectives"
import { GuidelinesPrompt } from "./sections/Guidelines"

export const SYSTEM_PROMPT = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `${InitialisationPrompt()}
${await SystemInformationPrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}
${await ToolUsePrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}
${await EditingFilesPrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}
${await ActModePlanModePrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}
${await CapabilitiesPrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}
${await RulesPrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}
${await ObjectivesPrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}
${mcpHub.getMode() !== "off" ? `${await McpServerUsePrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}` : ""}
${mcpHub.getMode() === "full" ? `${await McpServerCreatePrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}` : ""}
${await GuidelinesPrompt(cwd, supportsComputerUse, mcpHub, browserSettings)}
`
