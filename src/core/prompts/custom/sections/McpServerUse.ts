import { mcpServerIncludeFullSchema_ToolsMaxCount, mcpServerIncludeToolInputSchema_MaxLength } from "@/shared/Configuration"
import { McpHub } from "../../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../../shared/BrowserSettings"
import { mcpResourcesUse } from "../mcp/mcpResourcesUse"

export const McpServerUsePrompt = async (
	_cwd: string,
	_supportsBrowserUse: boolean,
	mcpHub: McpHub,
	_browserSettings: BrowserSettings,
) => {
	const servers = mcpHub.getServers()
	const connectedServers = servers.filter((server) => server.status === "connected")

	const hasResources = connectedServers.some(
		(server) =>
			//(Array.isArray(server.resourceTemplates) && server.resourceTemplates.length > 0) ||
			Array.isArray(server.resources) && server.resources.length > 0,
	)

	const mainContent = `
====

MCP SERVERS

The Model Context Protocol (MCP) enables communication between the system and locally running MCP servers that provide additional tools and resources to extend your capabilities.

# Connected MCP Servers

When a server is connected, you can use the server's tools via the \`use_mcp_tool\` tool, and access the server's resources via the \`access_mcp_resource\` tool.

${
	mcpHub.getServers().length > 0
		? `${mcpHub
				.getServers()
				.filter((server) => server.status === "connected")
				.map((server) => {
					const includeToolsSchema = server.tools && server.tools.length <= mcpServerIncludeFullSchema_ToolsMaxCount
					const tools = server.tools
						?.map((tool) => {
							let schemaStr = ""
							if (tool.inputSchema) {
								const schemaJson = JSON.stringify(tool.inputSchema, null, 2)
								//  include the full schema if the server has below max tools, or if the current tool schema length is below max length
								if (includeToolsSchema || schemaJson.length < mcpServerIncludeToolInputSchema_MaxLength) {
									schemaStr = `  Input Schema:
	${schemaJson.split("\n").join("\n  ")}\n`
								} else {
									// skip the input schema as it can be read on demand using get_mcp_tool_input_schema
								}
							}
							return `- ${tool.name}: ${tool.description}\n${schemaStr}`
						})
						.join("")

					const templates = server.resourceTemplates
						?.map((template) => `- ${template.uriTemplate} (${template.name}): ${template.description}`)
						.join("\n")

					const resources = server.resources
						?.map((resource) => `- ${resource.uri} (${resource.name}): ${resource.description}`)
						.join("\n")

					const config = JSON.parse(server.config)

					return (
						`## ${server.name} ${config.command ? `(\`${config.command}${config.args && Array.isArray(config.args) ? ` ${config.args.join(" ")}` : ""}\`)` : "- remote server"}` +
						(tools
							? `\n\n### ATL - Available Tools List - Always use get_mcp_tool_input_schema before calling a tool that does not have a defined input schema, as it exposes all tool functionality and available parameters such as sorting, ordering, filtering, etc.\n\n${tools}`
							: "") +
						(templates ? `\n\n### RTL - Resource Templates List\n${templates}` : "") +
						(resources ? `\n\n### DRL - Direct Resources List\n${resources}` : "")
					)
				})
				.join("\n\n")}`
		: "(No MCP servers currently connected)"
}
`

	return hasResources ? mainContent + mcpResourcesUse : mainContent
}
