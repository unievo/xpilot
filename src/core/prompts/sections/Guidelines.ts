import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"
import { dataDisplayPrompt, mcpServersInfo } from "../../../shared/Configuration"

export const GuidelinesPrompt = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
# GUIDELINES

ALWAYS follow these guidelines:
${
	mcpHub.getMode() !== "off"
		? `
	${mcpServersInfo}
	${dataDisplayPrompt}
	`
		: ""
}
`
