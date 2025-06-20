import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"

export const GuidelinesPrompt = async (
	cwd: string,
	supportsBrowserUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
# GUIDELINES

ALWAYS follow these guidelines:

## Instruction files

- Instruction files are used to provide up to date information and can link to detailed information in files from "./content/" sub-folders.
- Before using information you already know, always gather related information by reading any related files from "./content/" sub-folders!
`
