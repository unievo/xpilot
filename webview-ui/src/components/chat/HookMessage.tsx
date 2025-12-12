import { ClineMessage } from "@shared/ExtensionMessage"
import { EmptyRequest } from "@shared/proto/cline/common"
import { memo, useMemo, useState } from "react"
import { TaskServiceClient } from "@/services/grpc-client"
import { defaultBorderRadius, iconHighlightColor, rowIconVisible, secondaryFontSize } from "../config"
import { CommandRow, PrimaryRowStyle, RowHeader, RowIcon, RowTitle, SpacingRowContainer } from "./ChatRowStyles"
import { HOOK_OUTPUT_STRING } from "./constants"

const normalColor = "var(--vscode-foreground)"
const errorColor = "var(--vscode-errorForeground)"
const successColor = "var(--vscode-charts-green)"
const completedColor = "var(--vscode-descriptionForeground)"

/**
 * Determines if a hook message should be expanded by default.
 *
 * Expansion logic:
 * - Historical messages (>5 seconds old): Always collapsed for better UX
 * - Fresh failed/cancelled hooks: Expanded to show error details
 * - Fresh successful hooks: Collapsed to minimize clutter
 * - Running hooks: Not applicable (handled separately)
 *
 * @param message The message containing timestamp information
 * @param metadata The hook metadata containing status
 * @returns true if the hook output should be expanded by default
 */
function shouldExpandHookByDefault(message: ClineMessage, metadata: HookMetadata): boolean {
	// Always collapse historical messages (>5 seconds old) for better UX
	const isHistorical = message.ts && Date.now() - message.ts > 5000
	if (isHistorical) {
		return false
	}

	// Expand fresh failed/cancelled hooks to show error details
	return metadata.status === "failed" || metadata.status === "cancelled"
}

interface HookMessageProps {
	message: ClineMessage
	// CommandOutput component - we'll import and use it here
	CommandOutput: React.ComponentType<{
		output: string
		isOutputFullyExpanded: boolean
		onToggle: () => void
		isContainerExpanded: boolean
	}>
	isLast: boolean
}

interface HookMetadata {
	hookName: string
	toolName?: string
	status: string
	exitCode?: number
	hasJsonResponse?: boolean
	pendingToolInfo?: {
		tool: string
		path?: string
		command?: string
		content?: string
		diff?: string
		regex?: string
		url?: string
		mcpTool?: string
		mcpServer?: string
		resourceUri?: string
	}
	error?: {
		type: "timeout" | "validation" | "execution" | "cancellation"
		message: string
		details?: string
		scriptPath?: string
	}
}

/**
 * Displays a hook execution message with status, pending tool info, and output.
 *
 * Smart expansion defaults:
 * - Failed hooks: Expanded by default (show error details)
 * - Aborted hooks: Expanded by default (show what happened)
 * - Successful hooks: Collapsed by default (minimize clutter)
 * - Running hooks: Always shows pending tool info
 */
