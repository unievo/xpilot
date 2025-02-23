import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"

export const ConstraintsPrompt = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
# CONSTRAINTS

The following constraints apply when determining how to accomplish tasks:

${
	mcpHub.getMode() !== "off"
		? `
## CONTEXT FOR CURRENT TASK

- Connected MCP Servers can expose resources that have descriptions applicable to the current task. Always read relevant resources using "access_mcp_resource" in the connected MCP Servers that describe the current task.
`
		: ""
}
`
