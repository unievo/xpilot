import { McpServer } from "@shared/mcp"
import { mcpLibraryItems } from "@shared/mcpLibraryItems"
import { StringRequest } from "@shared/proto/cline/common"
import { McpDownloadResponse } from "@shared/proto/cline/mcp"
import axios from "axios"
import { Controller } from ".."
import { sendChatButtonClickedEvent } from "../ui/subscribeToChatButtonClicked"

/**
 * Download an MCP server from the local library
 * @param controller The controller instance
 * @param request The request containing the MCP ID
 * @returns MCP download response with details or error
 */
export async function downloadLibraryMcp(controller: Controller, request: StringRequest): Promise<McpDownloadResponse> {
	try {
		// Check if mcpId is provided
		if (!request.value) {
			throw new Error("MCP ID is required")
		}

		const mcpId = request.value

		// Check if we already have this MCP server installed
		const servers = controller.mcpHub?.getServers() || []
		const isInstalled = servers.some((server: McpServer) => server.name === mcpId)

		if (isInstalled) {
			throw new Error("This MCP server is already installed")
		}

		// Find the library item
		const libraryItem = mcpLibraryItems.find((item: { mcpId: string }) => item.mcpId === mcpId)

		if (!libraryItem) {
			throw new Error(`MCP server "${mcpId}" not found in library`)
		}

		// If the library item doesn't have readme content or llms installation content, fetch it from GitHub
		let readmeContent = libraryItem.readmeContent || ""
		const llmsInstallationContent = libraryItem.llmsInstallationContent || ""

		// Fetch README from GitHub if no installation content is available
		if (!(readmeContent || llmsInstallationContent || libraryItem.npmPackage) && libraryItem.githubUrl) {
			try {
				// Extract owner and repo from GitHub URL
				const githubUrlMatch = libraryItem.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
				if (githubUrlMatch) {
					const [, owner, repo] = githubUrlMatch
					const cleanRepo = repo.replace(/\.git$/, "")

					// Fetch README from GitHub API
					const readmeResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, {
						headers: {
							Accept: "application/vnd.github.v3.raw",
						},
						timeout: 10000,
					})
					readmeContent = readmeResponse.data
				}
			} catch (error) {
				console.warn("Failed to fetch README from GitHub:", error)
				// Continue without README content
			}
		}

		// Generate installation task prompt
		const mcpSettingsFilePath = await controller.mcpHub.getMcpSettingsFilePath()

		// Build installation instructions
		let defaultInstallInstructions = ""
		// Provide package installation instructions if specified as an NPM package
		if (libraryItem.npmPackage) {
			defaultInstallInstructions = `- The NPM package name is "${libraryItem.npmPackage}". 
- To install from a NPM package add the MCP server configuration to the mcp settings.
Don't directly install any packages as they are managed by the npx cli tool.

\`\`\`json
{
  "mcpServers": {
    ...,
    "{server-name}": {
      "command": "npx",
      "args": [
        "-y",
        "@{npm-package}",
		<other possible args>
		],
      "env": {
        "{ENV_SETTING_NAME1}": "env_setting_value1",
        "{ENV_SETTING_NAME2}": "env_setting_value2"
      }
    },
  }
}
\`\`\`

"env" settings are optional and can be used to set environment variables or API keys for the MCP server.
If no "env" settings are required, you can omit the "env" object.`
		}

		// Provide default installation instructions if no other installation content is provided
		else if (!readmeContent && !llmsInstallationContent) {
			defaultInstallInstructions = `- Start by loading the MCP documentation using the load_mcp_documentation tool.
- Create the directory for the new MCP server before starting installation.`
		}

		// Build server installation info content section if available
		let serverProvidedInfo = ""
		if (readmeContent || llmsInstallationContent) {
			serverProvidedInfo = `- The following content is provided for the server installation and may contain instructions that conflict with the user's OS, in which case proceed thoughtfully.

${readmeContent}${readmeContent && llmsInstallationContent ? "\n\n" : ""}${llmsInstallationContent}`
		}

		// Create the complete task prompt
		const task = `Install the ${libraryItem.name} MCP server while following these installation rules:
- The mcp settings file is located at "${mcpSettingsFilePath}".
- The settings file may have other MCP servers already configured, so you must read it first and then add the new server to the existing \`mcpServers\` object.
- Use "${libraryItem.mcpId}" as the server name in the mcp settings file.
- Do not overwrite any existing configuration.
- Use commands aligned with the user's shell and operating system.
IMPORTANT: Regardless of any other MCP settings in the file, you must default any new MCP servers you add to disabled=false and autoApprove=[].
${defaultInstallInstructions ? `\n` + defaultInstallInstructions : ``}${serverProvidedInfo ? `\n` + serverProvidedInfo : ``}

- Once installed, ask the user if they want to demonstrate the server's capabilities by using one of its tools.`

		const { mode } = await controller.getStateToPostToWebview()
		if (mode === "plan") {
			await controller.togglePlanActMode("act")
		}

		// Initialize task and show chat view
		await controller.initTask(task)
		await sendChatButtonClickedEvent(controller.id)

		// Return the download details
		return McpDownloadResponse.create({
			mcpId: libraryItem.mcpId,
			githubUrl: libraryItem.githubUrl,
			name: libraryItem.name,
			author: libraryItem.author,
			description: libraryItem.description,
			readmeContent,
			llmsInstallationContent,
			requiresApiKey: libraryItem.requiresApiKey || false,
		})
	} catch (error) {
		console.error("Failed to download library MCP:", error)
		let errorMessage = "Failed to download library MCP"

		if (axios.isAxiosError(error)) {
			if (error.code === "ECONNABORTED") {
				errorMessage = "Request timed out while fetching README. Please try again."
			} else if (error.response?.status === 404) {
				errorMessage = "README not found on GitHub."
			} else if (!error.response && error.request) {
				errorMessage = "Network error. Please check your internet connection."
			}
		} else if (error instanceof Error) {
			errorMessage = error.message
		}

		// Return error in the response instead of throwing
		return McpDownloadResponse.create({
			mcpId: "",
			githubUrl: "",
			name: "",
			author: "",
			description: "",
			readmeContent: "",
			llmsInstallationContent: "",
			requiresApiKey: false,
			error: errorMessage,
		})
	}
}
