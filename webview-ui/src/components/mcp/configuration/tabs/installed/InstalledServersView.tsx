import { useExtensionState } from "@/context/ExtensionStateContext"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"

import { McpServiceClient, UiServiceClient } from "@/services/grpc-client"

import { EmptyRequest, StringRequest } from "@shared/proto/common"
import ServersToggleList from "./ServersToggleList"
import AddRemoteServerForm from "../add-server/AddRemoteServerForm"
const InstalledServersView = () => {
	const { mcpServers: servers, navigateToSettings } = useExtensionState()
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
					opacity: 0.7,
				}}>
				<p style={{ fontSize: "12px", margin: 5, marginBottom: 0 }}>
					The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to AI
					models.
				</p>
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
