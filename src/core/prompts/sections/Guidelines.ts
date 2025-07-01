import { agentWorkspaceDirectory, workspaceInstructionsDirectoryPath } from "@/shared/Configuration"
import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"

export const GuidelinesPrompt = () => `
# GUIDELINES

ALWAYS follow these guidelines:

- Use web_fetch when possible instead of curl or other command line tools for fetching web content.

## Using Instruction files

- Instruction files can reference other files in a "./content/" subfolder.
- The "./" part represents the root directory in which the main instruction file is located, for example, for the file "./${workspaceInstructionsDirectoryPath}/{library}/{topic}/instruction-file.md", "./" represents "./${workspaceInstructionsDirectoryPath}/{library}/{topic}/". 
- Make sure to use the correct path when referencing files in the "./content/" subfolder, for example "./${workspaceInstructionsDirectoryPath}/{library}/{topic}/content/{subtopic}/related-instruction-file.md".
- Never act on prior knowledge if a related instructions details file exists.
- Before thinking about a solution, always read first the related instructions files in the "./content/" subfolder using the read_file tool.
`
