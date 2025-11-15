import {
	completionRowMargin,
	completionTextMargin,
	defaultBorderRadius,
	defaultDuration,
	iconHighlightColor,
	linkColor,
	mcpResponseMarginTop,
	primaryColor,
	primaryFontSize,
	primaryOpacity,
	responseContainerCollapsedMargin,
	responseContainerExpandedMargin,
	responseTextFontSize,
	rowHeaderGap,
	rowHideDuration,
	rowIconFontSize,
	rowIconOpacity,
	rowIconVisible,
	rowItemDisabledOpacity,
	rowItemExpandedBackground,
	rowItemExpandedOpacity,
	rowItemExpandedPadding,
	rowItemExpandedTopMargin,
	rowItemHoverBackground,
	rowItemMultilineMargin,
	rowItemPadding,
	rowItemPrimaryOpacity,
	rowPaddingRight,
	secondaryColor,
	secondaryFontSize,
	secondaryOpacity,
	spacingContainerMarginBottom,
	spacingContainerMarginTop,
	textLineHeight,
	toolBackground,
	toolBorder,
	userMessageBackground,
	userMessageHoverBackground,
	userMessageMargin,
	userMessagePadding,
} from "@components/config"
import styled from "styled-components"

// Styled components

// Markdown container to adjust default markdown styles
export const MarkdownContainer = styled.div`
	margin: -1.1em 0px; // Remove markdown default paragraph padding top and bottom
`

// Primary rows - primary visibility
export const PrimaryRowStyle = styled.div<{ isLast: boolean; isExpanded?: boolean }>`
	opacity: ${({ isLast }) => (isLast ? 1 : primaryOpacity)};
	color: ${primaryColor};
	font-size: ${primaryFontSize}px;
`

// Secondary rows - secondary visibility
export const SecondaryRowStyle = styled.div<{ isLastProcessing: boolean; isExpanded?: boolean }>`
	opacity: ${({ isLastProcessing }) => (isLastProcessing ? 1 : secondaryOpacity)};
	color: ${({ isLastProcessing }) => (isLastProcessing ? primaryColor : secondaryColor)};
	font-size: ${secondaryFontSize}px;
`

// Highlight row container - highlighted operations
export const HighlightRowContainer = styled.div<{ isLast: boolean; isExpanded?: boolean }>`
	padding: 5px 0px 5px ${rowIconVisible ? "3px" : "5px"};
	border: ${toolBorder};
	border-radius: ${defaultBorderRadius}px;
	background: ${toolBackground};
`

// Extra spacing row container - additional spacing between rows
export const SpacingRowContainer = styled.div`
	margin-top: ${spacingContainerMarginTop}px;
	margin-bottom: ${spacingContainerMarginBottom}px;
`

// Response row container - container for text response rows
export const ResponseRowContainer = styled.div<{ isLast: boolean; isExpanded: boolean }>`
	margin: ${({ isExpanded }) => (isExpanded ? responseContainerExpandedMargin : responseContainerCollapsedMargin)};
	line-height: ${textLineHeight};
	overflow: hidden;
	transition: all ${defaultDuration}ms;
`

// Completion row container - container for completion message rows
export const CompletionRowContainer = styled.div<{ isLast: boolean; isExpanded: boolean }>`
	margin: ${completionRowMargin};
	font-size: ${responseTextFontSize}px;
	line-height: ${textLineHeight};
	overflow: hidden;
`

// Row visibility wrapper - handles show/hide with animation
export const RowVisibility = styled.div<{ visible: boolean }>`
	max-height: ${({ visible }) => (visible ? "1000px" : "0.5px")};
	opacity: ${({ visible }) => (visible ? 1 : 0)};
	overflow: hidden;
	transition: max-height ${rowHideDuration}ms ease-in-out, opacity ${rowHideDuration}ms ease-in-out;
`

// Row header - container for row header elements
export const RowHeader = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: ${rowHeaderGap}px;
`

// Row icon - icon element in the row header
export const RowIcon = styled.span<{
	color?: string
	opacity?: number
	rotation?: number
	isLast: boolean
}>`
	color: ${({ color }) => color || iconHighlightColor};
	opacity: ${({ isLast, opacity }) => (isLast ? 1 : opacity || rowIconOpacity)};
	transform: ${({ rotation }) => (rotation ? `rotate(${rotation}deg)` : undefined)};
	font-size: ${rowIconFontSize}px; // Must be also specified inline as "inherit" on the inner icon style to set properly
	display: flex;
	align-items: center;
`

// Row title - title element in the row header
export const RowTitle = styled.div<{
	isExpanded?: boolean
	isLast: boolean
	color?: string
	fontWeight?: number | string
	wordBreak?: string
}>`
	color: ${({ color }) => color || ""};
	font-weight: ${({ fontWeight }) => fontWeight || "normal"};
	word-break: ${({ wordBreak }) => wordBreak || "normal"};
`

// Row item - generic row item container
export const RowItem = styled.div<{
	isLast: boolean
	linkOnHover?: boolean
}>`
	border: ${`1px solid ${toolBackground}`};
	border-radius: ${defaultBorderRadius}px;
	padding: ${rowItemPadding};
	overflow: hidden;
	width: auto;

	&:hover {
		opacity: 1;
		color: ${({ linkOnHover }) => ((linkOnHover ?? true) ? linkColor : primaryColor)};
		background: ${rowItemHoverBackground};
	}
