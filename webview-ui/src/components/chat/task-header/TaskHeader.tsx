import { ClineMessage } from "@shared/ExtensionMessage"
import { StringRequest } from "@shared/proto/cline/common"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useWindowSize } from "react-use"
import HeroTooltip from "@/components/common/HeroTooltip"
import Thumbnails from "@/components/common/Thumbnails"
import { getModeSpecificFields, normalizeApiConfiguration } from "@/components/settings/utils/providerUtils"
import { taskHeaderBackground } from "@/components/theme"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { UiServiceClient } from "@/services/grpc-client"
import { formatLargeNumber } from "@/utils/format"
import CopyTaskButton from "./buttons/CopyTaskButton"
import DeleteTaskButton from "./buttons/DeleteTaskButton"
import NewTaskButton from "./buttons/NewTaskButton"
import OpenDiskConversationHistoryButton from "./buttons/OpenDiskConversationHistoryButton"
import { CheckpointError } from "./CheckpointError"
import ContextWindow from "./ContextWindow"
import { FocusChain } from "./FocusChain"
import { highlightText } from "./Highlights"
import TaskTimeline from "./TaskTimeline"

const IS_DEV = process.env.IS_DEV === '"true"'
interface TaskHeaderProps {
	task: ClineMessage
	tokensIn: number
	tokensOut: number
	doesModelSupportPromptCache: boolean
	cacheWrites?: number
	cacheReads?: number
	totalCost: number
	lastApiReqTotalTokens?: number
	lastProgressMessageText?: string
	onClose: () => void
	onScrollToMessage?: (messageIndex: number) => void
	onSendMessage?: (command: string, files: string[], images: string[]) => void
}

const BUTTON_CLASS = "max-h-3 border-0 font-bold bg-transparent hover:opacity-100 text-foreground"

