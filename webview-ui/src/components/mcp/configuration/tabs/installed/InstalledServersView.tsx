import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "@/utils/vscode"
import { useExtensionState } from "@/context/ExtensionStateContext"
import ServersToggleList from "./ServersToggleList"
import { mcpConfiguration } from "@shared/Configuration"
const InstalledServersView = () => {
	const { mcpServers: servers } = useExtensionState()

	return (
		<div style={{ padding: "16px 20px" }}>
			<div
				style={{
					color: "var(--vscode-foreground)",
					fontSize: "13px",
					marginBottom: "16px",
					marginTop: "5px",
				}}>
				The{" "}
				<VSCodeLink href="https://github.com/modelcontextprotocol" style={{ display: "inline" }}>
					Model Context Protocol
				</VSCodeLink>{" "}
				enables communication with locally running MCP servers that provide additional tools and resources.{" "}
				{/* You can use{" "}
				<VSCodeLink href="https://github.com/modelcontextprotocol/servers" style={{ display: "inline" }}>
					community-made servers
				</VSCodeLink>{" "}
				or ask {agentName} to create new tools specific to your workflow (e.g., "add a tool that gets the latest npm docs").{" "} */}
			</div>

			<ServersToggleList servers={servers} isExpandable={true} hasTrashIcon={false} />

			{/* Settings Section */}
			<div style={{ marginBottom: "20px", marginTop: 10 }}>
				<VSCodeButton
					appearance="secondary"
					style={{ width: "100%", marginBottom: "5px" }}
					onClick={() => {
						vscode.postMessage({ type: "openMcpSettings" })
					}}>
					<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
					Configure MCP Servers
				</VSCodeButton>

				<div style={{ textAlign: "center" }}>
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
			</div>
		</div>
	)
}

export default InstalledServersView
