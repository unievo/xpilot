// Base
export const baseName = "Cline"
export const baseVersion = "v3.19.7"
export const baseVersionUrl = `https://github.com/cline/cline/releases/tag/${baseVersion}`

// Product
export const agentName = "Astro"
export const productName = "astro"
export const marketplaceName = "astro-code"
export const publisherName = "unievo"
export const xUrl = "https://x.com/unievo_ai"
export const discordUrl = ""
export const repoUrl = "https://github.com/unievo/astro"
export const homePageUrl = "https://github.com/unievo/astro"
export const apiBaseUrl = ""
export const gitInstructionsRepo = ""
export const gitWorkflowsRepo = ""
export const latestAnnouncementId = "1.0.0"

// Settings
export const defaultChatMode = "act"
export const enableTelemetrySettings = false
export const maxHistoryPreviewItems = 10
export const mcpLibraryEnabled = false
export const mcpMarketplaceEnabledDefaultSetting = true
export const enableNewInstructionsDefaultSetting = false
export const mcpServerIncludeFullSchema_ToolsMaxCount = 5
export const mcpServerIncludeToolInputSchema_MaxLength = 100

// Extension
export const extensionId = `${publisherName}.${marketplaceName}`
export const sideBarId = `${productName}.SidebarProvider`
export const tabPanelId = `${productName}.TabPanelProvider`
export const plusButtonCommand = `${productName}.plusButtonClicked`
export const mcpButtonCommand = `${productName}.mcpButtonClicked`
export const popupButtonCommand = `${productName}.popoutButtonClicked`
export const openNewTabCommand = `${productName}.openInNewTab`
export const settingsButtonCommand = `${productName}.settingsButtonClicked`
export const historyButtonCommand = `${productName}.historyButtonClicked`
export const accountButtonCommand = `${productName}.accountButtonClicked`
export const focusChatInputCommand = `${productName}.focusChatInput`
export const generateGitCommitMessageCommand = `${productName}.generateGitCommitMessage`
export const openWalkthroughCommand = `${productName}.openWalkthrough`
export const isDevMode = `${productName}.isDevMode`
export const createTestTasksCommand = `${productName}.dev.createTestTasks`
export const addToAgentCodeActionName = `Add to ${agentName}`
export const fixWithAgentCodeActionName = `Fix with ${agentName}`
export const explainWithAgentCodeActionName = `Explain with ${agentName}`
export const improveWithAgentCodeActionName = `Improve with ${agentName}`
export const addToChatCommand = `${productName}.addToChat`
export const fixWithAgentCommand = `${productName}.fixWithAgent`
export const explainWithAgentCommand = `${productName}.explainCode`
export const improveWithAgentCommand = `${productName}.improveCode`
export const addTerminalOutputToChatCommand = `${productName}.addTerminalOutputToChat`

// Files & Folders
export const pathSeparator = "/"
export const agentWorkspaceDirectory = `.${productName}`
export const instructionsDirectory = `instructions`
export const workflowsDirectory = `workflows`
export const instructionsFilesExtension = `.md`
export const instructionsExcludedDirectories = [".git", "content"]
export const instructionsExcludedFiles = ["README.md"]
export const settingsDirectory = `settings`
export const mcpDirectory = `mcp`
export const mcpServersDirectory = `servers`
export const mcpSettingsFile = `mcp_settings.json`
export const ignoreFile = `.${productName}ignore`
export const openRouterModelsFile = `open_router_models.json`
export const groqModelsFile = `groq_models.json`
export const uiMessagesFile = `ui_messages.json`
export const taskMetadataFile = `task_metadata.json`
export const contextHistoryFile = `context_history.json`
export const apiConversationHistoryFile = `api_conversation_history.json`
export const extensionIconLightPath = `assets/icons/icon_light.png`
export const extensionIconDarkPath = `assets/icons/icon_dark.png`
export const workspaceInstructionsDirectoryPath = `${agentWorkspaceDirectory}/${instructionsDirectory}`
export const workspaceWorkflowsDirectoryPath = `${agentWorkspaceDirectory}/${workflowsDirectory}`
export const ignoreWorkspaceDirectories = [
	agentWorkspaceDirectory,
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
