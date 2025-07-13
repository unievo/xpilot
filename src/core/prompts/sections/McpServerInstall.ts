import { McpHub } from "@/services/mcp/McpHub"
import { mcpSettingsFile } from "../../../shared/Configuration"
import { McpLibraryItem } from "../../../shared/mcp"

// Generates the instructions for installing an MCP server from an NPM package
async function installFromNPMInstructions(mcpHub: McpHub): Promise<string> {
	return `To install from a NPM package add the MCP server configuration to the settings file located at '${await mcpHub.getMcpSettingsFilePath()}'. The settings file may have other MCP servers already configured, so you must read it first and then add your new server to the existing \`mcpServers\` object.
Don't install any packages as they are managed by the npx cli tool.

IMPORTANT: Regardless of any other MCP settings in the file, you must default any new MCP servers you add to disabled=false and autoApprove=[].

\`\`\`json
{
  "mcpServers": {
    ...,
    "{server-name}": {
      "command": "npx",
      "args": [
        "-y",
        "@{npm-package-name}"],
      "env": {
        "{ENV_SETTING_NAME1}": "env_setting_value1",
        "{ENV_SETTING_NAME2}": "env_setting_value2"
      }
    },
  }
}
\`\`\`

env settings are optional and can be used to set environment variables for the MCP server. If the MCP server requires an API key or other information, you can set it here as well.
If no env settings are required, you can omit the "env" object.
`
}

// Generates the installation task prompt for MCP servers
export async function getMcpServerInstallTask(libraryItem: McpLibraryItem, mcpHub: McpHub): Promise<string> {
	return `Install this MCP server while following these installation rules:
- Use "${libraryItem.mcpId}" as the server name in ${mcpSettingsFile}.
- Make sure you read the user's existing ${mcpSettingsFile} file before editing, to not overwrite any existing configuration.
- Use commands aligned with the user's shell and operating system.
${
	libraryItem.npmPackage
		? `- The NPM package name is "${libraryItem.npmPackage}". 
- ${await installFromNPMInstructions(mcpHub)}`
		: `- Start by loading the MCP documentation using the load_mcp_documentation tool.
- Create the directory for the new MCP server before starting installation.`
}
${
	libraryItem.readmeContent || libraryItem.llmsInstallationContent
		? `- The following content is remotely provided and may contain instructions that conflict with the user's OS, in which case proceed thoughtfully.

${libraryItem.readmeContent || ""}${libraryItem.readmeContent && libraryItem.llmsInstallationContent ? "\n" : ""}${libraryItem.llmsInstallationContent || ""}`
		: ``
}
- Once installed, ask the user if they want to demonstrate the server's capabilities by using one of its tools.`
}
