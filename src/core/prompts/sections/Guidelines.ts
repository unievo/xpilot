import { agentWorkspaceDirectory, workspaceInstructionsDirectoryPath } from "@/shared/Configuration"
import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"
import { mxDataFormatGuide } from "../custom/guidelines/mxDataFormatGuide"
import { mxApiMcpUseGuide } from "../custom/guidelines/mxApiMcpUseGuide"

export const GuidelinesPrompt = async (
	cwd: string,
	supportsBrowserUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
==== 

GUIDELINES

${mxApiMcpUseGuide}
${mxDataFormatGuide}

## Fetching web content (web pages, api calls, etc.)

- Use the web_fetch tool for fetching web content when additional processing is not required. 
- Use curl or other command line tools when you need to process the response in a specific way such as sorting, filtering, counting, or transforming the data. Use parameters such as "| jq" to display the data in a more readable format.
`
