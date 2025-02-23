import os from "os"
import osName from "os-name"
import { getShell } from "../../../utils/shell"
import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"

export const SystemInformationPrompt = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
# SYSTEM INFORMATION

Operating System: ${osName()}

Default Shell: ${getShell()}

Home Directory: ${os.homedir().toPosix()}

Current Working Directory: ${cwd.toPosix()}
`
