import { McpTool } from "@shared/mcp"
import { ToggleToolAutoApproveRequest } from "@shared/proto/cline/mcp"
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import HeroTooltip from "@/components/common/HeroTooltip"
import { iconHighlightColor, mcpSectionsPadding } from "@/components/config"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { McpServiceClient } from "@/services/grpc-client"

type McpToolRowProps = {
	tool: McpTool
	serverName?: string
	collapseDescription?: boolean
}

const McpToolRow = ({ tool, serverName, collapseDescription }: McpToolRowProps) => {
	const { autoApprovalSettings } = useExtensionState()
	const { setMcpServers } = useExtensionState()
	const [isParametersExpanded, setIsParametersExpanded] = useState(false)
	const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(collapseDescription ?? false)

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
				padding: mcpSectionsPadding,
			}}>
			<div
				data-testid="tool-row-container"
				onClick={(e) => {
					e.stopPropagation()
				}}
				style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<div
					onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
					style={{ display: "flex", alignItems: "center", gap: "3px", cursor: "pointer", userSelect: "none", flex: 1 }}>
					<span className="codicon codicon-tools" style={{ color: iconHighlightColor }}></span>
					<span
						className={`codicon ${isDescriptionCollapsed ? "codicon-chevron-right" : "codicon-chevron-down"}`}
						style={{ fontSize: "inherit" }}
					/>
					<span style={{ width: "100%", fontWeight: "500" }}>{tool.name}</span>
				</div>
				{serverName && autoApprovalSettings.enabled && autoApprovalSettings.actions.useMcp && (
					<div onClick={(e) => e.stopPropagation()}>
						<HeroTooltip content="Auto-approve this tool">
							<VSCodeCheckbox
								checked={tool.autoApprove ?? false}
								data-tool={tool.name}
								onChange={handleAutoApproveChange}
								style={{
									opacity: 0.7,
									scale: "0.8",
									justifyContent: "flex-end",
									display: "flex",
									marginTop: -1,
									marginBottom: -1,
									marginRight: -10,
								}}>
								Auto
							</VSCodeCheckbox>
						</HeroTooltip>
					</div>
				)}
			</div>
			{!isDescriptionCollapsed && tool.description && (
				<div
					style={{
						margin: "6px 8px 0 6px",
						opacity: 0.8,
						fontSize: "0.9em",
						display: "-webkit-box",
						WebkitLineClamp: 10,
						WebkitBoxOrient: "vertical",
						overflow: "auto",
					}}>
					{tool.description}
				</div>
			)}
			{tool.inputSchema &&
				"properties" in tool.inputSchema &&
				Object.keys(tool.inputSchema.properties as Record<string, any>).length > 0 && (
					<div
						style={{
							marginTop: "7px",
							border: "0.5px solid color-mix(in srgb, var(--vscode-descriptionForeground) 30%, transparent)",
							borderRadius: "6px",
							padding: "3px",
						}}>
						<div
							onClick={() => setIsParametersExpanded(!isParametersExpanded)}
							style={{
								marginTop: "0px",
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
								style={{ fontSize: "inherit", marginRight: "4px" }}
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