`

// Expandable row item - row item that can expand/collapse
export const RowItemExpandable = styled(RowItem)<{ isLast: boolean; isExpanded: boolean; fullWidth?: boolean }>`
	color: ${({ isExpanded, linkOnHover: linkHover }) => (isExpanded ? ((linkHover ?? true) ? linkColor : "") : "")};
	background: ${({ isExpanded }) => (isExpanded ? rowItemExpandedBackground : "")};
	padding: ${({ isExpanded }) => (isExpanded ? rowItemExpandedPadding : rowItemPadding)};
	margin-top: ${({ isExpanded }) => (isExpanded ? `${rowItemExpandedTopMargin}px` : "0px")};
	width: ${({ isExpanded, fullWidth }) => (fullWidth ? `calc(100% - ${rowPaddingRight}px)` : isExpanded ? `calc(100% - ${rowPaddingRight}px)` : "min-content")};
	flex: ${({ fullWidth, isExpanded }) => (fullWidth ? (isExpanded ? "" : "1") : "")};

	&:hover {
		background: ${({ isExpanded }) => (isExpanded ? rowItemExpandedBackground : rowItemHoverBackground)};
	}
`

// Row item text - row item with text content
export const RowItemText = styled.div<{ isLast: boolean; isExpanded?: boolean; opacity?: number }>`
	margin-top: ${({ isExpanded }) => (isExpanded ? `${rowItemMultilineMargin}px` : "0px")};
	opacity: ${({ isLast, isExpanded, opacity }) => (isLast ? 1 : (opacity ?? (isExpanded ? rowItemExpandedOpacity : rowItemPrimaryOpacity)))};
	padding: ${rowItemPadding};
	line-height: ${textLineHeight};
	overflow: hidden;
	transition: all ${defaultDuration}ms;

	&:hover {
		opacity: ${({ isLast }) => (isLast ? 1 : rowItemPrimaryOpacity)};
	}
`

// Options row - row item for followup question options
export const OptionsRow = styled.div<{ isLast: boolean }>`
	opacity: ${({ isLast }) => (isLast ? 1 : rowItemDisabledOpacity)};
	padding: ${rowItemPadding};
	overflow: hidden;
	transition: all ${defaultDuration}ms;
`

// Command row - row item for commands
export const CommandRow = styled.div<{ isLast: boolean; isExpanded: boolean }>`
	margin-top: ${rowItemMultilineMargin}px;
	opacity: ${({ isLast, isExpanded }) => (isLast ? 1 : isExpanded ? rowItemExpandedOpacity : rowItemPrimaryOpacity)};
	background: ${toolBackground};
	border: ${toolBorder};
	border-radius: ${defaultBorderRadius}px;

	&:hover {
		opacity: 1;
	}
`

// MCP row - row for MCP tools/resources
export const McpRow = styled.div<{ isLast: boolean }>`
	margin-top: ${rowItemMultilineMargin}px;
	opacity: ${({ isLast }) => (isLast ? 1 : rowItemExpandedOpacity)};
	background: ${toolBackground};
	border: ${toolBorder};
	border-bottom: ${({ isLast }) => (!isLast ? "none" : toolBorder)};
	border-top: ${toolBorder};
	border-top-left-radius: ${defaultBorderRadius}px;
	border-top-right-radius: ${defaultBorderRadius}px;
	border-bottom-left-radius: ${({ isLast }) => (isLast ? defaultBorderRadius : 0)}px;
	border-bottom-right-radius: ${({ isLast }) => (isLast ? defaultBorderRadius : 0)}px;
	transition: all ${defaultDuration}ms;

	&:hover {
		opacity: 1;
	}
`

// MCP response row - row for MCP tools/resources responses
export const McpResponseRow = styled.div<{ isLast: boolean }>`
	margin-top: ${mcpResponseMarginTop}px;
	margin-bottom: ${({ isLast }) => (isLast ? "0px" : spacingContainerMarginBottom + "px")};
	background: ${toolBackground};
	border: ${toolBorder};
	border-top: none;
	border-bottom: ${toolBorder};
	border-bottom-left-radius: ${defaultBorderRadius}px;
	border-bottom-right-radius: ${defaultBorderRadius}px;
	transition: all ${defaultDuration}ms;

	&:hover {
		opacity: 1;
	}
`

// Completion row - row for completion messages
export const CompletionRow = styled.div<{ isExpanded?: boolean; isLast?: boolean }>`
	margin: ${completionTextMargin};
	line-height: ${textLineHeight};
`

// User message container
export const UserMessageContainer = styled.div<{ isEditing: boolean }>`
	color: var(--vscode-button-foreground);
	background: ${({ isEditing }) => (isEditing ? undefined : userMessageBackground)};
	border-radius: ${defaultBorderRadius}px;
	padding: ${userMessagePadding};
	margin: ${userMessageMargin};
	opacity: 0.9;

	&:hover {
		background: ${({ isEditing }) => (isEditing ? undefined : userMessageHoverBackground)};
	}
`
