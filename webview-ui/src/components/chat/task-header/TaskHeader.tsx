import { ClineMessage } from "@shared/ExtensionMessage"
import { StringRequest } from "@shared/proto/cline/common"
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useWindowSize } from "react-use"
import HeroTooltip from "@/components/common/HeroTooltip"
import Thumbnails from "@/components/common/Thumbnails"
import {
	chatInputSectionBorder,
	defaultBorderRadius,
	taskHeaderBackground,
	taskHeaderTaskTimelineVisible,
	taskHeaderTextLineClamp,
	taskHeaderTokenUsageVisible,
} from "@/components/config"
import { getModeSpecificFields, normalizeApiConfiguration } from "@/components/settings/utils/providerUtils"
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
		mode,
		localWorkflowToggles,
		globalWorkflowToggles,
		expandTaskHeader: isTaskExpanded,
		setExpandTaskHeader: setIsTaskExpanded,
		environment,
		focusChainSettings,
	} = useExtensionState()

	const [isHighlightedTextExpanded, setIsHighlightedTextExpanded] = useState(false)
	const [isTextOverflowing, setIsTextOverflowing] = useState(false)
	const highlightedTextRef = React.useRef<HTMLDivElement>(null)

	const { highlightedText, displayTextExpandable } = useMemo(() => {
		const taskTextLines = task.text?.split("\n") || []
		const highlightedText = highlightText(task.text, true, localWorkflowToggles, globalWorkflowToggles)

		return { highlightedText, displayTextExpandable: taskTextLines.length > 3 }
	}, [task.text])

	// const highlightedText = useMemo(() => highlightText(task.text, false), [task.text])

	// // Check if text overflows the container (i.e., needs clamping)
	// useLayoutEffect(() => {
	// 	const el = highlightedTextRef.current
	// 	if (el && isTaskExpanded && !isHighlightedTextExpanded) {
	// 		// Check if content height exceeds the max-height
	// 		setIsTextOverflowing(el.scrollHeight > el.clientHeight)
	// 	}
	// }, [task.text, isTaskExpanded, isHighlightedTextExpanded])

	// Handle click outside to collapse
	React.useEffect(() => {
		if (!isHighlightedTextExpanded) {
			return
		}

		const handleClickOutside = (event: MouseEvent) => {
			if (highlightedTextRef.current && !highlightedTextRef.current.contains(event.target as Node)) {
				setIsHighlightedTextExpanded(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [isHighlightedTextExpanded])

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
	}, [task.text, windowWidth, windowHeight, isTaskExpanded, isTextExpanded])

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
		<div className={"p-2 pb-1 flex flex-col gap-1"}>
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
					border: chatInputSectionBorder,
					borderRadius: defaultBorderRadius,
					// borderTop: menuTopBorder,
					padding: "5px 5px 2px 8px",
					display: "flex",
					flexDirection: "column",
					gap: 0,
					position: "relative",
					zIndex: 1,
				}}>
				<div
					style={{
						height: isTaskExpanded ? "auto" : "40px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						backgroundColor: isTaskExpanded ? "var(--vscode-editor-background)" : "transparent",
						borderRadius: defaultBorderRadius,
						padding: isTaskExpanded ? "3px 5px" : 0,
						margin: isTaskExpanded ? "-2px -2px 4px -4px" : "-2px 0 2px 0",
					}}>
					<div
						onClick={() => setIsTaskExpanded(!isTaskExpanded)}
						style={{
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
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
							<span className={`codicon codicon-chevron-${isTaskExpanded ? "down" : ""}`}></span>
						</div>
						<div
							style={{
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								flexGrow: 1,
								minWidth: 0, // This allows the div to shrink below its content size
							}}>
							{isTaskExpanded && taskHeaderTokenUsageVisible && (
								<div
									style={{
										fontSize: "12px",
										opacity: 0.9,
										display: "flex",
									}}>
									<div
										style={{
											display: "flex",
											minWidth: 0,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											textAlign: "left",
											alignItems: "center",
											gap: "2px",
											marginLeft: "2px",
											justifyContent: "space-between",
											flexWrap: "nowrap",
										}}>
										{/* <div style={{ display: "flex", alignItems: "center" }}>
											<span style={{ fontWeight: "normal" }}>Tokens:</span>
										</div> */}
										<HeroTooltip content="Input Tokens">
											<span className=" flex items-center gap-[0px] cursor-pointer">
												<span
													className="codicon codicon-arrow-up"
													style={{
														fontSize: "11px",
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
														fontSize: "11px",
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
													flexWrap: "nowrap",
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
																		fontSize: "11px",
																		fontWeight: "bold",
																		marginBottom: "1px",
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
																		fontSize: "11px",
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
								</div>
							)}
							{!isTaskExpanded && (
								<>
									<div className="flex flex-1 items-center">
										<span
											className="ph-no-capture"
											style={{
												margin: "0 5px 5px 0",
												overflow: "hidden",
												display: "-webkit-box",
												WebkitLineClamp: 1,
												WebkitBoxOrient: "vertical",
												whiteSpace: "normal",
												height: "auto",
											}}>
											{highlightText(task.text, true, localWorkflowToggles, globalWorkflowToggles)}
										</span>
										{isCostAvailable && (
											<span
												className="ml-auto mr-2 mb-1 px-1 py-0.25 rounded-md inline-flex shrink-0 text-badge-foreground bg-badge-background/60 items-center"
												id="price-tag">
												<span
													className="text-xs"
													style={{ fontFamily: "var(--vscode-editor-font-family)" }}>
													${totalCost?.toFixed(3)}
												</span>
											</span>
										)}
									</div>
									<div style={{ marginRight: 8 }}>
										<ContextWindow
											cacheReads={cacheReads}
											cacheWrites={cacheWrites}
											contextWindow={selectedModelInfo?.contextWindow}
											lastApiReqTotalTokens={lastApiReqTotalTokens}
											onSendMessage={onSendMessage}
											showCondenseButton={false}
											tokensIn={tokensIn}
											tokensOut={tokensOut}
											useAutoCondense={false} // Disable auto-condense configuration in UI for now
										/>
									</div>
								</>
							)}
						</div>
					</div>

					<div className="inline-flex items-center justify-end select-none shrink-0">
						{isTaskExpanded && (
							<>
								{isCostAvailable && (
									<span
										className="ml-2 mr-2 px-1 py-0.125 rounded-md inline-flex shrink-0 text-badge-foreground bg-badge-background/60 items-center"
										id="price-tag">
										<span className="text-xs" style={{ fontFamily: "var(--vscode-editor-font-family)" }}>
											${totalCost?.toFixed(3)}
										</span>
									</span>
								)}
								<div
									className="flex -mb-2.5 -mt-2.5 -mr-1 items-center flex-wrap"
									style={{ justifyContent: "flex-end" }}>
									{IS_DEV === true && <OpenDiskConversationHistoryButton taskId={currentTaskItem?.id} />}
									<CopyTaskButton taskText={task.text} />
									<DeleteTaskButton taskId={currentTaskItem?.id} taskSize={currentTaskItem?.size} />
									<NewTaskButton className={BUTTON_CLASS} onClick={onClose} />
								</div>
							</>
						)}
						{!isTaskExpanded && <NewTaskButton className={BUTTON_CLASS} onClick={onClose} />}
					</div>
				</div>

				{/* Expand/Collapse Task Details */}
				{isTaskExpanded && (
					<>
						<div
							onClick={() => setIsTextExpanded(!isTextExpanded)}
							ref={textContainerRef}
							style={{
								cursor: showSeeMore ? "pointer" : "default",
								marginTop: 6,
								margin: "2px 0 6px 0",
								fontSize: "var(--vscode-font-size)",
								overflowY: isTextExpanded ? "auto" : "hidden",
								wordBreak: "break-word",
								overflowWrap: "anywhere",
								position: "relative",
								display: "flex",
								alignItems: isTextExpanded ? "flex-start" : "center",
							}}>
							<div
								ref={textRef}
								style={{
									// backgroundColor: "var(--vscode-editor-background)",
									// borderRadius: defaultBorderRadius,
									padding: "0px 3px",
									display: "-webkit-box",
									WebkitLineClamp: isTextExpanded ? "unset" : taskHeaderTextLineClamp,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
									overflowWrap: "anywhere",
									marginRight: isTextExpanded ? 4 : 6,
									lineHeight: 1.4,
								}}>
								<span className="ph-no-capture">
									{highlightText(task.text, false, localWorkflowToggles, globalWorkflowToggles)}
								</span>
							</div>
							{!isTextExpanded && showSeeMore && (
								<div
									style={{
										// position: "absolute",
										// right: 0,
										// bottom: 0,
										display: "flex",
										alignItems: "center",
									}}>
									{/* <div
										style={{
											width: 30,
											height: "1.2em",
											background: `linear-gradient(to right, transparent, ${taskHeaderBackground}  )`,
										}}
									/> */}
									<HeroTooltip content="Expand text">
										<div
											onClick={() => setIsTextExpanded(!isTextExpanded)}
											style={{
												cursor: "pointer",
												// backgroundColor:"var(--vscode-editor-background)",
												// color: "var(--vscode-textLink-foreground)",
												paddingRight: 3,
												paddingLeft: 3,
												// marginBottom: -4,
												verticalAlign: "middle",
												fontSize: 12,
												opacity: 0.9,
											}}>
											<ChevronsUpDown size={14} />
										</div>
									</HeroTooltip>
								</div>
							)}
						</div>
						{isTextExpanded && showSeeMore && (
							<HeroTooltip content="Collapse text">
								<div
									onClick={() => setIsTextExpanded(!isTextExpanded)}
									style={{
										cursor: "pointer",
										// color: "var(--vscode-textLink-foreground)",
										marginLeft: "auto",
										marginBottom: 8,
										textAlign: "right",
										verticalAlign: "middle",
										fontSize: 11,
										marginRight: -2,
									}}>
									<ChevronsDownUp size={14} />
								</div>
							</HeroTooltip>
						)}
						{((task.images && task.images.length > 0) || (task.files && task.files.length > 0)) && (
							<Thumbnails files={task.files ?? []} images={task.images ?? []} style={{ margin: "-2px 0 4px 0" }} />
						)}

						{taskHeaderTaskTimelineVisible && (
							<div className="flex flex-col">
								<TaskTimeline messages={clineMessages} onBlockClick={onScrollToMessage} />
							</div>
						)}

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								margin: "2px 0",
							}}>
							<div>
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
							</div>
						</div>
					</>
				)}
			</div>

			{/* Display Focus Chain To-Do List */}
			{focusChainSettings.enabled && (
				<FocusChain currentTaskItemId={currentTaskItem?.id} lastProgressMessageText={lastProgressMessageText} />
			)}
		</div>
	)
}

export default TaskHeader
