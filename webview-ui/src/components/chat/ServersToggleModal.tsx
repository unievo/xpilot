import React, { useRef, useState, useEffect } from "react"
import { useClickAway, useWindowSize } from "react-use"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import ServersToggleList from "@/components/mcp/configuration/tabs/installed/ServersToggleList"

import { McpServiceClient } from "@/services/grpc-client"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import Tooltip from "@/components/common/Tooltip"
import { McpServers } from "@shared/proto/mcp"
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
import { EmptyRequest } from "@shared/proto/common"
import { itemIconColor, menuBackground } from "../theme"
import HeroTooltip from "../common/HeroTooltip"
import { mcpLibraryEnabled } from "@shared/Configuration"

const ServersToggleModal: React.FC = () => {
	const { mcpServers, mcpMarketplaceEnabled, navigateToMcp, setMcpServers } = useExtensionState()
	const [isVisible, setIsVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)
	const modalRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)

	// Close modal when clicking outside
	useClickAway(modalRef, () => {
		setIsVisible(false)
	})

	// Calculate positions for modal and arrow
	useEffect(() => {
		if (isVisible && buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			const buttonCenter = buttonRect.left + buttonRect.width / 2
			const rightPosition = document.documentElement.clientWidth - buttonCenter - 4

			setArrowPosition(rightPosition)
			setMenuPosition(buttonRect.top + 1)
		}
	}, [isVisible, viewportWidth, viewportHeight])

	useEffect(() => {
		if (isVisible) {
			McpServiceClient.getLatestMcpServers(EmptyRequest.create({}))
				.then((response: McpServers) => {
					if (response.mcpServers) {
						const mcpServers = convertProtoMcpServersToMcpServers(response.mcpServers)
						setMcpServers(mcpServers)
					}
				})
				.catch((error) => {
					console.error("Failed to fetch MCP servers:", error)
				})
		}
	}, [isVisible])

	return (
		<div ref={modalRef}>
			<div ref={buttonRef} className="opacity-70 inline-flex min-w-0 max-w-full">
				<HeroTooltip delay={1000} content="Enable / Disable, or see MCP Server information">
					<VSCodeButton
						appearance="icon"
						aria-label="Enable / Disable, or see MCP Server information"
						onClick={() => setIsVisible(!isVisible)}
						style={{ marginLeft: "-2px", height: "20px" }}>
						<div className="flex items-center gap-1 text-xs whitespace-nowrap min-w-0 w-full">
							<span
								className="codicon codicon-server flex items-center"
								style={{ fontSize: "15px", marginBottom: 1 }}
							/>
						</div>
					</VSCodeButton>
				</HeroTooltip>
			</div>

			{isVisible && (
				<div
					className="fixed left-[15px] right-[15px] border border-[var(--vscode-editorGroup-border)] p-2 rounded-md z-[1000] overflow-y-auto"
					style={{
						bottom: `calc(100vh - ${menuPosition}px + 6px)`,
						background: menuBackground,
						maxHeight: "calc(100vh - 70px)",
						overscrollBehavior: "contain",
					}}>
					<div
						className="fixed w-[10px] h-[10px] z-[-1] rotate-45 border-r border-b border-[var(--vscode-editorGroup-border)]"
						style={{
							bottom: `calc(100vh - ${menuPosition}px)`,
							right: arrowPosition,
							background: menuBackground,
						}}
					/>

					<div className="flex justify-between items-center mb-2.5">
						<div className="flex items-center gap-1">
							<div className="ml-0.5 text-[13px] font-semibold">MCP Servers</div>
							<VSCodeButton
								appearance="icon"
								onClick={() => {
									setIsVisible(false)
									navigateToMcp("installed")
								}}>
								<span className="codicon codicon-gear text-[10px]" style={{ color: itemIconColor }}></span>
							</VSCodeButton>
						</div>
						<div
							onMouseDown={() => setIsVisible(false)}
							className="cursor-pointer p-1.5 z-[9999] pointer-events-auto">
							<span className="codicon codicon-close" />
						</div>
					</div>
					{/* <div>
						<p
							style={{
								fontSize: "12px",
								marginLeft: 2,
								marginTop: -10,
								color: "var(--vscode-descriptionForeground)",
							}}>
							Enable or disable servers.
						</p>
					</div> */}
					<div style={{ marginBottom: 10, fontSize: "12px" }}>
						<ServersToggleList servers={mcpServers} isExpandable={true} hasTrashIcon={false} listGap="small" />
					</div>
					{mcpServers.length == 0 && (
						<div
							style={{
								fontSize: "12px",
								marginBottom: "10px",
								textAlign: "center",
								color: "var(--vscode-descriptionForeground)",
							}}>
							You can edit the{" "}
							<VSCodeLink
								style={{ fontSize: "12px" }}
								onClick={() => {
									setIsVisible(false)
									navigateToMcp("installed")
								}}>
								MCP configuration
							</VSCodeLink>
							{(mcpLibraryEnabled || mcpMarketplaceEnabled) && (
								<span>
									<span>, or install servers from the </span>
									{mcpLibraryEnabled && (
										<span>
											<VSCodeLink
												style={{ fontSize: "12px" }}
												onClick={() => {
													setIsVisible(false)
													navigateToMcp("library")
												}}>
												Library
											</VSCodeLink>
										</span>
									)}
									{mcpMarketplaceEnabled && (
										<span>
											{mcpLibraryEnabled && <span> or the </span>}
											<VSCodeLink
												style={{ fontSize: "12px" }}
												onClick={() => {
													setIsVisible(false)
													navigateToMcp("marketplace")
												}}>
												Marketplace
											</VSCodeLink>
										</span>
									)}
								</span>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default ServersToggleModal
