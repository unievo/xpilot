import { mcpLibraryEnabled } from "@shared/Configuration"
import { McpViewTab } from "@shared/mcp"
import { EmptyRequest } from "@shared/proto/cline/common"
import { McpServers } from "@shared/proto/cline/mcp"
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { McpServiceClient } from "@/services/grpc-client"
import ConfigureServersView from "./tabs/installed/ConfigureServersView"
import McpLibraryView from "./tabs/library/McpLibraryView"
import McpMarketplaceView from "./tabs/marketplace/McpMarketplaceView"

type McpViewProps = {
	onDone: () => void
	initialTab?: McpViewTab
}

// Add a local type to allow "install" as a tab
type LocalMcpViewTab = McpViewTab | "install"

const McpConfigurationView = ({ onDone, initialTab }: McpViewProps) => {
	const { mcpMarketplaceEnabled, setMcpServers, setMcpTab, environment } = useExtensionState()
	const [activeTab, setActiveTab] = useState<LocalMcpViewTab>(initialTab || "configure")
	const [installSubTab, setInstallSubTab] = useState<McpViewTab>("library")

	const handleTabChange = (tab: LocalMcpViewTab) => {
		if (tab === "install") {
			setActiveTab("install")
			const firstSubTab = mcpLibraryEnabled ? "library" : "marketplace"
			setInstallSubTab(firstSubTab)
			setMcpTab(firstSubTab)
		} else {
			setActiveTab(tab)
			setMcpTab(tab) // Update the context state so navigation links work correctly
		}
	}

	const handleInstallSubTabChange = (tab: McpViewTab) => {
		setInstallSubTab(tab)
		setMcpTab(tab)
	}

	// Update activeTab when initialTab changes
	useEffect(() => {
		if (initialTab) {
			setActiveTab(initialTab === "library" || initialTab === "marketplace" ? "install" : initialTab)
			if (initialTab === "library" || initialTab === "marketplace") {
				setInstallSubTab(initialTab)
			}
		}
	}, [initialTab])

	useEffect(() => {
		if (!mcpMarketplaceEnabled && installSubTab === "marketplace") {
			setInstallSubTab("library")
		}
	}, [mcpMarketplaceEnabled, installSubTab])

	// Get setter for MCP marketplace catalog from context
	const { setMcpMarketplaceCatalog } = useExtensionState()

	useEffect(() => {
		if (mcpMarketplaceEnabled) {
			McpServiceClient.refreshMcpMarketplace(EmptyRequest.create({}))
				.then((response) => {
					setMcpMarketplaceCatalog(response)
				})
				.catch((error) => {
					console.error("Error refreshing MCP marketplace:", error)
				})

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
	}, [mcpMarketplaceEnabled])

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "column",
			}}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "10px 17px 5px 20px",
				}}>
				<h3 style={{ color: "var(--vscode-foreground)", margin: 0 }}>MCP Servers</h3>
				<VSCodeButton onClick={onDone} style={{ height: "20px" }}>
					Done
				</VSCodeButton>
			</div>

			<div style={{ flex: 1, overflow: "auto" }}>
				{/* Tabs container */}
				<div
					style={{
						display: "flex",
						gap: "1px",
						padding: "0 20px 0 20px",
						borderBottom: "1px solid var(--vscode-panel-border)",
					}}>
					<TabButton
						isActive={activeTab === "configure"}
						onClick={() => handleTabChange("configure")}
						style={{ flex: 1 }}>
						<b>Configure</b>
					</TabButton>
					{(mcpLibraryEnabled || mcpMarketplaceEnabled) && (
						<TabButton
							isActive={activeTab === "install"}
							onClick={() => handleTabChange("install")}
							style={{ flex: 1 }}>
							<b>Install</b>
						</TabButton>
					)}
				</div>

				{/* Sub-tabs for Install */}
				{activeTab === "install" && (mcpLibraryEnabled || mcpMarketplaceEnabled) && (
					<div
						style={{
							display: "flex",
							gap: "1px",
							padding: "0 20px",
							borderBottom: "1px solid var(--vscode-panel-border)",
							background: "var(--vscode-editor-background)",
						}}>
						{mcpLibraryEnabled && (
							<TabButton
								isActive={installSubTab === "library"}
								onClick={() => handleInstallSubTabChange("library")}
								style={{ flex: 1 }}>
								Library
							</TabButton>
						)}
						{mcpMarketplaceEnabled && (
							<TabButton
								isActive={installSubTab === "marketplace"}
								onClick={() => handleInstallSubTabChange("marketplace")}
								style={{ flex: 1 }}>
								Marketplace
							</TabButton>
						)}
					</div>
				)}

				{/* Content container */}
				<div style={{ width: "100%" }}>
					{activeTab === "install" && installSubTab === "library" && mcpLibraryEnabled && <McpLibraryView />}
					{activeTab === "install" && installSubTab === "marketplace" && mcpMarketplaceEnabled && (
						<McpMarketplaceView />
					)}
					{activeTab === "configure" && <ConfigureServersView />}
				</div>
			</div>
		</div>
	)
}

const StyledTabButton = styled.button.withConfig({
	shouldForwardProp: (prop) => !["isActive"].includes(prop),
})<{ isActive: boolean; disabled?: boolean }>`
	background: none;
	border: none;
	border-bottom: 2px solid ${(props) => (props.isActive ? "var(--vscode-foreground)" : "transparent")};
	color: ${(props) => (props.isActive ? "var(--vscode-foreground)" : "var(--vscode-descriptionForeground)")};
	padding: 8px 16px;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	font-size: 13px;
	margin-bottom: -1px;
	font-family: inherit;
	opacity: ${(props) => (props.disabled ? 0.6 : 1)};
	pointer-events: ${(props) => (props.disabled ? "none" : "auto")};

	&:hover {
		color: ${(props) => (props.disabled ? "var(--vscode-descriptionForeground)" : "var(--vscode-foreground)")};
	}
`

export const TabButton = ({
	children,
	isActive,
	onClick,
	disabled,
	style,
}: {
	children: React.ReactNode
	isActive: boolean
	onClick: () => void
	disabled?: boolean
	style?: React.CSSProperties
}) => (
	<StyledTabButton disabled={disabled} isActive={isActive} onClick={onClick} style={style}>
		{children}
	</StyledTabButton>
)

export default McpConfigurationView
