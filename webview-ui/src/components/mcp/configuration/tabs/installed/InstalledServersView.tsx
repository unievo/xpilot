import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "@/utils/vscode"
import { useExtensionState } from "@/context/ExtensionStateContext"
import ServersToggleList from "./ServersToggleList"
import { mcpConfiguration } from "@shared/Configuration"
const InstalledServersView = () => {
	const { mcpServers: servers } = useExtensionState()

	return (
		<div style={{ padding: "5px 10px" }}>
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
					you are using for the current tasks. You can enable or disable servers quickly from the chat window footer
					when needed.
				</p>
			</div>
			<VSCodeButton
				appearance="secondary"
				style={{ width: "100%", marginBottom: "17px" }}
				onClick={() => {
					vscode.postMessage({ type: "openMcpSettings" })
				}}>
				<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
				Configure
			</VSCodeButton>
			{/* Settings Section */}
			{/* <div style={{ marginBottom: "10px", marginTop: 3 }}>
				<div style={{ textAlign: "right" }}>
					<VSCodeLink
						onClick={() => {
							vscode.postMessage({
								type: "openExtensionSettings",
								text: mcpConfiguration,
							})
						}}
						style={{ fontSize: "12px" }}>
						Advanced MCP Settings
					</VSCodeLink>
				</div>
			</div> */}
			<ServersToggleList servers={servers} isExpandable={true} hasTrashIcon={false} />
		</div>
	)
}

export default InstalledServersView
