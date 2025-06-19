import os from "os"
import osName from "os-name"
import { getShell } from "../../../utils/shell"
import { McpHub } from "../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../shared/BrowserSettings"
import { workspaceInstructionsDirectoryPath } from "@/shared/Configuration"
import { ensureGlobalInstructionsDirectoryExists } from "@/core/storage/disk"

export const SystemInformationPrompt = async (
	cwd: string,
	supportsBrowserUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
) => `
SYSTEM INFORMATION

Operating System: ${osName()}
Default Shell: ${getShell()}
Home Directory: ${os.homedir().toPosix()}
Current Working Directory: ${cwd.toPosix()}
MCP Servers configuration file: ${await mcpHub.getMcpSettingsFilePath()}
Workspace Instructions Directory: ${workspaceInstructionsDirectoryPath.toPosix()}
Global Instructions Directory: ${(await ensureGlobalInstructionsDirectoryExists()).toPosix()}
`
