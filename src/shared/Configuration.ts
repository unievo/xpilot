// Configuration constants from package.json
import { name, publisher } from "../../package.json"

// Base
export const baseName = "Astro"
export const baseVersion = "2.1.0"
export const baseVersionUrl = `https://github.com/unievo/astro/blob/main/CHANGELOG.md#210`

// Product
export const agentName = "xPilot"
export const productName = "xpilot"
export const authorName = "unievo"
export const publishedName = name
export const publisherName = publisher
export const xUrl = "https://x.com/xPilotAI"
export const discordUrl = "https://discord.gg/bTzeCrhpP8"
export const repoUrl = "https://github.com/unievo/xpilot"
export const homePageUrl = "https://github.com/unievo/xpilot"
export const avatarUrl = "https://raw.githubusercontent.com/unievo/xpilot/main/assets/icons/icon_neutral.png"
export const gitInstructionsRepo = "https://github.com/unievo/xpilot-instructions.git"
export const gitWorkflowsRepo = "https://github.com/unievo/xpilot-workflows.git"

// Settings
export const enableDictation = false
export const enableYoloMode = true
export const enableTelemetrySettings = false
export const maxHistoryPreviewItems = 10
export const mcpLibraryEnabled = true
export const enableNewInstructionsDefaultSetting = false
export const mcpServerIncludeFullSchema_ToolsMaxCount = 5
export const mcpServerIncludeToolInputSchema_MaxLength = 100

// Files & Folders
export const homeRootDirectory = `.${authorName}`
export const agentWorkspaceDirectory = `.${productName}`
export const instructionsDirectory = `instructions`
export const workflowsDirectory = `workflows`
export const hooksDirectory = `hooks`
export const instructionsFilesExtension = `.md`
export const instructionsExcludedDirectories = [".*", "content"]
export const instructionsExcludedFiles = ["README.md"]
export const settingsDirectory = `settings`
export const mcpDirectory = `mcp`
export const mcpServersDirectory = `servers`
export const mcpSettingsFile = `mcp_settings.json`
export const ignoreFile = `.${productName}ignore`
export const extensionIconLightPath = ["assets", "icons", "icon_light.png"]
export const extensionIconDarkPath = ["assets", "icons", "icon_dark.png"]
export const ignoreWorkspaceDirectories = [
	//agentWorkspaceDirectory,
	".git",
	".github",
	"node_modules",
	"__pycache__",
	"env",
	".env",
	"venv",
	".venv",
	".cache",
	"target",
	"build",
	"debug",
	"release",
	"dist",
	"out",
	"bundle",
	"vendor",
	"tmp",
	"temp",
	"deps",
	"pkg",
	"Pods",
]
