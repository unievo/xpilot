import { McpTool } from "@shared/mcp"
import { ToggleToolAutoApproveRequest } from "@shared/proto/cline/mcp"
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import HeroTooltip from "@/components/common/HeroTooltip"
import { itemIconColor } from "@/components/theme"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { McpServiceClient } from "@/services/grpc-client"

type McpToolRowProps = {
	tool: McpTool
	serverName?: string
}

const McpToolRow = ({ tool, serverName }: McpToolRowProps) => {
	const { autoApprovalSettings } = useExtensionState()
	const { setMcpServers } = useExtensionState()
	const [isParametersExpanded, setIsParametersExpanded] = useState(false)

	// Accept the event object
	const handleAutoApproveChange = (_event: any) => {
		if (!serverName) {
			return
		}

		McpServiceClient.toggleToolAutoApprove(
			ToggleToolAutoApproveRequest.create({
				serverName,
				toolNames: [tool.name],
				autoApprove: !tool.autoApprove,
			}),
		)
			.then((response) => {
				const mcpServers = convertProtoMcpServersToMcpServers(response.mcpServers)
				setMcpServers(mcpServers)
			})
			.catch((error) => {
				console.error("Error toggling tool auto-approve", error)
			})
	}
	return (
		<div
			key={tool.name}
			style={{
				padding: "0 0",
			}}>
			<div
				data-testid="tool-row-container"
				onClick={(e) => e.stopPropagation()}
				style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<div style={{ display: "flex", alignItems: "center" }}>
					<span className="codicon codicon-tools" style={{ color: itemIconColor, marginRight: "6px" }}></span>
					<span style={{ fontWeight: 500 }}>{tool.name}</span>
				</div>
				{serverName && autoApprovalSettings.enabled && autoApprovalSettings.actions.useMcp && (
					<HeroTooltip content="Auto-approve this tool">
						<VSCodeCheckbox
							checked={tool.autoApprove ?? false}
							data-tool={tool.name}
							onChange={handleAutoApproveChange}
							style={{ opacity: 0.7, scale: "0.8", justifyContent: "flex-end" }}>
							Auto
						</VSCodeCheckbox>
					</HeroTooltip>
				)}
			</div>
			{tool.description && (
				<div
					style={{
						marginTop: "5px",
						opacity: 0.7,
						fontSize: "0.9em",
					}}>
					{tool.description}
				</div>
			)}
			{tool.inputSchema &&
				"properties" in tool.inputSchema &&
				Object.keys(tool.inputSchema.properties as Record<string, any>).length > 0 && (
					<div
						style={{
							marginTop: "8px",
							fontSize: "inherit",
							border: "0.5px solid color-mix(in srgb, var(--vscode-descriptionForeground) 30%, transparent)",
							borderRadius: "6px",
							padding: "5px",
						}}>
						<div
							onClick={() => setIsParametersExpanded(!isParametersExpanded)}
							style={{
								marginBottom: "0px",
								opacity: 0.8,
								fontSize: "0.8em",
								textTransform: "uppercase",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								userSelect: "none",
							}}>
							<span
								className={`codicon ${isParametersExpanded ? "codicon-chevron-down" : "codicon-chevron-right"}`}
								style={{ color: itemIconColor, marginRight: "4px", fontSize: "14px", fontWeight: "bold" }}
							/>
							Parameters ({Object.keys(tool.inputSchema.properties as Record<string, any>).length})
						</div>
						{isParametersExpanded && (
							<div>
								<div style={{ height: "3px" }}></div>
								{Object.entries(tool.inputSchema.properties as Record<string, any>).map(([paramName, schema]) => {
									const isRequired =
										tool.inputSchema &&
										"required" in tool.inputSchema &&
										Array.isArray(tool.inputSchema.required) &&
										tool.inputSchema.required.includes(paramName)

									return (
										<div
											key={paramName}
											style={{
												display: "flex",
												alignItems: "baseline",
												marginTop: "4px",
												fontSize: "0.9em",
												opacity: 0.9,
											}}>
											<code
												style={{
													color: "var(--vscode-textPreformat-foreground)",
													marginRight: "8px",
												}}>
												{paramName}
												{isRequired && (
													<span
														style={{
															color: "var(--vscode-errorForeground)",
														}}>
														*
													</span>
												)}
											</code>
											<span
												style={{
													opacity: 0.8,
													overflowWrap: "break-word",
													wordBreak: "break-word",
												}}>
												{schema.description || "No description"}
											</span>
										</div>
									)
								})}
							</div>
						)}
					</div>
				)}
		</div>
	)
}

export default McpToolRow
