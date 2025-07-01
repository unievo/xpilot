import { useExtensionState } from "@/context/ExtensionStateContext"
import { TaskServiceClient } from "@/services/grpc-client"
import { formatLargeNumber } from "@/utils/format"
import { StringRequest } from "@shared/proto/common"
import { GetTaskHistoryRequest } from "@shared/proto/task"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { memo, useState, useEffect, useCallback } from "react"
import HeroTooltip from "../common/HeroTooltip"
import { itemIconColor } from "../theme"

type HistoryPreviewProps = {
	showHistoryView: () => void
}

// Tailwind-styled radio with custom icon support
interface CustomFilterRadioProps {
	checked: boolean
	onChange: () => void
	icon: string
	label: string
}

const CustomFilterRadio = ({ checked, onChange, icon, label }: CustomFilterRadioProps) => {
	return (
		<div
			onClick={onChange}
			className="flex items-center cursor-pointer py-[0em] px-0 mr-[10px] text-[var(--vscode-font-size)] select-none">
			<div
				className={`scale-90 w-[14px] h-[14px] border border-[var(--vscode-checkbox-border)] relative flex justify-center items-center mr-[6px] ${
					checked ? "bg-[var(--vscode-checkbox-background)]" : "bg-transparent"
				}`}>
				{checked && <div className="w-[6px] h-[6px] bg-[var(--vscode-checkbox-foreground)]" />}
			</div>
			<span className="flex items-center gap-[3px]">
				<div className={`codicon codicon-${icon} text-[var(--vscode-button-background)] text-base`} />
				{label}
			</span>
		</div>
	)
}

