import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import type { ClineToolSpec } from "../spec"

// ## get_mcp_tool_input_schema
// Description: Request to get the input schema for a specific tool provided by a connected MCP server.
// It is a built-in tool, call directly, not as an MCP tool. It returns the JSON schema that defines the expected input parameters for the tool.
// IMPORTANT: If an MCP tool does not have an input schema provided, always call this tool before using it to expose all tool functionality and available parameters.
// Parameters:
// - server_name: (required) The name of the MCP server providing the tool
// - tool_name: (required) The name of the tool to get the input schema for
// Usage:
// <get_mcp_tool_input_schema>
// <server_name>server name here</server_name>
// <tool_name>tool name here</tool_name>
// </get_mcp_tool_input_schema>

const id = ClineDefaultTool.MCP_INPUT_SCHEMA

const generic: ClineToolSpec = {
	id,
	variant: ModelFamily.GENERIC,
	name: "get_mcp_tool_input_schema",
	description: `Request to get the input schema for a specific tool provided by a connected MCP server. It returns the JSON schema that defines the expected input parameters for an MCP tool. IMPORTANT: If an MCP tool does not have an input schema provided, always use this built-in tool before calling the MCP tool, to expose the MCP tool's available parameters.`,
	contextRequirements: (context) => context.mcpHub !== undefined && context.mcpHub !== null,
	parameters: [
		{
			name: "server_name",
			required: true,
			instruction: "The name of the MCP server providing the tool",
			usage: "server name here",
		},
		{
			name: "tool_name",
			required: true,
			instruction: "The name of the tool to get the input schema for",
			usage: "tool name here",
		},
	],
}

export const get_mcp_tool_input_schema_variants = [generic]
