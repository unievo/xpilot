import { McpLibraryItem } from "./mcp"

export const mcpLibraryItems: McpLibraryItem[] = [
	{
		mcpId: "context7-mcp",
		name: "Context7",
		description: "Context7 MCP pulls up-to-date, version-specific documentation and code examples straight from the source.",
		logoUrl: "https://avatars.githubusercontent.com/u/74989412?s=200&v=4",
		githubUrl: "https://github.com/upstash/context7",
		// npmPackage: "@upstash/context7-mcp",
		category: "Documentation",
		tags: ["Code", "Snippets", "Docs"],
		author: "Upstash",
		codiconIcon: "server",
		requiresApiKey: false,
		isRecommended: true,
		readmeContent: "",
		llmsInstallationContent: `Add to mcp settings file:		
{
  "mcpServers": {
    "context7-mcp": {
      "url": "https://mcp.context7.com/mcp",
      "type": "streamableHttp",
    }
  }
}`,
		createdAt: new Date("2025-09-18").toISOString(),
		updatedAt: new Date("2025-09-18").toISOString(),
	},
	{
		mcpId: "ref-tools-mcp",
		name: "Ref Tools",
		description:
			"Ref connects your AI coding tools with documentation context. It includes an up-to-date index of public documentation and it can ingest your private documentation (eg. GitHub repos, PDFs) as well.",
		logoUrl: "https://avatars.githubusercontent.com/u/210568548?s=48&v=4",
		githubUrl: "https://github.com/ref-tools/ref-tools-mcp",
		// npmPackage: "ref-tools-mcp@latest",
		category: "Documentation",
		tags: ["Code", "Snippets", "Docs"],
		author: "Ref Tools",
		codiconIcon: "server",
		requiresApiKey: true,
		isRecommended: true,
		readmeContent: "",
		llmsInstallationContent: `Add to mcp settings file:		
{
  "mcpServers": {
    "ref-tools-mcp": {
      "url": "https://api.ref.tools/mcp?apiKey=USER_API_KEY",
      "type": "streamableHttp",
    }
  }
}
Ask the user to replace the USER_API_KEY in the mcp settings file with their actual API key.`,

		createdAt: new Date("2025-10-01").toISOString(),
		updatedAt: new Date("2025-10-01").toISOString(),
	},
]
