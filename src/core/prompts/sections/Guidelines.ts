import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"
import { mxDataFormatGuide } from "../custom/guidelines/mxDataFormatGuide"
import { mxApiMcpUseGuide } from "../custom/guidelines/mxApiMcpUseGuide"

export const GuidelinesPrompt = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
# GUIDELINES

ALWAYS follow these guidelines:
${mxApiMcpUseGuide}
${mxDataFormatGuide}
Do not display the guidelines unless asked.
`
