import { useExtensionState } from "@/context/ExtensionStateContext"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"

import { McpServiceClient, UiServiceClient } from "@/services/grpc-client"

import { EmptyRequest, StringRequest } from "@shared/proto/common"
import ServersToggleList from "./ServersToggleList"
import AddRemoteServerForm from "../add-server/AddRemoteServerForm"
import { mcpLibraryEnabled } from "@shared/Configuration"
const InstalledServersView = () => {
	const { mcpServers: servers, navigateToSettings, mcpMarketplaceEnabled, navigateToMcp } = useExtensionState()
	const [showAddServer, setShowAddServer] = useState(false)

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
					Use <b>Configure</b> to edit the MCP settings, or <b>Add Remote</b> to add a remote server{" "}
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
						</div>
					)}
				</div>
			</div>
			{/* Button Row */}
			<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
				<VSCodeButton
					appearance="icon"
					style={{ flex: 1, background: "var(--vscode-button-Background)" }}
					onClick={() => {
						McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch((error) => {
							console.error("Error opening MCP settings:", error)
						})
					}}>
					<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
					Configure
				</VSCodeButton>

				{/* Collapsible Add Server Section styled as a button */}
				<VSCodeButton
					appearance="icon"
					style={{
						flex: 1,
						background: "var(--vscode-button-Background)",
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-start",
					}}
					onClick={() => setShowAddServer((v) => !v)}>
					<span
						className={`codicon ${showAddServer ? "codicon-chevron-down" : "codicon-chevron-right"}`}
						style={{ marginRight: "2px", fontSize: "16px" }}></span>
					Add Remote
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
			<ServersToggleList servers={servers} isExpandable={true} hasTrashIcon={true} listGap="small" />
		</div>
	)
}

export default InstalledServersView
