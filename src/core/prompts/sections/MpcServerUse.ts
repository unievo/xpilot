import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"

export const McpServerUsePrompt = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
# MCP SERVER USE

The Model Context Protocol (MCP) enables communication with MCP servers that provide additional capabilities.

## Connected MCP Servers List

${
	mcpHub.getServers().length > 0
		? `${mcpHub
				.getServers()
				.filter((server) => server.status === "connected")
				.map((server) => {
					const tools = server.tools
						?.map((tool) => {
							const schemaStr = tool.inputSchema
								? `    Input Schema:
    ${JSON.stringify(tool.inputSchema, null, 2).split("\n").join("\n    ")}`
								: ""

							return `- ${tool.name}: ${tool.description}\n${schemaStr}`
						})
						.join("\n\n")

					const templates = server.resourceTemplates
						?.map((template) => `- ${template.uriTemplate} (${template.name}): ${template.description}`)
						.join("\n")

					const resources = server.resources
						?.map((resource) => `- ${resource.uri} (${resource.name}): ${resource.description}`)
						.join("\n")

					const config = JSON.parse(server.config)

					return (
						`### ${server.name} (\`${config.command}${config.args && Array.isArray(config.args) ? ` ${config.args.join(" ")}` : ""}\`)` +
						(tools ? `\n\n#### ATL (Additional tools list) accessible using the "use_mcp_tool" \n\n${tools}` : "") +
						(resources
							? `\n\n#### RL (Resources list) accessible using the "access_mcp_resource" \n\n${resources}`
							: "") +
						(templates
							? `\n\n#### RTL (Resource templates list) accessible using the "access_mcp_resource" \n\n${templates}`
							: "")
					)
				})
				.join("\n\n")}`
		: "(No MCP servers currently connected)"
}
`