const HookMessage = memo(({ message, CommandOutput, isLast }: HookMessageProps) => {
	// Parse hook metadata and output
	const { metadata, output } = useMemo(() => {
		const splitMessage = (text: string) => {
			const outputIndex = text.indexOf(HOOK_OUTPUT_STRING)
			if (outputIndex === -1) {
				return { metadata: text, output: "" }
			}
			return {
				metadata: text.slice(0, outputIndex).trim(),
				output: text
					.slice(outputIndex + HOOK_OUTPUT_STRING.length)
					.trim()
					.split("")
					.map((char) => {
						switch (char) {
							case "\t":
								return "→   "
							case "\b":
								return "⌫"
							case "\f":
								return "⏏"
							case "\v":
								return "⇳"
							default:
								return char
						}
					})
					.join(""),
			}
		}

		const { metadata: metadataStr, output } = splitMessage(message.text || "")

		let hookMetadata: HookMetadata
		try {
			hookMetadata = JSON.parse(metadataStr)
		} catch {
			hookMetadata = { hookName: "Unknown", status: "unknown" }
		}

		return { metadata: hookMetadata, output }
	}, [message.text])

	// Determine initial expansion state using pure function
	const [isHookOutputExpanded, setIsHookOutputExpanded] = useState(() => shouldExpandHookByDefault(message, metadata))

	const isRunning = metadata.status === "running"
	const isCompleted = metadata.status === "completed"
	const isFailed = metadata.status === "failed"
	const isCancelled = metadata.status === "cancelled"

	const headerStyle: React.CSSProperties = {
		display: "flex",
		alignItems: "center",
		gap: "5px",
		// marginBottom: "12px",
	}

	return (
		<PrimaryRowStyle isExpanded={true} isLast={isLast}>
			<SpacingRowContainer>
				<RowHeader>
					{rowIconVisible && (
						<RowIcon isLast={isLast}>
							<span
								className="codicon codicon-symbol-event"
								style={{
									color: iconHighlightColor,
									fontSize: "inherit",
									marginBottom: "-1.5px",
								}}></span>
						</RowIcon>
					)}
					<RowTitle>
						<div style={headerStyle}>
							<span>Hook:</span>
							<span>{metadata.hookName}</span>
							{metadata.toolName && (
								<span style={{ color: "var(--vscode-descriptionForeground)", fontSize: "0.9em" }}>
									({metadata.toolName})
								</span>
							)}
						</div>
					</RowTitle>
				</RowHeader>
				<CommandRow
					isExpanded={true}
					isLast={isLast}
					style={{
						borderRadius: defaultBorderRadius,
						border: "1px solid var(--vscode-editorGroup-border)",
						overflow: "visible",
						// backgroundColor: CHAT_ROW_EXPANDED_BG_COLOR,
						transition: "all 0.3s ease-in-out",
					}}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							padding: "4px 8px",
							// backgroundColor: CHAT_ROW_EXPANDED_BG_COLOR,
							// borderBottom:
							// 	metadata.pendingToolInfo || output.length > 0
							// 		? "1px solid var(--vscode-editorGroup-border)"
							// 		: "none",
							borderTopLeftRadius: defaultBorderRadius,
							borderTopRightRadius: defaultBorderRadius,
						}}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								flex: 1,
								minWidth: 0,
							}}>
							<div
								style={{
									width: "8px",
									height: "8px",
									borderRadius: "50%",
									backgroundColor: isRunning
										? successColor
										: isFailed || isCancelled
											? errorColor
											: completedColor,
									animation: isRunning ? "pulse 2s ease-in-out infinite" : "none",
									flexShrink: 0,
								}}
							/>
							<span
								style={{
									color: isRunning ? successColor : isFailed || isCancelled ? errorColor : completedColor,
									// fontWeight: 500,
									fontSize: secondaryFontSize,
									flexShrink: 0,
								}}>
								{isRunning
									? "Running"
									: isFailed
										? "Failed"
										: isCancelled
											? "Aborted"
											: isCompleted
												? "Completed"
												: "Unknown"}
							</span>
							{metadata.exitCode !== undefined && metadata.exitCode !== 0 && (
								<span
									style={{
										color: "var(--vscode-descriptionForeground)",
										fontSize: secondaryFontSize,
									}}>
									(exit: {metadata.exitCode})
								</span>
							)}
						</div>
						{isRunning && metadata.hookName !== "TaskCancel" && metadata.hookName !== "TaskComplete" && (
							<button
								onClick={(e) => {
									e.stopPropagation()
									// Cancel the task - cancelling a hook always cancels the entire task
									TaskServiceClient.cancelTask(EmptyRequest.create({})).catch((err) =>
										console.error("Failed to cancel task:", err),
									)
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = "var(--vscode-button-secondaryHoverBackground)"
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = "var(--vscode-button-secondaryBackground)"
								}}
								style={{
									background: "var(--vscode-button-secondaryBackground)",
									color: "var(--vscode-button-secondaryForeground)",
									border: "none",
									borderRadius: "4px",
									padding: "0px 10px",
									fontSize: secondaryFontSize,
									cursor: "pointer",
									fontFamily: "inherit",
								}}>
								Abort
							</button>
						)}
					</div>

					{/* Show concise error message for specific error types */}
					{isFailed && metadata.error && metadata.error.type === "timeout" && (
						<div
							style={{
								padding: "0 8px 5px 8px",
								// borderBottom: output.length > 0 ? "1px solid var(--vscode-editorGroup-border)" : "none",
								fontSize: secondaryFontSize,
								color: "var(--vscode-descriptionForeground)",
							}}>
							Took longer than 30 seconds. Check for infinite loops or add timeouts to network requests.
						</div>
					)}

					{isFailed && metadata.error && metadata.error.type === "validation" && (
						<div
							style={{
								padding: "0 8px 5px 8px",
								// borderBottom: output.length > 0 ? "1px solid var(--vscode-editorGroup-border)" : "none",
								fontSize: secondaryFontSize,
								color: "var(--vscode-descriptionForeground)",
							}}>
							Hook returned invalid JSON. See error details below for more information.
						</div>
					)}

					{/* Show hook output if present */}
					{output.length > 0 && (
						<div style={{ padding: "0 3px 3px 3px" }}>
							<CommandOutput
								isContainerExpanded={true}
								isOutputFullyExpanded={isHookOutputExpanded}
								onToggle={() => setIsHookOutputExpanded(!isHookOutputExpanded)}
								output={output}
							/>
						</div>
					)}
				</CommandRow>
			</SpacingRowContainer>
		</PrimaryRowStyle>
	)
})

export default HookMessage