const HistoryPreview = ({ showHistoryView }: HistoryPreviewProps) => {
	const { taskHistory } = useExtensionState()
	const [isExpanded, setIsExpanded] = useState(() => {
		try {
			const saved = localStorage.getItem("historyPreview-isExpanded")
			return saved ? JSON.parse(saved) : true
		} catch (error) {
			console.warn("Failed to load expansion state from localStorage:", error)
			return true
		}
	})
	const [showCurrentWorkspaceOnly, setShowCurrentWorkspaceOnly] = useState(() => {
		try {
			const saved = localStorage.getItem("historyPreview-showCurrentWorkspaceOnly")
			return saved ? JSON.parse(saved) : true
		} catch (error) {
			console.warn("Failed to load workspace filter state from localStorage:", error)
			return true
		}
	})
	const [filteredTasks, setFilteredTasks] = useState<any[]>([])

	// Save to localStorage whenever isExpanded changes
	useEffect(() => {
		localStorage.setItem("historyPreview-isExpanded", JSON.stringify(isExpanded))
	}, [isExpanded])

	// Save to localStorage whenever showCurrentWorkspaceOnly changes
	useEffect(() => {
		localStorage.setItem("historyPreview-showCurrentWorkspaceOnly", JSON.stringify(showCurrentWorkspaceOnly))
	}, [showCurrentWorkspaceOnly])

	// Load filtered task history with gRPC
	const loadTaskHistory = useCallback(async () => {
		try {
			const response = await TaskServiceClient.getTaskHistory(
				GetTaskHistoryRequest.create({
					currentWorkspaceOnly: showCurrentWorkspaceOnly,
				}),
			)
			setFilteredTasks(response.tasks || [])
		} catch (error) {
			console.error("Error loading task history:", error)
			// Fallback to local taskHistory if API fails
			setFilteredTasks(taskHistory || [])
		}
	}, [showCurrentWorkspaceOnly, taskHistory])

	// Load when filter changes or taskHistory updates
	useEffect(() => {
		if (showCurrentWorkspaceOnly) {
			loadTaskHistory()
		} else {
			// Use local taskHistory when workspace filter is off
			setFilteredTasks(taskHistory || [])
		}
	}, [loadTaskHistory, showCurrentWorkspaceOnly, taskHistory])

	// Get tasks to display
	const tasksToDisplay = filteredTasks.filter((item) => item.ts && item.task).slice(0, 10)

	const handleHistorySelect = (id: string) => {
		TaskServiceClient.showTaskWithId(StringRequest.create({ value: id })).catch((error) =>
			console.error("Error showing task:", error),
		)
	}

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded)
	}

	const formatTime = (timestamp: number) => {
		const now = Date.now()
		const diffMs = Math.max(now - timestamp, 0)
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
		if (diffDays >= 1) {
			return `${diffDays}d`
		}
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
		if (diffHours >= 1) {
			return `${diffHours}h`
		}
		const diffMinutes = Math.floor(diffMs / (1000 * 60))
		return `${diffMinutes}m`
	}

	return (
		<div style={{ flexShrink: 0 }}>
			<style>
				{`
					.history-preview-item {
						background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 65%, transparent);
						border-radius: 8px;
						position: relative;
						overflow: hidden;
						opacity: 1;
						cursor: pointer;
						margin-bottom: 5px;
					}
					.history-preview-item:hover {
						background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 100%, transparent);
						opacity: 1;
						pointer-events: auto;
					}
					.history-header {
						cursor: pointer;
						user-select: none;
					}
					.history-header:hover {
						opacity: 0.8;
					}
				`}
			</style>

			<div
				className="history-header"
				onClick={toggleExpanded}
				style={{
					color: "var(--vscode-descriptionForeground)",
					margin: "10px 20px 15px 20px",
					display: "flex",
					alignItems: "center",
				}}>
				<span
					className={`codicon codicon-chevron-${isExpanded ? "down" : "right"}`}
					style={{
						marginRight: "2px",
						transform: "scale(0.9)",
					}}></span>
				<span
					className="codicon codicon-tasklist"
					style={{
						marginRight: "4px",
						transform: "scale(0.9)",
					}}></span>
				<span
					style={{
						fontWeight: 600,
						fontSize: "0.85em",
						textTransform: "uppercase",
					}}>
					Recent Tasks
				</span>
			</div>

			{isExpanded && (
				<div
					style={{
						fontSize: "0.8em",
						padding: "0 10px 8px 20px",
						marginLeft: "0px",
						marginBottom: "0px",
						marginTop: "-5px",
						display: "flex",
						justifyContent: "flex-start",
						opacity: 0.7,
					}}>
					<CustomFilterRadio
						checked={showCurrentWorkspaceOnly}
						onChange={() => setShowCurrentWorkspaceOnly(!showCurrentWorkspaceOnly)}
						icon=""
						label="Current workspace"
					/>
					<HeroTooltip content="Show only tasks from the current workspace">
						<span
							style={{
								marginLeft: "-5px",
								opacity: 0.8,
								fontSize: "12px",
							}}
							className="codicon codicon-info"
						/>
					</HeroTooltip>
				</div>
			)}

			{isExpanded && (
				<div style={{ padding: "5px 20px 0 20px" }}>
					{tasksToDisplay.length > 0 ? (
						<>
							{tasksToDisplay.map((item) => (
								<div key={item.id} className="history-preview-item" onClick={() => handleHistorySelect(item.id)}>
									<div style={{ padding: "5px", paddingLeft: "12px", paddingRight: "12px" }}>
										<div
											id={`history-preview-task-${item.id}`}
											className="history-preview-task"
											style={{
												fontSize: "var(--vscode-font-size)",
												opacity: 0.9,
												marginBottom: "3px",
												marginTop: "1px",
												marginLeft: "0px",
												marginRight: "15px",
												display: "-webkit-box",
												WebkitLineClamp: 1,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
												whiteSpace: "pre-wrap",
												wordBreak: "break-word",
												overflowWrap: "anywhere",
											}}>
											<span className="ph-no-capture">{item.task}</span>
										</div>
										{item.isFavorited && (
											<div
												style={{
													position: "absolute",
													top: "6px",
													right: "6px",
													color: "var(--vscode-button-background)",
												}}>
												<span
													style={{ fontSize: "12px" }}
													className="codicon codicon-star-full"
													aria-label="Favorited"
												/>
											</div>
										)}
										<div style={{ padding: "0px 0px 0px 0px" }}>
											<span style={{ marginBottom: "0px" }}>
												<span
													style={{
														color: "var(--vscode-descriptionForeground)",
														//fontWeight: "bold",
														fontSize: "0.95em",
														opacity: 0.7,
														//textTransform: "uppercase",
													}}>
													{formatTime(item.ts)}
												</span>
											</span>
											<span
												style={{
													marginLeft: "0px",
													fontSize: "0.85em",
													//fontWeight: "bold",
													opacity: 0.7,
													color: "var(--vscode-descriptionForeground)",
												}}>
												<span>
													{" • "}Tokens: ↑{formatLargeNumber(item.tokensIn || 0)} ↓
													{formatLargeNumber(item.tokensOut || 0)}
												</span>
												{/* {!!item.cacheWrites && (
													<>
														<span
															style={{
																color: "color-mix(in srgb, var(--vscode-descriptionForeground) 40%, transparent)",
															}}>
															•
														</span>
														<span>
															Cache: +{formatLargeNumber(item.cacheWrites || 0)} →{" "}
															{formatLargeNumber(item.cacheReads || 0)}
														</span>
													</>
												)}
												{!!item.totalCost && (
													<>
														{" • "}
														<span>Cost: ${item.totalCost?.toFixed(4)}</span>
													</>
												)} */}
											</span>
										</div>
									</div>
								</div>
							))}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}>
								<VSCodeButton
									appearance="icon"
									onClick={() => showHistoryView()}
									className="cursor-pointer text-center transition-all duration-150 hover:opacity-80 flex items-center gap-1 bg-transparent border-none outline-none focus:outline-none"
									style={{
										opacity: 0.8,
									}}>
									<div
										style={{
											fontSize: "0.9em",
											//fontSize: "var(--vscode-font-size)",
											color: "var(--vscode-descriptionForeground)",
										}}>
										View all history
									</div>
								</VSCodeButton>
							</div>
						</>
					) : (
						<div
							className="text-center text-[var(--vscode-descriptionForeground)] py-4 rounded-xl"
							style={{
								textAlign: "center",
								color: "var(--vscode-descriptionForeground)",
								fontSize: "11px",
								padding: "10px 0",
							}}>
							No task history available.
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default memo(HistoryPreview)
