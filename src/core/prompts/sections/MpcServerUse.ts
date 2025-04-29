import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"
import { mcpResourcesUse } from "../custom/mcp/mcpResourcesUse"

export const McpServerUsePrompt = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => {
	const servers = mcpHub.getServers()
	const connectedServers = servers.filter((server) => server.status === "connected")

	const hasResources = connectedServers.some(
		(server) =>
			//(Array.isArray(server.resourceTemplates) && server.resourceTemplates.length > 0) ||
			Array.isArray(server.resources) && server.resources.length > 0,
	)

	const mainContent = `
MCP SERVERS

The Model Context Protocol (MCP) enables communication between the system and locally running MCP servers that provide additional tools and resources to extend your capabilities.

# Installing MCP Servers from packages

## Installing packages from the NPM registry

A server can be installed from a NPM package, by adding the MCP server configuration to the settings file located at '${await mcpHub.getMcpSettingsFilePath()}'. The settings file may have other MCP servers already configured, so you would read it first and then add your new server to the existing \`mcpServers\` object.

IMPORTANT: Regardless of any other MCP settings in the file, you must default any new MCP servers you add to disabled=false and autoApprove=[].

\`\`\`json
{
  "mcpServers": {
    ...,
    "{server-name}": {
      "command": "npx",
      "args": [
  		"/y",
 		"@{npm-package-name}"],
      "env": {
        "{ENV_SETTING_NAME1}": "env_setting_value1",
		"{ENV_SETTING_NAME2}": "env_setting_value2"
      }
    },
  }
}
\`\`\` 

# Connected MCP Servers

When a server is connected, you can use the server's tools via the \`use_mcp_tool\` tool, and access the server's resources via the \`access_mcp_resource\` tool.

${
	servers.length > 0
		? `${connectedServers
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
						`## ${server.name} (\`${config.command}${config.args && Array.isArray(config.args) ? ` ${config.args.join(" ")}` : ""}\`)` +
						(tools ? `\n\n### ATL - Available Tools List\n${tools}` : "") +
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