const TaskHeader: React.FC<TaskHeaderProps> = ({
	task,
	tokensIn,
	tokensOut,
	cacheWrites,
	cacheReads,
	totalCost,
	lastApiReqTotalTokens,
	lastProgressMessageText,
	onClose,
	onScrollToMessage,
	onSendMessage,
}) => {
	const {
		apiConfiguration,
		currentTaskItem,
		checkpointManagerErrorMessage,
		clineMessages,
		navigateToSettings,
		useAutoCondense,
		mode,
		localWorkflowToggles,
		globalWorkflowToggles,
		expandTaskHeader: isTaskExpanded,
		setExpandTaskHeader: setIsTaskExpanded,
	} = useExtensionState()

	// Simplified computed values
	const { selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, mode)
	const modeFields = getModeSpecificFields(apiConfiguration, mode)

	const [isTextExpanded, setIsTextExpanded] = useState(false)
	const [showSeeMore, setShowSeeMore] = useState(false)
	const textContainerRef = useRef<HTMLDivElement>(null)
	const textRef = useRef<HTMLDivElement>(null)

	const { height: windowHeight, width: windowWidth } = useWindowSize()

	useEffect(() => {
		if (isTextExpanded && textContainerRef.current) {
			const maxHeight = windowHeight * (1 / 3)
			textContainerRef.current.style.maxHeight = `${maxHeight}px`
		}
	}, [isTextExpanded, windowHeight])

	useEffect(() => {
		if (isTaskExpanded && textRef.current && textContainerRef.current) {
			// Use requestAnimationFrame to ensure DOM is fully updated
			requestAnimationFrame(() => {
				// Check if refs are still valid
				if (textRef.current && textContainerRef.current) {
					let textContainerHeight = textContainerRef.current.clientHeight
					if (!textContainerHeight) {
						textContainerHeight = textContainerRef.current.getBoundingClientRect().height
					}
					const isOverflowing = textRef.current.scrollHeight > textContainerHeight

					setShowSeeMore(isOverflowing)
				}
			})
		}
	}, [task.text, windowWidth, isTaskExpanded])

	const isCostAvailable =
		(totalCost &&
			modeFields.apiProvider === "openai" &&
			modeFields.openAiModelInfo?.inputPrice &&
			modeFields.openAiModelInfo?.outputPrice) ||
		(modeFields.apiProvider !== "vscode-lm" && modeFields.apiProvider !== "ollama" && modeFields.apiProvider !== "lmstudio")

	// Event handlers
	const toggleTaskExpanded = useCallback(() => setIsTaskExpanded(!isTaskExpanded), [setIsTaskExpanded, isTaskExpanded])

	const handleCheckpointSettingsClick = useCallback(() => {
		navigateToSettings()
		setTimeout(async () => {
			try {
				await UiServiceClient.scrollToSettings(StringRequest.create({ value: "features" }))
			} catch (error) {
				console.error("Error scrolling to checkpoint settings:", error)
			}
		}, 300)
	}, [navigateToSettings])

	// const highlightedText = useMemo(() => highlightText(task.text, false), [task.text])

	const shouldShowPromptCacheInfo = () => {
		// Hybrid logic: Show cache info if we have actual cache data,
		// regardless of whether the model explicitly supports prompt cache.
		// This allows OpenAI-compatible providers to show cache tokens.
		return (cacheReads !== undefined && cacheReads > 0) || (cacheWrites !== undefined && cacheWrites > 0)
	}

	return (
		<div className={"p-1.5 pb-1 flex flex-col gap-1"}>
			{/* Display Checkpoint Error */}
			<CheckpointError
				checkpointManagerErrorMessage={checkpointManagerErrorMessage}
				handleCheckpointSettingsClick={handleCheckpointSettingsClick}
			/>
			{/* Task Header */}
			<div
				style={{
					backgroundColor: taskHeaderBackground,
					color: "var(--vscode-editor-foreground)",
					borderRadius: "8px",
					padding: "5px 5px 2px 8px",
					display: "flex",
					flexDirection: "column",
					gap: 0,
					position: "relative",
					zIndex: 1,
					// opacity: isTaskExpanded ? 0.8 : 1,
				}}>
				<div
					style={{
						height: isTaskExpanded ? "auto" : "45px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}>
					<div
						onClick={() => setIsTaskExpanded(!isTaskExpanded)}
						style={{
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
							marginTop: -3,
							marginLeft: -2,
							userSelect: "none",
							WebkitUserSelect: "none",
							MozUserSelect: "none",
							msUserSelect: "none",
							flexGrow: 1,
							minWidth: 0, // This allows the div to shrink below its content size
						}}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								flexShrink: 0,
							}}>
							<span className={`codicon codicon-chevron-${isTaskExpanded ? "down" : "right"}`}></span>
						</div>
						<div
							style={{
								marginLeft: 2,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								flexGrow: 1,
								minWidth: 0, // This allows the div to shrink below its content size
							}}>
							{!isTaskExpanded && (
								<span
									className="ph-no-capture"
									style={{
										marginRight: 5,
										overflow: "hidden",
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										whiteSpace: "normal",
										height: "auto",
									}}>
									{highlightText(task.text, false, localWorkflowToggles, globalWorkflowToggles)}
								</span>
							)}
						</div>
					</div>
					<div className="inline-flex items-center justify-end select-none flex-shrink-0">
						{isCostAvailable && (
							<div
								className="mr-1 px-1 py-0.25 rounded-full inline-flex shrink-0 text-badge-background bg-badge-foreground/70 items-center"
								id="price-tag">
								<span className="text-xs">${totalCost?.toFixed(4)}</span>
							</div>
						)}
						<NewTaskButton className={BUTTON_CLASS} onClick={onClose} />
					</div>
				</div>

				{/* Expand/Collapse Task Details */}
				{isTaskExpanded && (
					<>
						<div
							ref={textContainerRef}
							style={{
								marginTop: 2,
								fontSize: "var(--vscode-font-size)",
								overflowY: isTextExpanded ? "auto" : "hidden",
								wordBreak: "break-word",
								overflowWrap: "anywhere",
								position: "relative",
							}}>
							<div
								ref={textRef}
								style={{
									display: "-webkit-box",
									WebkitLineClamp: isTextExpanded ? "unset" : 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
									overflowWrap: "anywhere",
									marginRight: 6,
								}}>
								<span className="ph-no-capture">
									{highlightText(task.text, false, localWorkflowToggles, globalWorkflowToggles)}
								</span>
							</div>
							{!isTextExpanded && showSeeMore && (
								<div
									style={{
										position: "absolute",
										right: 0,
										bottom: 0,
										display: "flex",
										alignItems: "center",
									}}>
									<div
										style={{
											width: 30,
											height: "1.2em",
											background: "linear-gradient(to right, transparent, var(--vscode-input-background))",
										}}
									/>
									<div
										onClick={() => setIsTextExpanded(!isTextExpanded)}
										style={{
											cursor: "pointer",
											backgroundColor: "var(--vscode-input-background)",
											color: "var(--vscode-textLink-foreground)",
											paddingRight: 8,
											paddingLeft: 3,
											fontSize: 12,
										}}>
										See more
									</div>
								</div>
							)}
						</div>
						{isTextExpanded && showSeeMore && (
							<div
								onClick={() => setIsTextExpanded(!isTextExpanded)}
								style={{
									cursor: "pointer",
									color: "var(--vscode-textLink-foreground)",
									marginLeft: "auto",
									textAlign: "right",
									fontSize: 12,
									paddingRight: 8,
								}}>
								See less
							</div>
						)}
						{((task.images && task.images.length > 0) || (task.files && task.files.length > 0)) && (
							<Thumbnails files={task.files ?? []} images={task.images ?? []} style={{ marginTop: "5px" }} />
						)}

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "2px",
							}}>
							<div
								style={{
									opacity: 0.7,
									fontSize: "0.9em",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									flexWrap: "wrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "4px",
										marginTop: 3,
										// flexWrap: "wrap",
									}}>
									<div style={{ display: "flex", alignItems: "center" }}>
										<span style={{ fontWeight: "bold" }}>Tokens:</span>
									</div>
									<HeroTooltip content="Input Tokens">
										<span className=" flex items-center gap-[0px] cursor-pointer">
											<span
												className="codicon codicon-arrow-up"
												style={{
													fontSize: "12px",
													fontWeight: "bold",
													color: "var(--vscode-list-deemphasizedForeground)",
												}}
											/>
											{formatLargeNumber(tokensIn || 0)}
										</span>
									</HeroTooltip>

									<HeroTooltip content="Output Tokens">
										<span className="flex items-center gap-[0px] cursor-pointer">
											<i
												className="codicon codicon-arrow-down"
												style={{
													fontSize: "12px",
													fontWeight: "bold",
													color: "var(--vscode-list-deemphasizedForeground)",
												}}
											/>
											{formatLargeNumber(tokensOut || 0)}
										</span>
									</HeroTooltip>

									{shouldShowPromptCacheInfo() && (
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												flexWrap: "wrap",
											}}>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
												}}>
												{/* <div style={{ display: "flex", alignItems: "center" }}>
													<span style={{ fontWeight: "bold" }}>Cache:</span>
													</div> */}
												{cacheWrites !== undefined && cacheWrites > 0 && (
													<HeroTooltip content="Tokens written to cache">
														<span className="flex items-center gap-[0px] cursor-pointer">
															<i
																className="codicon codicon-database"
																style={{
																	fontSize: "12px",
																	fontWeight: "bold",
																	color: "var(--vscode-list-deemphasizedForeground)",
																}}
															/>
															+{formatLargeNumber(cacheWrites || 0)}
														</span>
													</HeroTooltip>
												)}
												{cacheReads !== undefined && cacheReads > 0 && (
													<HeroTooltip content="Tokens read from cache">
														<span className="flex items-center gap-[1px] cursor-pointer">
															<i
																className={"codicon codicon-arrow-right"}
																style={{
																	fontSize: "12px",
																	fontWeight: "bold",
																	marginBottom: "1px",
																	color: "var(--vscode-list-deemphasizedForeground)",
																}}
															/>
															{formatLargeNumber(cacheReads || 0)}
														</span>
													</HeroTooltip>
												)}
											</div>
										</div>
									)}
								</div>
								<div className="flex items-center flex-wrap" style={{ justifyContent: "flex-end" }}>
									{IS_DEV === true && <OpenDiskConversationHistoryButton taskId={currentTaskItem?.id} />}
									<CopyTaskButton taskText={task.text} />
									<DeleteTaskButton taskId={currentTaskItem?.id} taskSize={currentTaskItem?.size} />
								</div>
							</div>

							<ContextWindow
								cacheReads={cacheReads}
								cacheWrites={cacheWrites}
								contextWindow={selectedModelInfo?.contextWindow}
								lastApiReqTotalTokens={lastApiReqTotalTokens}
								onSendMessage={onSendMessage}
								tokensIn={tokensIn}
								tokensOut={tokensOut}
								useAutoCondense={false} // Disable auto-condense configuration in UI for now
							/>

							<div className="flex flex-col mb-0.5 mt-0.5">
								<TaskTimeline messages={clineMessages} onBlockClick={onScrollToMessage} />
							</div>
						</div>
					</>
				)}
			</div>

			{/* Display Focus Chain To-Do List */}
			<FocusChain currentTaskItemId={currentTaskItem?.id} lastProgressMessageText={lastProgressMessageText} />
		</div>
	)
}

export default TaskHeader
