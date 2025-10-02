import { McpHub } from "@services/mcp/McpHub"
import { BrowserSettings } from "@/shared/BrowserSettings"
import { mxApiMcpUseGuide } from "../guidelines/mxApiMcpUseGuide"
import { mxDataFormatGuide } from "../guidelines/mxDataFormatGuide"

export const GuidelinesPrompt = async (
	_cwd: string,
	_supportsBrowserUse: boolean,
	_mcpHub: McpHub,
	_browserSettings: BrowserSettings,
) => `
==== 

GUIDELINES

${mxApiMcpUseGuide}
${mxDataFormatGuide}

## Fetching web content (web pages, api calls, etc.)

- Use the web_fetch tool for fetching web content when additional processing is not required. 
- Use curl or other command line tools when you need to process the response in a specific way such as sorting, filtering, counting, or transforming the data. Use parameters such as "| jq" to display the data in a more readable format.
`
