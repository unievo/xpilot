import { mcpServerIncludeFullSchema_ToolsMaxCount, mcpServerIncludeToolInputSchema_MaxLength } from "@/shared/Configuration"
import type { McpServer } from "@/shared/mcp"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const MCP_TEMPLATE_TEXT = `MCP SERVERS

The Model Context Protocol (MCP) enables communication between the system and locally running MCP servers that provide additional tools and resources to extend your capabilities.

# Connected MCP Servers

When a server is connected, you can use the server's tools via the \`use_mcp_tool\` tool, and access the server's resources via the \`access_mcp_resource\` tool.

{{MCP_SERVERS_LIST}}`

export async function getMcp(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	const servers = context.mcpHub?.getServers() || []
	// Skip the section if there are no servers connected / available
	if (servers.length === 0) {
		return undefined
	}
	return await getMcpServers(servers, variant)
}

async function getMcpServers(servers: McpServer[], variant: PromptVariant): Promise<string> {
	const template = variant.componentOverrides?.[SystemPromptSection.MCP]?.template || MCP_TEMPLATE_TEXT
	const serversList = servers.length > 0 ? formatMcpServersList(servers) : "(No MCP servers currently connected)"
	return new TemplateEngine().resolve(template, {
		MCP_SERVERS_LIST: serversList,
	})
}

// function formatMcpServersList(servers: McpServer[]): string {
// 	return servers
// 		.filter((server) => server.status === "connected")
// 		.map((server) => {
// 			const tools = server.tools
// 				?.map((tool) => {
// 					const schemaStr = tool.inputSchema
// 						? `    Input Schema:
//     ${JSON.stringify(tool.inputSchema, null, 2).split("\n").join("\n    ")}`
// 						: ""

// 					return `- ${tool.name}: ${tool.description}\n${schemaStr}`
// 				})
// 				.join("\n\n")

// 			const templates = server.resourceTemplates
// 				?.map((template) => `- ${template.uriTemplate} (${template.name}): ${template.description}`)
// 				.join("\n")

// 			const resources = server.resources
// 				?.map((resource) => `- ${resource.uri} (${resource.name}): ${resource.description}`)
// 				.join("\n")

// 			const config = JSON.parse(server.config)

// 			return (
// 				`## ${server.name}` +
// 				(config.command
// 					? ` (\`${config.command}${config.args && Array.isArray(config.args) ? ` ${config.args.join(" ")}` : ""}\`)`
// 					: "") +
// 				(tools ? `\n\n### Available Tools\n${tools}` : "") +
// 				(templates ? `\n\n### Resource Templates\n${templates}` : "") +
// 				(resources ? `\n\n### Direct Resources\n${resources}` : "")
// 			)
// 		})
// 		.join("\n\n")
// }

function formatMcpServersList(servers: McpServer[]): string {
	return servers
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
					? `\n\n### ATL - Available Tools List - Always use the built-in tool "get_mcp_tool_input_schema" before calling an MCP tool that does not have a defined input schema, to get the available parameters of the MCP tool (such as sorting, ordering, filtering, etc.)\n\n${tools}`
					: "") +
				(templates ? `\n\n### RTL - Resource Templates List\n${templates}` : "") +
				(resources
					? `\n\n### DRL - Direct Resources List\n${resources}\n\nIMPORTANT: These resources can have descriptions applicable to the task. Always read relevant resources that can help accomplish the task.`
					: "")
			)
		})
		.join("\n\n")
}
