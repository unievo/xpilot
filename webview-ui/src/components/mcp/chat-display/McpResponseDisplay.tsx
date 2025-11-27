import { McpDisplayMode } from "@shared/McpDisplayMode"
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react"
import React, { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import ChatErrorBoundary from "@/components/chat/ChatErrorBoundary"
import { MarkdownContainer } from "@/components/chat/ChatRowStyles"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import MarkdownBlock from "@/components/common/MarkdownBlock"
import {
	codeBlockFontSize,
	defaultBorderRadius,
	errorColor,
	mcpSectionsPadding,
	rowItemExpandedMaxHeight,
	secondaryColor,
	toolBackground,
} from "@/components/config"
import { DropdownContainer } from "@/components/settings/ApiOptions"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"
import { useExtensionState } from "../../../context/ExtensionStateContext"
import ImagePreview from "./ImagePreview"
import LinkPreview from "./LinkPreview"
import McpDisplayModeDropdown from "./McpDisplayModeDropdown"
import { buildDisplaySegments, DisplaySegment, processResponseUrls, UrlMatch } from "./utils/mcpRichUtil"

// Maximum number of URLs to process in total, per response
export const MAX_URLS = 50

const ResponseHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1px 0px;
	//color: var(--vscode-descriptionForeground);
	cursor: pointer;
	user-select: none;
	//border-bottom: 1px dashed var(--vscode-editorGroup-border);
	// margin-bottom: 8px;

	.header-title {
		display: flex;
		align-items: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-right: 8px;
	}

	.header-icon {
		margin-right: 5px;
	}
`

const ResponseContainer = styled.div`
	position: relative;
	padding: ${mcpSectionsPadding}px;
	// font-family: var(--vscode-editor-font-family, monospace);
	// font-size: var(--vscode-editor-font-size, 12px);
	// background-color: ${toolBackground};
	color: var(--vscode-editor-foreground, #d4d4d4);
	border-radius: 0 0 ${defaultBorderRadius}px ${defaultBorderRadius}px;
	overflow: hidden;
	z-index: 0;


	.response-content {
		overflow-x: auto;
		overflow-y: auto;
		max-width: 100%;
		max-height: ${rowItemExpandedMaxHeight}px;
		padding: 8px;
		// margin: 4px 0px 0px 0px;
		background-color: ${CODE_BLOCK_BG_COLOR};
		border-radius: ${defaultBorderRadius}px;
		font-size: ${codeBlockFontSize}px;
	}
`

// Style for URL text to ensure proper wrapping
const UrlText = styled.div<{ fontSize: number }>`
	white-space: pre-wrap;
	word-break: break-all;
	overflow-wrap: break-word;
	font-family: var(--vscode-editor-font-family, monospace);
	font-size: ${({ fontSize }) => `${fontSize}px`};
`

interface McpResponseDisplayProps {
	responseText: string
	fontSize?: number
}

const McpResponseDisplay: React.FC<McpResponseDisplayProps> = ({ responseText, fontSize = codeBlockFontSize }) => {
	const { mcpResponsesCollapsed, mcpDisplayMode } = useExtensionState() // Get setting from context
	const [isExpanded, setIsExpanded] = useState(!mcpResponsesCollapsed) // Initialize with context setting
	const [isLoading, setIsLoading] = useState(false) // Initial loading state for rich content

	const [urlMatches, setUrlMatches] = useState<UrlMatch[]>([])
	const [error, setError] = useState<string | null>(null)

	const handleDisplayModeChange = useCallback((newMode: McpDisplayMode) => {
		updateSetting("mcpDisplayMode", newMode)
	}, [])

	const toggleExpand = useCallback(() => {
		setIsExpanded((prev) => !prev)
	}, [])

	// Effect to update isExpanded if mcpResponsesCollapsed changes from context
	useEffect(() => {
		setIsExpanded(!mcpResponsesCollapsed)
	}, [mcpResponsesCollapsed])

	// Find all URLs in the text and determine if they're images
	useEffect(() => {
		// Skip all processing if in plain mode or markdown mode
		if (!isExpanded || mcpDisplayMode === "plain" || mcpDisplayMode === "markdown") {
			setIsLoading(false)
			if (urlMatches.length > 0) {
				setUrlMatches([]) // Clear any existing matches when not in rich mode
			}
			return
		}

		console.log("Processing MCP response for URL extraction")
		setIsLoading(true)
		setError(null)

		// Use the orchestrator function from mcpRichUtil
		const cleanup = processResponseUrls(
			responseText || "",
			MAX_URLS,
			(matches) => {
				setUrlMatches(matches)
				setIsLoading(false)
			},
			(updatedMatches) => {
				setUrlMatches(updatedMatches)
			},
			(errorMessage) => {
				setError(errorMessage)
				setIsLoading(false)
			},
		)

		return cleanup
	}, [responseText, mcpDisplayMode, isExpanded])

	// Helper function to render a display segment
	const renderSegment = (segment: DisplaySegment): JSX.Element => {
		switch (segment.type) {
			case "text":
			case "url":
				return (
					<UrlText fontSize={fontSize} key={segment.key}>
						{segment.content}
					</UrlText>
				)

			case "image":
				return (
					<div key={segment.key}>
						<ImagePreview url={segment.url!} />
					</div>
				)

			case "link":
				return (
					<div key={segment.key} style={{ margin: "10px 0" }}>
						<LinkPreview url={segment.url!} />
					</div>
				)

			case "error":
				return (
					<div
						key={segment.key}
						style={{
							margin: "10px 0",
							padding: "8px",
							color: "var(--vscode-errorForeground)",
							border: "1px solid var(--vscode-editorError-foreground)",
							borderRadius: "4px",
							height: "128px",
							overflow: "auto",
						}}>
						{segment.content}
					</div>
				)

			default:
				return <React.Fragment key={segment.key} />
		}
	}

	// Function to render content based on display mode
	const renderContent = () => {
		if (!isExpanded) {
			return null
		}

		if (isLoading && mcpDisplayMode === "rich") {
			return (
				<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50px" }}>
					<VSCodeProgressRing />
				</div>
			)
		}

		if (mcpDisplayMode === "plain") {
			return <UrlText fontSize={fontSize}>{responseText}</UrlText>
		}

		if (mcpDisplayMode === "markdown") {
			return (
				<MarkdownContainer>
					<MarkdownBlock fontSize={fontSize} markdown={responseText} />
				</MarkdownContainer>
			)
		}

		if (error) {
			return (
				<>
					<div style={{ color: "var(--vscode-errorForeground)", marginBottom: "10px" }}>{error}</div>
					<UrlText fontSize={fontSize}>{responseText}</UrlText>
				</>
			)
		}

		if (mcpDisplayMode === "rich") {
			const segments = buildDisplaySegments(responseText, urlMatches)
			return <span style={{ fontSize: `${fontSize}px` }}>{segments.map(renderSegment)}</span>
		}

		return null
	}

	try {
		return (
			<ResponseContainer>
				<ResponseHeader
					onClick={toggleExpand}
					style={{
						//borderBottom: isExpanded ? "1px dashed var(--vscode-editorGroup-border)" : "none",
						marginBottom: isExpanded ? "-4px" : "0px",
					}}>
					<div className="header-title" style={{ marginBottom: isExpanded ? 12 : 0 }}>
						<span
							className={`codicon codicon-chevron-${isExpanded ? "down" : "right"} header-icon`}
							style={{ fontSize: "inherit" }}></span>
						<span style={{ fontSize: "0.85em", textTransform: "uppercase", color: secondaryColor }}>Response</span>
					</div>
					<DropdownContainer
						style={{
							visibility: isExpanded ? "visible" : "hidden",
							margin: -6,
							marginBottom: isExpanded ? 2 : -6,
						}}>
						<McpDisplayModeDropdown
							onChange={handleDisplayModeChange}
							onClick={(e) => e.stopPropagation()}
							style={{ minWidth: "120px", scale: "0.85" }}
							value={mcpDisplayMode}
						/>
					</DropdownContainer>
				</ResponseHeader>

				{isExpanded && <div className="response-content">{renderContent()}</div>}
			</ResponseContainer>
		)
	} catch (_error) {
		console.log("Error rendering MCP response - falling back to plain text") // Restored comment
		// Fallback for critical rendering errors
		return (
			<ResponseContainer>
				<ResponseHeader onClick={toggleExpand}>
					<div className="header-title">
						<span
							className={`codicon codicon-chevron-${isExpanded ? "down" : "right"} header-icon`}
							style={{ fontSize: "inherit" }}></span>
						<span style={{ color: errorColor, fontSize: "0.85em", textTransform: "uppercase" }}>
							Response (Error)
						</span>
					</div>
				</ResponseHeader>
				{isExpanded && (
					<div className="response-content" style={{ marginTop: 4 }}>
						<div style={{ fontSize: fontSize, paddingBottom: 4, color: "var(--vscode-errorForeground)" }}>
							Error parsing response:
						</div>
						<UrlText fontSize={fontSize}>{responseText}</UrlText>
					</div>
				)}
			</ResponseContainer>
		)
	}
}

// Wrap the entire McpResponseDisplay component with an error boundary
const McpResponseDisplayWithErrorBoundary: React.FC<McpResponseDisplayProps> = (props) => {
	return (
		<ChatErrorBoundary>
			<McpResponseDisplay {...props} />
		</ChatErrorBoundary>
	)
}

export default McpResponseDisplayWithErrorBoundary
