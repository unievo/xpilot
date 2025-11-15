import { combineApiRequests } from "@shared/combineApiRequests"
import { combineCommandSequences } from "@shared/combineCommandSequences"
import { ClineMessage } from "@shared/ExtensionMessage"
import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { Virtuoso } from "react-virtuoso"
import {
	taskHeaderTimelineBlockBorderRadius,
	taskHeaderTimelineBlockGap,
	taskHeaderTimelineBlockWidth,
	taskHeaderTimelineHeight,
} from "@/components/config"
import TaskTimelineTooltip from "./TaskTimelineTooltip"
import { getColor } from "./util"

// Timeline dimensions and spacing
const TIMELINE_HEIGHT = taskHeaderTimelineHeight
const BLOCK_WIDTH = taskHeaderTimelineBlockWidth
const BLOCK_GAP = taskHeaderTimelineBlockGap
const _TOOLTIP_MARGIN = 32 // 32px margin on each side

interface TaskTimelineProps {
	messages: ClineMessage[]
	onBlockClick?: (messageIndex: number) => void
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({ messages, onBlockClick }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const scrollableRef = useRef<HTMLDivElement>(null)

	const { taskTimelinePropsMessages, messageIndexMap } = useMemo(() => {
		if (messages.length <= 1) {
			return { taskTimelinePropsMessages: [], messageIndexMap: [] }
		}

		const processed = combineApiRequests(combineCommandSequences(messages.slice(1)))
		const indexMap: number[] = []

		const filtered = processed.filter((msg, _processedIndex) => {
			const originalIndex = messages.findIndex((originalMsg, idx) => idx > 0 && originalMsg.ts === msg.ts)

			// Filter out standard "say" events we don't want to show
			if (
				msg.type === "say" &&
				(msg.say === "api_req_started" ||
					msg.say === "api_req_finished" ||
					msg.say === "api_req_retried" ||
					msg.say === "deleted_api_reqs" ||
					msg.say === "checkpoint_created" ||
					msg.say === "task_progress" ||
					msg.say === "text" ||
					msg.say === "reasoning")
			) {
				return false
			}

			// Filter out "ask" events we don't want to show, including the duplicate completion_result
			if (
				msg.type === "ask" &&
				(msg.ask === "resume_task" || msg.ask === "resume_completed_task" || msg.ask === "completion_result") // Filter out the duplicate completion_result "ask" message
			) {
				return false
			}
			if (originalIndex !== -1) {
				indexMap.push(originalIndex)
			}

			return true
		})
		return { taskTimelinePropsMessages: filtered, messageIndexMap: indexMap }
	}, [messages])

	useEffect(() => {
		if (scrollableRef.current && taskTimelinePropsMessages.length > 0) {
			scrollableRef.current.scrollLeft = scrollableRef.current.scrollWidth
		}
	}, [taskTimelinePropsMessages])

	// Calculate the item size (width of block + gap)
	// const itemWidth = parseInt(BLOCK_WIDTH.replace("px", ""), 10) + parseInt(BLOCK_GAP.replace("px", ""), 10)
	const itemWidth = BLOCK_WIDTH + BLOCK_GAP

	// Virtuoso requires a reference to scroll to the end
	const virtuosoRef = useRef<any>(null)

	// Render a timeline block
	const TimelineBlock = useCallback(
		(index: number) => {
			// Show placeholder block when no items exist
			if (taskTimelinePropsMessages.length === 0 || index >= taskTimelinePropsMessages.length) {
				return (
					<div
						style={{
							width: BLOCK_WIDTH,
							height: BLOCK_WIDTH,
							backgroundColor: "#e5e5e5", // Light gray placeholder
							flexShrink: 0,
							marginRight: BLOCK_GAP,
							opacity: 0.5,
							borderRadius: taskHeaderTimelineBlockBorderRadius,
						}}
					/>
				)
			}

			const message = taskTimelinePropsMessages[index]
			const originalMessageIndex = messageIndexMap[index]

			const handleClick = () => {
				if (onBlockClick && originalMessageIndex !== undefined) {
					onBlockClick(originalMessageIndex)
				}
			}

			return (
				<TaskTimelineTooltip message={message}>
					<div
						className="hover:brightness-120"
						onClick={handleClick}
						style={{
							width: BLOCK_WIDTH,
							height: BLOCK_WIDTH,
							backgroundColor: getColor(message),
							flexShrink: 0,
							cursor: "pointer",
							marginRight: BLOCK_GAP,
							transition: "opacity 0.2s ease",
							borderRadius: taskHeaderTimelineBlockBorderRadius,
						}}
					/>
				</TaskTimelineTooltip>
			)
		},
		[taskTimelinePropsMessages, messageIndexMap, onBlockClick],
	)

	// Scroll to the end when messages change
	useEffect(() => {
		if (virtuosoRef.current && taskTimelinePropsMessages.length > 0) {
			virtuosoRef.current.scrollToIndex({
				index: taskTimelinePropsMessages.length - 1,
				align: "end",
			})
		}
	}, [taskTimelinePropsMessages])

	if (taskTimelinePropsMessages.length === 0) {
		return (
			<div
				ref={containerRef}
				style={{
					position: "relative",
					width: "100%",
					// marginBottom: "6px",
					overflow: "hidden",
				}}>
				<div
					style={{
						height: 0,
						width: "100%",
						display: "flex",
						alignItems: "center",
					}}>
					{/* <div
						style={{
							width: BLOCK_WIDTH,
							height: BLOCK_WIDTH,
							backgroundColor: COLOR_GRAY,
							borderRadius: "20%",
							opacity: 0.5,
							flexShrink: 0,
							marginRight: BLOCK_GAP,
						}}
					/> */}
				</div>
			</div>
		)
	}

	return (
		<div
			ref={containerRef}
			style={{
				position: "relative",
				width: "100%",
				height: taskTimelinePropsMessages.length > 0 ? TIMELINE_HEIGHT : 0,
				marginTop: 1,
				marginBottom: 2,
				overflow: "hidden",
				opacity: 0.7,
			}}>
			<style>
				{`
					/* Hide scrollbar for Chrome, Safari and Opera */
					.timeline-virtuoso::-webkit-scrollbar {
						display: none;
					}
					.timeline-virtuoso {
						scrollbar-width: none;
						-ms-overflow-style: none;
					}
				`}
			</style>

			<Virtuoso
				className="timeline-virtuoso"
				fixedItemHeight={itemWidth}
				horizontalDirection={true}
				increaseViewportBy={12}
				itemContent={TimelineBlock}
				ref={virtuosoRef}
				style={{
					height: TIMELINE_HEIGHT,
					width: "100%",
					//overflowY: "hidden",
				}}
				totalCount={Math.max(1, taskTimelinePropsMessages.length)}
			/>
		</div>
	)
}

export default TaskTimeline
