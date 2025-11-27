import { DEFAULT_MCP_TIMEOUT_SECONDS, McpServer } from "@shared/mcp"
import { StringRequest } from "@shared/proto/cline/common"
import {
	McpServers,
	ToggleMcpServerRequest,
	ToggleToolAutoApproveRequest,
	UpdateMcpTimeoutRequest,
} from "@shared/proto/cline/mcp"
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
import {
	VSCodeButton,
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeOption,
	VSCodePanels,
	VSCodePanelTab,
	VSCodePanelView,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { useCallback, useState } from "react"
import DangerButton from "@/components/common/DangerButton"
import {
	chatInputSectionBorder,
	iconHighlightColor,
	menuRowBackground,
	menuRowDetailsBackground,
	menuRowDisabledBackground,
} from "@/components/config"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { McpServiceClient } from "@/services/grpc-client"
import { getMcpServerDisplayName } from "@/utils/mcp"
import McpResourceRow from "./McpResourceRow"
import McpToolRow from "./McpToolRow"

// constant JSX.Elements
const TimeoutOptions = [
	{ value: "30", label: "30 seconds" },
	{ value: "60", label: "1 minute" },
	{ value: "300", label: "5 minutes" },
	{ value: "600", label: "10 minutes" },
	{ value: "1800", label: "30 minutes" },
	{ value: "3600", label: "1 hour" },
].map((option) => (
	<VSCodeOption key={option.value} value={option.value}>
		{option.label}
	</VSCodeOption>
))

const ServerRow = ({
	server,
	isExpandable = true,
	hasTrashIcon = true,
}: {
	server: McpServer
	isExpandable?: boolean
	hasTrashIcon?: boolean
}) => {
	const { mcpMarketplaceCatalog, autoApprovalSettings, setMcpServers } = useExtensionState()

	const [isExpanded, setIsExpanded] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isRestarting, setIsRestarting] = useState(false)
	const [showConfirmDelete, setShowConfirmDelete] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")

	const getStatusColor = useCallback((status: McpServer["status"]) => {
		switch (status) {
			case "connected":
				return "var(--vscode-testing-iconPassed)"
			case "connecting":
				return "var(--vscode-charts-yellow)"
			case "disconnected":
				return "var(--vscode-testing-iconFailed)"
		}
	}, [])

	const handleRowClick = () => {
		if (!server.error && isExpandable) {
			setIsExpanded(!isExpanded)
		}
	}

	const [timeoutValue, setTimeoutValue] = useState<string>(() => {
		try {
			const config = JSON.parse(server.config)
			return config.timeout?.toString() || DEFAULT_MCP_TIMEOUT_SECONDS.toString()
		} catch {
			return DEFAULT_MCP_TIMEOUT_SECONDS.toString()
		}
	})

	const handleTimeoutChange = (e: any) => {
		const select = e.target as HTMLSelectElement
		const value = select.value
		const num = parseInt(value, 10)
		setTimeoutValue(value)

		McpServiceClient.updateMcpTimeout({
			serverName: server.name,
			timeout: num,
		} as UpdateMcpTimeoutRequest)
			.then((response: McpServers) => {
				const mcpServers = convertProtoMcpServersToMcpServers(response.mcpServers)
				setMcpServers(mcpServers)
			})
			.catch((error) => {
				console.error("Error updating MCP server timeout", error)
			})
	}

	const handleRestart = () => {
		// Set local state to show "connecting" status
		setIsRestarting(true)

		// Make the gRPC call
		McpServiceClient.restartMcpServer({
			value: server.name,
		} as StringRequest)
			.then((response: McpServers) => {
				// Update with the final state from the server
				const mcpServers = convertProtoMcpServersToMcpServers(response.mcpServers)
				setMcpServers(mcpServers)
				setIsRestarting(false)
			})
			.catch((error) => {
				// Reset the restarting state
				setIsRestarting(false)
				console.error("Error restarting MCP server", error)
			})
	}

	const handleDelete = () => {
		setShowConfirmDelete(true)
	}

	const handleConfirmDelete = () => {
		setIsDeleting(true)
		setShowConfirmDelete(false)
		McpServiceClient.deleteMcpServer({
			value: server.name,
		} as StringRequest)
			.then((response: McpServers) => {
				const mcpServers = convertProtoMcpServersToMcpServers(response.mcpServers)
				setMcpServers(mcpServers)
				setIsDeleting(false)
			})
			.catch((error) => {
				console.error("Error deleting MCP server", error)
				setIsDeleting(false)
			})
	}

	const handleCancelDelete = () => {
		setShowConfirmDelete(false)
	}

	const handleAutoApproveChange = () => {
		if (!server.name) {
			return
		}

		McpServiceClient.toggleToolAutoApprove(
			ToggleToolAutoApproveRequest.create({
				serverName: server.name,
				toolNames: server.tools?.map((tool) => tool.name) || [],
				autoApprove: !server.tools?.every((tool) => tool.autoApprove),
			}),
		)
			.then((response) => {
				const mcpServers = convertProtoMcpServersToMcpServers(response.mcpServers)
				setMcpServers(mcpServers)
			})
			.catch((error) => {
				console.error("Error toggling all tools auto-approve", error)
			})
	}

	const handleToggleMcpServer = () => {
		McpServiceClient.toggleMcpServer(
			ToggleMcpServerRequest.create({
				serverName: server.name,
				disabled: !server.disabled,
			}),
		)
			.then((response) => {
				const mcpServers = convertProtoMcpServersToMcpServers(response.mcpServers)
				setMcpServers(mcpServers)
			})
			.catch((error) => {
				console.error("Error toggling MCP server", error)
			})
	}

	// Filter tools and resources based on search query
	const filteredTools =
		server.tools?.filter(
			(tool) =>
				tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				tool.description?.toLowerCase().includes(searchQuery.toLowerCase()),
		) || []

	const filteredResources = [...(server.resourceTemplates || []), ...(server.resources || [])].filter((item) => {
		const name = "uriTemplate" in item ? item.name || item.uriTemplate : item.name || item.uri
		const description = item.description || ""
		return (
			name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			description.toLowerCase().includes(searchQuery.toLowerCase())
		)
	})

	return (
		<div>
			<div
				onClick={handleRowClick}
				style={{
					display: "flex",
					alignItems: "center",
					paddingLeft: !server.error ? "0px" : "15px",
					paddingRight: "8px",
					minHeight: "22px",
					background: server.disabled ? menuRowDisabledBackground : menuRowBackground,
					cursor: server.error ? "default" : isExpandable ? "pointer" : "default",
					borderRadius: isExpanded || server.error ? "4px 4px 0 0" : "4px",
					opacity: server.disabled ? 0.7 : 1,
				}}>
				{!server.error && isExpandable && (
					<span
						className={`codicon codicon-chevron-${isExpanded ? "down" : "right"}`}
						style={{ marginLeft: "2px", fontSize: "inherit" }}
					/>
				)}
				<span
					style={{
						flex: 1,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						display: "flex",
						alignItems: "center",
						marginRight: "4px",
						marginLeft: "0px",
						padding: "1px ",
					}}>
					<span
						className="codicon codicon-server"
						style={{
							color: iconHighlightColor,
							marginRight: "5px",
							verticalAlign: "middle",
							fontSize: "inherit",
						}}
					/>
					{getMcpServerDisplayName(server.name, mcpMarketplaceCatalog)}
				</span>
				{/* Collapsed view controls */}
				{/* {!server.error && (
					<div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "8px" }}>
						<VSCodeButton
							appearance="icon"
							disabled={server.status === "connecting" || isRestarting}
							onClick={(e) => {
								e.stopPropagation()
								handleRestart()
							}}
							title="Restart Server">
							<span className="codicon codicon-sync"></span>
						</VSCodeButton>
						{hasTrashIcon && (
							<VSCodeButton
								appearance="icon"
								disabled={isDeleting}
								onClick={(e) => {
									e.stopPropagation()
									handleDelete()
								}}
								title="Delete Server">
								<span className="codicon codicon-trash"></span>
							</VSCodeButton>
						)}
					</div>
				)} */}
				{/* Toggle Switch */}
				<div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", marginLeft: "3px" }}>
					<div
						aria-checked={!server.disabled}
						onClick={() => {
							handleToggleMcpServer()
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault()
								handleToggleMcpServer()
							}
						}}
						role="switch"
						style={{
							width: "20px",
							height: "10px",
							backgroundColor: server.disabled
								? "var(--vscode-titleBar-inactiveForeground)"
								: "var(--vscode-testing-iconPassed)",
							borderRadius: "5px",
							position: "relative",
							cursor: "pointer",
							transition: "background-color 0.2s",
							opacity: server.disabled ? 0.5 : 0.9,
						}}
						tabIndex={0}>
						<div
							style={{
								width: "8px",
								height: "8px",
								backgroundColor: "white",
								border: "1px solid color-mix(in srgb, #666666 65%, transparent)",
								borderRadius: "50%",
								position: "absolute",
								top: "0.5px",
								left: server.disabled ? "1px" : "10px",
								transition: "left 0.2s",
							}}
						/>
					</div>
				</div>
				{
					<div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "3px", marginRight: "-4px" }}>
						<VSCodeButton
							appearance="icon"
							disabled={server.status === "connecting" || isRestarting}
							onClick={(e) => {
								e.stopPropagation()
								handleRestart()
							}}
							title="Restart Server">
							<span className="codicon codicon-sync" style={{ fontSize: "inherit", marginBottom: "-4px" }}></span>
						</VSCodeButton>
					</div>
				}
				<div
					style={{
						width: "8px",
						height: "8px",
						borderRadius: "50%",
						background: getStatusColor(server.status),
						marginLeft: "7px",
						marginRight: "-2px",
					}}
				/>
				{hasTrashIcon && (
					<div style={{ marginLeft: "3px", marginRight: "-6px" }}>
						{!showConfirmDelete ? (
							<VSCodeButton
								appearance="icon"
								disabled={isDeleting}
								onClick={(e) => {
									e.stopPropagation()
									handleDelete()
								}}
								title="Delete Server">
								<span
									className="codicon codicon-trash"
									style={{ fontSize: "inherit", marginBottom: "-1px" }}></span>
							</VSCodeButton>
						) : (
							<div style={{ display: "flex", gap: "2px", marginRight: "3px", padding: 2, overflow: "hidden" }}>
								<VSCodeButton
									appearance="secondary"
									aria-label="Confirm delete"
									onClick={(e) => {
										e.stopPropagation()
										handleConfirmDelete()
									}}
									style={{ width: "25px", height: "20px" }}
									title="Confirm delete">
									✓
								</VSCodeButton>
								<VSCodeButton
									appearance="secondary"
									aria-label="Cancel delete"
									onClick={(e) => {
										e.stopPropagation()
										handleCancelDelete()
									}}
									style={{ width: "25px", height: "20px" }}
									title="Cancel delete">
									✗
								</VSCodeButton>
							</div>
						)}
					</div>
				)}
			</div>

			{server.error ? (
				<div
					style={{
						fontSize: "11px",
						background: "var(--vscode-textCodeBlock-background)",
						borderRadius: "0 0 4px 4px",
						width: "100%",
					}}>
					<div
						style={{
							color: "var(--vscode-testing-iconFailed)",
							marginBottom: "0px",
							padding: "10px",
							overflowWrap: "break-word",
							wordBreak: "break-word",
						}}>
						{server.error}
					</div>
					<div style={{ display: "flex" }}>
						{server.oauthRequired && server.oauthAuthStatus === "unauthenticated" ? (
							<VSCodeButton
								appearance="primary"
								onClick={(e) => {
									e.stopPropagation()
									McpServiceClient.authenticateMcpServer(StringRequest.create({ value: server.name }))
								}}
								style={{
									width: "calc(100% - 20px)",
									margin: "0 10px 10px 10px",
								}}>
								Authenticate
							</VSCodeButton>
						) : (
							<VSCodeButton
								appearance="secondary"
								disabled={server.status === "connecting"}
								onClick={handleRestart}
								style={{
									width: "calc(100% - 20px)",
									margin: "0 10px 10px 10px",
									scale: "0.9",
								}}>
								{server.status === "connecting" || isRestarting ? "Retrying..." : "Retry Connection"}
							</VSCodeButton>
						)}

						{!showConfirmDelete ? (
							<DangerButton
								disabled={isDeleting}
								onClick={() => {
									setShowConfirmDelete(true)
								}}
								style={{ width: "calc(100% - 20px)", margin: "0 10px 10px 10px", scale: "0.9" }}>
								{isDeleting ? "Deleting..." : "Delete Server"}
							</DangerButton>
						) : (
							<div style={{ display: "flex", gap: "5px", width: "calc(100% - 20px)", margin: "0 10px 10px 10px" }}>
								<VSCodeButton
									appearance="secondary"
									onClick={handleConfirmDelete}
									style={{ flex: 1, scale: "0.9" }}>
									✓ Confirm
								</VSCodeButton>
								<VSCodeButton
									appearance="secondary"
									onClick={handleCancelDelete}
									style={{ flex: 1, scale: "0.9" }}>
									✗ Cancel
								</VSCodeButton>
							</div>
						)}
					</div>
				</div>
			) : (
				isExpanded && (
					<div
						style={{
							background: menuRowDetailsBackground,
							padding: "1px 5px 5px 5px",
							borderRadius: "0 0 4px 4px",
							border: chatInputSectionBorder,
							borderTop: "none",
						}}>
						<div style={{ margin: "7px 5px 0", display: "flex", gap: "15px", alignItems: "end" }}>
							<div style={{ flex: 1 }}>
								<label
									style={{
										display: "block",
										marginBottom: "8px",
										fontSize: "0.95em",
										fontWeight: "bold",
										color: "var(--vscode-foreground)",
									}}>
									Search
								</label>
								<VSCodeTextField
									onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
									placeholder="Name or details"
									style={{ width: "100%", height: "26px", fontSize: "inherit" }}
									value={searchQuery}>
									<div
										className="codicon codicon-search"
										slot="start"
										style={{
											fontSize: "inherit",
											opacity: 0.8,
										}}
									/>
									{searchQuery && (
										<div
											aria-label="Clear search"
											className="codicon codicon-close"
											onClick={() => setSearchQuery("")}
											slot="end"
											style={{
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
												cursor: "pointer",
												opacity: 0.8,
												padding: "2px",
											}}
										/>
									)}
								</VSCodeTextField>
							</div>
							<div style={{ minWidth: "100px", maxWidth: "100px" }}>
								<label
									style={{
										display: "block",
										marginBottom: "8px",
										fontSize: "0.95em",
										fontWeight: "bold",
										color: "var(--vscode-foreground)",
									}}>
									Timeout
								</label>
								<VSCodeDropdown
									onChange={handleTimeoutChange}
									style={{ width: "100%", height: "26px" }}
									value={timeoutValue}>
									{TimeoutOptions}
								</VSCodeDropdown>
							</div>
						</div>

						<VSCodePanels style={{ fontSize: "inherit" }}>
							<VSCodePanelTab id="tools" style={{ fontSize: "inherit" }}>
								<span
									className="codicon codicon-tools"
									style={{ color: iconHighlightColor, marginRight: "6px" }}
								/>
								Tools ({searchQuery ? filteredTools.length : server.tools?.length || 0})
							</VSCodePanelTab>
							<VSCodePanelTab id="resources" style={{ fontSize: "inherit" }}>
								<span
									className={`codicon codicon-symbol-file`}
									style={{ color: iconHighlightColor, marginRight: "6px" }}
								/>
								Resources (
								{searchQuery
									? filteredResources.length
									: [...(server.resourceTemplates || []), ...(server.resources || [])].length || 0}
								)
							</VSCodePanelTab>

							<VSCodePanelView id="tools-view" style={{ fontSize: "inherit" }}>
								{filteredTools.length > 0 ? (
									<div
										style={{
											fontSize: "inherit",
											display: "flex",
											flexDirection: "column",
											gap: "8px",
											width: "100%",
											paddingTop: "8px",
										}}>
										{server.name &&
											autoApprovalSettings.enabled &&
											autoApprovalSettings.actions.useMcp &&
											!searchQuery && (
												<VSCodeCheckbox
													checked={server.tools?.every((tool) => tool.autoApprove) || false}
													data-tool="all-tools"
													onChange={handleAutoApproveChange}
													style={{ fontSize: "0.95em", opacity: 0.7, marginBottom: 0 }}>
													Auto-approve all
												</VSCodeCheckbox>
											)}
										{filteredTools.map((tool) => (
											<McpToolRow key={tool.name} serverName={server.name} tool={tool} />
										))}
									</div>
								) : (
									<div
										style={{
											padding: "10px 0",
											color: "var(--vscode-descriptionForeground)",
										}}>
										{searchQuery ? "No tools match your search" : "No tools found"}
									</div>
								)}
							</VSCodePanelView>

							<VSCodePanelView id="resources-view" style={{ fontSize: "inherit" }}>
								{filteredResources.length > 0 ? (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: "8px",
											width: "100%",
											paddingTop: "8px",
										}}>
										{filteredResources.map((item) => (
											<McpResourceRow
												item={item}
												key={"uriTemplate" in item ? item.uriTemplate : item.uri}
											/>
										))}
									</div>
								) : (
									<div
										style={{
											padding: "10px 0",
											color: "var(--vscode-descriptionForeground)",
										}}>
										{searchQuery ? "No resources match your search" : "No resources found"}
									</div>
								)}
							</VSCodePanelView>
						</VSCodePanels>

						{/* <span style={{ display: "flex" }}>
							<VSCodeButton
								appearance="icon"
								onClick={handleRestart}
								disabled={server.status === "connecting" || isRestarting}
								style={{
									scale: "0.9",
									background: "var(--vscode-button-secondaryBackground)",
									width: "calc(100% - 14px)",
									//margin: "0 7px 3px 7px",
								}}>
								{server.status === "connecting" || isRestarting ? "Restarting..." : "Restart Server"}
							</VSCodeButton>

							{!showConfirmDelete ? (
								<DangerButton
									style={{ scale: "0.9", width: "calc(100% - 14px)" }}
									disabled={isDeleting}
									onClick={() => {
										setShowConfirmDelete(true)
									}}>
									{isDeleting ? "Deleting..." : "Delete Server"}
								</DangerButton>
							) : (
								<div style={{ display: "flex", gap: "4px", width: "calc(100% - 14px)", scale: "0.9" }}>
									<VSCodeButton
										appearance="secondary"
										onClick={handleConfirmDelete}
										style={{ flex: 1 }}>
										✓ Confirm
									</VSCodeButton>
									<VSCodeButton
										appearance="secondary"
										onClick={handleCancelDelete}
										style={{ flex: 1 }}>
										✗ Cancel
									</VSCodeButton>
								</div>
							)}
						</span> */}
					</div>
				)
			)}
		</div>
	)
}

export default ServerRow
