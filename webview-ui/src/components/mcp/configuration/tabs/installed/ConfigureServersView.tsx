import { mcpLibraryEnabled } from "@shared/Configuration"
import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { McpServiceClient } from "@/services/grpc-client"

import AddRemoteServerForm from "../add-server/AddRemoteServerForm"
import ServersToggleList from "./ServersToggleList"

const ConfigureServersView = () => {
	const { mcpServers: servers, navigateToSettings, remoteConfigSettings, navigateToMcp } = useExtensionState()
	const [showAddServer, setShowAddServer] = useState(false)

	const mcpMarketplaceEnabled = remoteConfigSettings?.mcpMarketplaceEnabled !== false

	return (
		<div style={{ padding: "5px 15px" }}>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "left",
					textAlign: "left",
					marginBottom: "10px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				<div style={{ fontSize: "12px", margin: 5, marginBottom: 5 }}>
					Use <b>Settings</b> to edit the MCP configuration file. Use <b>Remote</b> to add a remote server.{" "}
					{(mcpLibraryEnabled || mcpMarketplaceEnabled) && (
						<div style={{ marginTop: "-10px" }}>
							<br />
							You can install servers from the{" "}
							{mcpLibraryEnabled && (
								<VSCodeLink onClick={() => navigateToMcp("library")} style={{ fontSize: "12px" }}>
									Library
								</VSCodeLink>
							)}
							{mcpMarketplaceEnabled && (
								<span>
									{mcpLibraryEnabled && " or the "}
									<VSCodeLink onClick={() => navigateToMcp("marketplace")} style={{ fontSize: "12px" }}>
										Marketplace
									</VSCodeLink>
								</span>
							)}
							{"."}
						</div>
					)}
				</div>
			</div>
			{/* Button Row */}
			<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
				<VSCodeButton
					appearance="icon"
					onClick={() => {
						McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch((error) => {
							console.error("Error opening MCP settings:", error)
						})
					}}
					style={{ flex: 1, width: "100%", marginBottom: "5px", background: "var(--vscode-button-Background)" }}>
					<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
					Settings
				</VSCodeButton>

				{/* Collapsible Add Server Section styled as a button */}
				<VSCodeButton
					appearance="icon"
					onClick={() => setShowAddServer((v) => !v)}
					style={{
						flex: 1,
						background: "var(--vscode-button-Background)",
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-start",
					}}>
					<span
						className={`codicon ${showAddServer ? "codicon-chevron-down" : "codicon-chevron-right"}`}
						style={{ marginRight: "2px", marginBottom: "4px", fontSize: "16px" }}></span>
					Remote
				</VSCodeButton>
			</div>
			{showAddServer && (
				<div style={{ marginTop: "30px", marginBottom: "10px" }}>
					<AddRemoteServerForm onServerAdded={() => {}} />
				</div>
			)}

			{/* Settings Section */}
			{/* <div style={{ marginBottom: "10px", marginTop: 3 }}>
				<div style={{ textAlign: "right" }}>
					<VSCodeLink
						onClick={() => {
							// First open the settings panel using direct navigation
							navigateToSettings()

							// After a short delay, send a message to scroll to browser settings
							setTimeout(async () => {
								try {
									await UiServiceClient.scrollToSettings(StringRequest.create({ value: "features" }))
								} catch (error) {
									console.error("Error scrolling to mcp settings:", error)
								}
							}, 300)
						}}
						style={{ fontSize: "12px" }}>
						MCP Settings
					</VSCodeLink>
				</div>
			</div> */}

			<hr style={{ opacity: 0.1 }}></hr>
			<br />
			<ServersToggleList hasTrashIcon={true} isExpandable={true} listGap="small" servers={servers} />
		</div>
	)
}

export default ConfigureServersView
