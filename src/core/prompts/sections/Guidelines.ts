import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"

export const GuidelinesPrompt = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
# GUIDELINES

ALWAYS follow these guidelines:

## Instruction files

- Instruction files are used to provide additional context for tasks and can link to detailed content files specified in "./content/*.*" sub-folders.
- You are always required to read any additional content files specified in instructions related to the current task.
`
