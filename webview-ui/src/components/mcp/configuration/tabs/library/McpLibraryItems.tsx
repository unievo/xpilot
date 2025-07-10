import { McpLibraryItem } from "@shared/mcp"

export const mcpLibraryItems: McpLibraryItem[] = [
	{
		mcpId: "mcp-id",
		name: "MCP Server Name",
		description: "Provides tools for managing and interacting with the MCP.",
		logoUrl: "https://cdn-icons-png.flaticon.com/512/10439/10439399.png",
		githubUrl: "https://github.com/",
		npmPackage: "@scope/mcp-server",
		category: "Category Name",
		tags: ["Tag1", "Tag2"],
		author: "unievo",
		codiconIcon: "server",
		requiresApiKey: false,
		isRecommended: true,
		createdAt: new Date("2025-04-18").toISOString(),
		updatedAt: new Date("2025-04-18").toISOString(),
	},
]
