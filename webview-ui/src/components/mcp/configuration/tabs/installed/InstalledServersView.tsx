import { useExtensionState } from "@/context/ExtensionStateContext"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"

import { McpServiceClient, UiServiceClient } from "@/services/grpc-client"

import { EmptyRequest, StringRequest } from "@shared/proto/common"
import ServersToggleList from "./ServersToggleList"
const InstalledServersView = () => {
	const { mcpServers: servers, navigateToSettings } = useExtensionState()

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
				<p style={{ fontSize: "11px", margin: 5, marginBottom: 0 }}>
					Metadata (tools, resources, parameters) for enabled servers is sent with every task message. To keep the
					context memory usage optimal, especially with servers with many tools and resources, enable only servers that
					you are using for the current tasks. You can quickly enable or disable servers from the chat window footer
					when needed.
				</p>
			</div>
			<VSCodeButton
				appearance="icon"
				style={{ width: "100%", marginBottom: "20px", background: "var(--vscode-button-secondaryBackground)" }}
				onClick={() => {
					McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch((error) => {
						console.error("Error opening MCP settings:", error)
					})
				}}>
				<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
				Configure
			</VSCodeButton>
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
						Advanced MCP Settings
					</VSCodeLink>
				</div>
			</div> */}
			<ServersToggleList servers={servers} isExpandable={true} hasTrashIcon={true} listGap="medium" />
		</div>
	)
}

export default InstalledServersView
