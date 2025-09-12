import type { ToolUse } from "@core/assistant-message"
import { formatResponse } from "@/core/prompts/responses"
import { ClineDefaultTool } from "@/shared/tools"
import type { ToolResponse } from "../../index"
import type { IPartialBlockHandler, IToolHandler } from "../ToolExecutorCoordinator"
import type { TaskConfig } from "../types/TaskConfig"
import type { StronglyTypedUIHelpers } from "../types/UIHelpers"

export class GetMcpToolInputSchemaHandler implements IToolHandler, IPartialBlockHandler {
	readonly name = ClineDefaultTool.MCP_INPUT_SCHEMA

	constructor() {}

	getDescription(block: ToolUse): string {
		return `[${block.name} for '${block.params.tool_name}' on '${block.params.server_name}']`
	}

	async handlePartialBlock(_block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void> {
		// Show loading message for partial blocks (though this tool probably won't have partials)
		await uiHelpers.say(ClineDefaultTool.MCP_INPUT_SCHEMA, "", undefined, undefined, true)
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		// Show loading message at start of execution (self-managed now)
		await config.callbacks.say(ClineDefaultTool.MCP_INPUT_SCHEMA, "", undefined, undefined, false)

		const server_name: string | undefined = block.params.server_name
		const tool_name: string | undefined = block.params.tool_name

		try {
			if (!server_name) {
				config.taskState.consecutiveMistakeCount++
				return await config.callbacks.sayAndCreateMissingParamError(this.name, "server_name")
			}

			if (!tool_name) {
				config.taskState.consecutiveMistakeCount++
				return await config.callbacks.sayAndCreateMissingParamError(this.name, "tool_name")
			}

			config.taskState.consecutiveMistakeCount = 0

			await config.callbacks.say(
				"get_mcp_tool_input_schema",
				`Getting input schema for ${tool_name} on ${server_name}`,
				undefined,
				undefined,
				false,
			)

			// Find the tool in the connected servers
			const connectedServers = config.services.mcpHub.getServers().filter((server) => server.status === "connected")
			const targetServer = connectedServers.find((server) => server.name === server_name)

			if (!targetServer) {
				const errorMessage = `MCP server "${server_name}" not found or not connected`
				return formatResponse.toolError(errorMessage)
			}

			const targetTool = targetServer.tools?.find((tool) => tool.name === tool_name)

			if (!targetTool) {
				const errorMessage = `Tool "${tool_name}" not found on MCP server "${server_name}"`
				return formatResponse.toolError(errorMessage)
			}

			const inputSchema = targetTool.inputSchema
			const schemaResult = inputSchema ? JSON.stringify(inputSchema, null, 2) : "No input schema defined for this tool"

			return formatResponse.toolResult(schemaResult)
		} catch (error) {
			return `Error loading MCP Tool Input Schema: ${(error as Error)?.message}`
		}
	}
}
