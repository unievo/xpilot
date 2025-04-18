import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"
import { dataDisplayPrompt, mcpServersInfo } from "../customPrompts"

export const GuidelinesPrompt = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
# GUIDELINES

ALWAYS follow these guidelines:
${mcpServersInfo}
${dataDisplayPrompt}
`
