// Custom prompt to use MCP resources in the task
export const mcpResourcesUse = `
## Additional context for task completion
- You have MCP Servers that expose resources in the direct resources list (DRL). 
- These resources can have descriptions applicable to the current step in a task. 
- Always read relevant resources using "access_mcp_resource" that can help accomplish the current task.
`
