import os from "os"
import osName from "os-name"
import { getGlobalInstructionsDirectoryPath, getGlobalWorkflowsDirectoryPath } from "@/core/storage/disk"
import { workspaceInstructionsDirectoryPath, workspaceWorkflowsDirectoryPath } from "@/shared/Configuration"
import { McpHub } from "../../../../services/mcp/McpHub"
import { BrowserSettings } from "../../../../shared/BrowserSettings"
import { getShell } from "../../../../utils/shell"

export const SystemInformationPrompt = async (
	cwd: string,
	_supportsBrowserUse: boolean,
	mcpHub: McpHub,
	_browserSettings: BrowserSettings,
) => `
SYSTEM INFORMATION

Operating System: ${osName()}
Default Shell: ${getShell()}
Home Directory: ${os.homedir().toPosix()}
Current Working Directory: ${cwd.toPosix()}
MCP Servers configuration file: ${await mcpHub.getMcpSettingsFilePath()}
Workspace Instructions Directory: ${workspaceInstructionsDirectoryPath.toPosix()}
Global Instructions Directory: ${(await getGlobalInstructionsDirectoryPath()).toPosix()}
Workspace Workflows Directory: ${workspaceWorkflowsDirectoryPath.toPosix()}
Global Workflows Directory: ${(await getGlobalWorkflowsDirectoryPath()).toPosix()}
`
