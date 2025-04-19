import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "@/utils/vscode"
import { useExtensionState } from "@/context/ExtensionStateContext"
import ServersToggleList from "./ServersToggleList"
import { mcpConfiguration } from "@shared/Configuration"
const InstalledServersView = () => {
	const { mcpServers: servers } = useExtensionState()

	return (
		<div style={{ padding: "0px 20px" }}>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "left",
					textAlign: "left",
				}}>
				<p style={{ fontSize: "13px", margin: 0 }}>
					<ul style={{ listStyleType: "disc", paddingLeft: 15, paddingRight: 10 }}>
						<li>Metadata for enabled servers is sent with every chat request.</li>
						<li>Enable or disable servers as needed from the chat window footer.</li>
						<li>Keep enabled only servers that you are using in the current task.</li>
					</ul>
				</p>
			</div>
			<VSCodeButton
				appearance="secondary"
				style={{ width: "100%", marginBottom: "20px" }}
				onClick={() => {
					vscode.postMessage({ type: "openMcpSettings" })
				}}>
				<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
				Configure MCP Servers
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
