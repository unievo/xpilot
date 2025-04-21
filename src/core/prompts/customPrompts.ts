import { agentName } from "../../shared/Configuration"

// Custom Prompts
export const initializationPrompt = `You are ${agentName}, an expert software engineer. You specialize in programming languages, frameworks, and tools.`

export const mcpServersInfo = `
## Additional context for task completion
- ALWAYS take into consideration: Connected MCP Servers can expose resources in the direct resources list (DRL) that have descriptions applicable to the current step in a task. Always read relevant resources using "access_mcp_resource" that can help accomplish the current task.
`

export const dataDisplayPrompt = `
`
