// Product
export const agentName = "Astro"
export const productName = "astro"
export const publisherName = "unievo"
export const repoUrl = "https://github.com/unievo/astro"
export const homePageUrl = "https://github.com/unievo/astro"
export const apiBaseUrl = "https://api.astro.unievo.com/v1"
export const latestAnnouncementId = "0.1.0"

// Files
export const mcpSettingsFile = `mcp_settings.json`
export const mcpServersPathSegments = [`${agentName}`, "mcp", "servers"]
export const rulesFile = `.${productName}rules`
export const ignoreFile = `.${productName}ignore`
export const openRouterModelsFile = `open_router_models.json`
export const uiMessagesFile = `ui_messages.json`
export const taskMetadataFile = `task_metadata.json`
export const contextHistoryFile = `context_history.json`
export const apiConversationHistoryFile = `api_conversation_history.json`
export const extensionIconLightPathSegments = ["assets", "icons", "icon_light.png"]
export const extensionIconDarkPathSegments = ["assets", "icons", "icon_dark.png"]

// Extension
export const extensionId = `${publisherName}.${productName}`
export const sideBarId = `${productName}.SidebarProvider`
export const tabPanelId = `${productName}.TabPanelProvider`
export const plusButtonCommand = `${productName}.plusButtonClicked`
export const mcpButtonCommand = `${productName}.mcpButtonClicked`
export const popupButtonCommand = `${productName}.popoutButtonClicked`
export const openNewTabCommand = `${productName}.openInNewTab`
export const settingsButtonCommand = `${productName}.settingsButtonClicked`
export const historyButtonCommand = `${productName}.historyButtonClicked`
export const accountButtonCommand = `${productName}.accountButtonClicked`
export const isDevMode = `${productName}.isDevMode`
export const createTestTasksCommand = `${productName}.dev.createTestTasks`
export const addToAgentCodeActionName = `Add to ${agentName}`
export const addToChatCommand = `${productName}.addToChat`
export const fixWithAgentCommand = `${productName}.fixWithAgent`
export const fixWithAgentCodeActionName = `Fix with ${agentName}`
export const addTerminalOutputToChatCommand = `${productName}.addTerminalOutputToChat`

// Settings
export const mcpConfiguration = `${productName}.mcp`
export const o3MiniModelConfiguration = `${productName}.modelSettings.o3Mini`

// Prompts
export const initializationPrompt = `You are ${agentName}, an expert software engineer.`

export const dataDisplayPrompt = `
`

export const mcpServersInfo = `
`
