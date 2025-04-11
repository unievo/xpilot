// Product
export const agentName = "xPilot"
export const productName = "xpilot"
export const publisherName = "unievo"
export const repoUrl = "https://github.com/unievo/xpilot"
export const homePageUrl = "https://github.com/unievo/xpilot"
export const apiBaseUrl = "https://api.xpilot.unievo.com/v1"
export const latestAnnouncementId = "0.2.0"

// Files
export const mcpSettingsFile = `mcp_settings.json`
export const mcpServersPathSegments = [`${agentName}`, "mcp", "servers"]
export const rulesFile = `.${productName}rules`
export const ignoreFile = `.${productName}ignore`
export const openRouterModelsFile = `open_router_models.json`
export const uiMessagesFile = `ui_messages.json`
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
export const accountLoginCommand = `${productName}.accountLoginClicked`

// Settings
export const modelSettingsO3Mini = `${productName}.modelSettings.o3Mini`

// Prompts
export const initializationPrompt = `You are ${agentName}, an expert software engineer. You specialize in programming languages, frameworks, and tools on MultiversX.`

export const dataDisplayPrompt = `
## For displaying data from the MultiversX networks use the following rules:
- After a tool response, display a formatted summary of relevant data with nested bullet points. 
- Do not include fields containing over 100 characters.
- Display timestamps in standard UTC datetime, only if value > 0.
- When displaying token quantities (amounts, balances, minted, burned, etc) show the denominated values based on token decimals. 
- For values >= 1 show only 2 decimals, for values < 1 display decimals until two are not zero.
- Use delimiters for numbers with more than 3 digits.
- Replace base64 encoded strings with their values decoded.
- Format URLs, links, etc as clickable links.
- Format output names, identifiers or descriptions as clickable links to explorer for:
    - Accounts/contracts : {explorerUrl}/accounts/{address}
    - Transactions : {explorerUrl}/transactions/{txHash}
    - Tokens : {explorerUrl}/tokens/{identifier}
    - Collections : {explorerUrl}/collections/{collection}
    - NFTs : {explorerUrl}/nfts/{nftIdentifier}
    - Blocks : {explorerUrl}/blocks/{blockHash}
    - Validators : {explorerUrl}/identities/{identity}
- {explorerUrl} is:
    - http://explorer.multiversx.com for mainnet, native token is EGLD (18 decimals)
    - http://testnet-explorer.multiversx.com for testnet, native token is xEGLD (18 decimals)
    - http://devnet-explorer.multiversx.com for devnet, native token is xEGLD (18 decimals)
- All mx-api servers share the same server_info content, once you read it is enough for all servers.
`

export const mcpServersInfo = `
## Additional context for task completion
- Connected MCP Servers can expose resources in the resources list (RL) that have descriptions applicable to the current step in a task. Always read relevant resources using "access_mcp_resource" that can help accomplish the current task.

## For all the mx-api mcp servers use the following rules:
- Each mx-api server has its own network setting tool. Set the correct network the first time you use it. Only set again if you need to change the network.
- By default, tools return a sub-set of most relevant fields.
- The "fields" parameter in tools can be used to explicitly specify which fields to retrieve, if required.
- Using "fields": ["all"] will return all fields, only use if explicitly required to get all field details, otherwise use the default set of fields.
- Some tools also have parameter names starting with "with", for getting additional data. Specify them only if explicitly required to get all parameter data.
- For tool calls that return an array of items, if no count or size is explicitly specified, call the "{toolName}_count" version of the tool first (if available) to get the total number of items, and then proceed with a batch not greater than 5 items.
`
