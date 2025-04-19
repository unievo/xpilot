import { useCallback, useState, useRef, useMemo } from "react"
import styled from "styled-components"
import { McpLibraryItem, McpServer } from "@shared/mcp"
import { vscode } from "@/utils/vscode"
import { useEvent } from "react-use"

interface McpLibraryCardProps {
	item: McpLibraryItem
	installedServers: McpServer[]
}

const McpLibraryCard = ({ item, installedServers }: McpLibraryCardProps) => {
	const isInstalled = installedServers.some((server) => server.name === item.mcpId)
	const [isDownloading, setIsDownloading] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const githubLinkRef = useRef<HTMLDivElement>(null)

	const handleMessage = useCallback((event: MessageEvent) => {
		const message = event.data
		switch (message.type) {
			case "mcpLibraryInstall":
				setIsDownloading(false)
				//const libraryItem = message.mcpInstallDetails;
				break
			case "relinquishControl":
				setIsLoading(false)
				break
		}
	}, [])

	useEvent("message", handleMessage)

	const githubAuthorUrl = useMemo(() => {
		const url = new URL(item.githubUrl)
		const pathParts = url.pathname.split("/")
		if (pathParts.length >= 2) {
			return `${url.origin}/${pathParts[1]}`
		}
		return item.githubUrl
	}, [item.githubUrl])

	return (
		<>
			<style>
				{`
					.mcp-card {
						cursor: pointer;
						outline: none !important;
					}
					.mcp-card:hover {
						background-color: var(--vscode-list-hoverBackground);
					}
					.mcp-card:focus {
						outline: none !important;
					}
				`}
			</style>
			<a
				href={item.githubUrl}
				className="mcp-card"
				style={{
					padding: "14px 16px",
					display: "flex",
					flexDirection: "column",
					gap: 12,
					cursor: isLoading ? "wait" : "pointer",
					textDecoration: "none",
					color: "inherit",
					border: "none !important",
				}}>
				{/* Main container with logo and content */}
				<div style={{ display: "flex", gap: "12px" }}>
					{/* Logo */}
					{item.logoUrl && (
						<img
							src={item.logoUrl}
							alt={`${item.name} logo`}
							style={{
								width: 42,
								height: 42,
								borderRadius: 4,
							}}
						/>
					)}

					{/* Content section */}
					<div
						style={{
							flex: 1,
							minWidth: 0,
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
						}}>
						{/* First row: name and install button */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								gap: "16px",
							}}>
							<h3
								style={{
									margin: 0,
									fontSize: "13px",
									fontWeight: 600,
								}}>
								{item.name}
							</h3>
							<div
								onClick={(e) => {
									e.preventDefault() // Prevent card click when clicking install
									e.stopPropagation() // Stop event from bubbling up to parent link
									if (!isInstalled && !isDownloading) {
										setIsDownloading(true)
										vscode.postMessage({
											type: "installLibraryMcp",
											mcpLibraryItem: item,
										})
									}
								}}
								style={{}}>
								<StyledInstallButton disabled={isInstalled || isDownloading} $isInstalled={isInstalled}>
									{isInstalled ? "Installed" : isDownloading ? "Installing..." : "Install"}
								</StyledInstallButton>
							</div>
						</div>

						{/* Second row: metadata */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								fontSize: "12px",
								color: "var(--vscode-descriptionForeground)",
								flexWrap: "wrap",
								minWidth: 0,
								rowGap: 0,
							}}>
							<a
								href={githubAuthorUrl}
								style={{
									display: "flex",
									alignItems: "center",
									color: "var(--vscode-foreground)",
									minWidth: 0,
									opacity: 0.7,
									textDecoration: "none",
									border: "none !important",
								}}
								className="github-link"
								onMouseEnter={(e) => {
									e.currentTarget.style.opacity = "1"
									e.currentTarget.style.color = "var(--link-active-foreground)"
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.opacity = "0.7"
									e.currentTarget.style.color = "var(--vscode-foreground)"
								}}>
								<div style={{ display: "flex", gap: "4px", alignItems: "center" }} ref={githubLinkRef}>
									<span className="codicon codicon-github" style={{ fontSize: "14px" }} />
									<span
										style={{
											overflow: "hidden",
											textOverflow: "ellipsis",
											wordBreak: "break-all",
											minWidth: 0,
										}}>
										{item.author}
									</span>
								</div>
							</a>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "4px",
									minWidth: 0,
									flexShrink: 0,
								}}></div>
							{item.requiresApiKey && (
								<span className="codicon codicon-key" title="Requires API key" style={{ flexShrink: 0 }} />
							)}
						</div>
					</div>
				</div>

				{/* Description and tags */}
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					<p style={{ fontSize: "13px", margin: 0 }}>{item.description}</p>
					<div
						style={{
							display: "flex",
							gap: "6px",
							flexWrap: "nowrap",
							overflowX: "auto",
							scrollbarWidth: "none",
							position: "relative",
						}}
						onScroll={(e) => {
							const target = e.currentTarget
							const gradient = target.querySelector(".tags-gradient") as HTMLElement
							if (gradient) {
								gradient.style.visibility = target.scrollLeft > 0 ? "hidden" : "visible"
							}
						}}>
						<span
							style={{
								fontSize: "10px",
								padding: "1px 4px",
								borderRadius: "3px",
								border: "1px solid color-mix(in srgb, var(--vscode-descriptionForeground) 50%, transparent)",
								color: "var(--vscode-descriptionForeground)",
								whiteSpace: "nowrap",
							}}>
							{item.category}
						</span>
						{item.tags.map((tag, index) => (
							<span
								key={tag}
								style={{
									fontSize: "10px",
									padding: "1px 4px",
									borderRadius: "3px",
									border: "1px solid color-mix(in srgb, var(--vscode-descriptionForeground) 50%, transparent)",
									color: "var(--vscode-descriptionForeground)",
									whiteSpace: "nowrap",
								}}>
								{tag}
							</span>
						))}
					</div>
				</div>
			</a>
		</>
	)
}

const StyledInstallButton = styled.button<{ $isInstalled: boolean }>`
	font-family: inherit;
	font-size: 11px;
	height: 20px;
	min-width: 60px;
	padding: 0 8px;
	border-radius: 2px;
	border: none;
	cursor: pointer;
	background: ${(props) =>
		props.$isInstalled ? "var(--vscode-button-secondaryBackground)" : "var(--vscode-button-background)"};
	color: var(--vscode-button-foreground);

	&:hover:not(:disabled) {
		background: ${(props) =>
			props.$isInstalled ? "var(--vscode-button-secondaryHoverBackground)" : "var(--vscode-button-hoverBackground)"};
	}

	&:active:not(:disabled) {
		background: ${(props) =>
			props.$isInstalled ? "var(--vscode-button-secondaryBackground)" : "var(--vscode-button-background)"};
		opacity: 0.7;
	}

	&:disabled {
		opacity: 0.5;
		cursor: default;
	}
`

export default McpLibraryCard
