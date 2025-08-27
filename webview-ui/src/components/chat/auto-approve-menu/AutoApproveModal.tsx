import { agentName } from "@shared/Configuration"
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useRef, useState } from "react"
import { useClickAway, useWindowSize } from "react-use"
import HeroTooltip from "@/components/common/HeroTooltip"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAutoApproveActions } from "@/hooks/useAutoApproveActions"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import AutoApproveMenuItem from "./AutoApproveMenuItem"
import { ActionMetadata } from "./types"

const breakpoint = 500

interface AutoApproveModalProps {
	isVisible: boolean
	setIsVisible: (visible: boolean) => void
	buttonRef: React.RefObject<HTMLDivElement>
	ACTION_METADATA: ActionMetadata[]
	NOTIFICATIONS_SETTING: ActionMetadata
}

const AutoApproveModal: React.FC<AutoApproveModalProps> = ({
	isVisible,
	setIsVisible,
	buttonRef,
	ACTION_METADATA,
	NOTIFICATIONS_SETTING,
}) => {
	const { autoApprovalSettings } = useExtensionState()
	const { isChecked, isFavorited, toggleFavorite, updateAction, updateMaxRequests } = useAutoApproveActions()

	const modalRef = useRef<HTMLDivElement>(null)
	const itemsContainerRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [_arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)
	const [containerWidth, setContainerWidth] = useState(0)

	useClickAway(modalRef, (e) => {
		// Skip if click was on the button that toggles the modal
		if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
			return
		}
		setIsVisible(false)
		// Focus the textarea after closing the modal by finding it directly
		setTimeout(() => {
			const textarea = document.querySelector('[data-testid="chat-input"]') as HTMLTextAreaElement
			if (textarea) {
				textarea.focus()
			}
		}, 0)
	})

	// Global Esc key handler for auto-approve modal
	useEffect(() => {
		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isVisible) {
				event.preventDefault()
				event.stopPropagation()
				setIsVisible(false)
				// Focus the textarea after closing the modal by finding it directly
				setTimeout(() => {
					const textarea = document.querySelector('[data-testid="chat-input"]') as HTMLTextAreaElement
					if (textarea) {
						textarea.focus()
					}
				}, 0)
			}
		}

		if (isVisible) {
			document.addEventListener("keydown", handleGlobalKeyDown)
		}

		return () => {
			document.removeEventListener("keydown", handleGlobalKeyDown)
		}
	}, [isVisible, setIsVisible])

	// Calculate positions for modal and arrow
	useEffect(() => {
		if (isVisible && buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			const buttonCenter = buttonRect.left + buttonRect.width / 2
			const rightPosition = document.documentElement.clientWidth - buttonCenter - 5

			setArrowPosition(rightPosition)
			setMenuPosition(buttonRect.top + 1)
		}
	}, [isVisible, viewportWidth, viewportHeight, buttonRef])

	// Track container width for responsive layout
	useEffect(() => {
		if (!isVisible) {
			return
		}

		const updateWidth = () => {
			if (itemsContainerRef.current) {
				setContainerWidth(itemsContainerRef.current.offsetWidth)
			}
		}

		// Initial measurement
		updateWidth()

		// Set up resize observer
		const resizeObserver = new ResizeObserver(updateWidth)
		if (itemsContainerRef.current) {
			resizeObserver.observe(itemsContainerRef.current)
		}

		// Clean up
		return () => {
			resizeObserver.disconnect()
		}
	}, [isVisible])

	if (!isVisible) {
		return null
	}

	return (
		<div ref={modalRef}>
			<div
				className="fixed left-[16px] right-[16px] border border-[var(--vscode-editorGroup-border)] p-2.5 rounded z-[1000] overflow-hidden"
				style={{
					bottom: `calc(100vh - ${menuPosition}px + 1px)`,
					background: "var(--vscode-input-background)",
					maxHeight: "calc(100vh - 100px)",
					overscrollBehavior: "contain",
					borderRadius: "4px 4px 0 0",
				}}>
				{/* <div
					className="fixed w-[10px] h-[10px] z-[-1] rotate-45 border-r border-b border-[var(--vscode-editorGroup-border)]"
					style={{
						bottom: `calc(100vh - ${menuPosition}px)`,
						right: arrowPosition,
						background: "var(--vscode-input-background)",
					}}
				/> */}

				<div className="flex justify-between items-center mb-3">
					{/* <div className="text-[color:var(--vscode-foreground)] font-bold">Settings</div> */}
					<HeroTooltip
						content="Auto-approve allows performing the following actions without asking for permission. AI can make mistakes, use with caution."
						placement="top">
						<div className="mt-0">
							<div className="text-[color:var(--vscode-foreground)] text-sm font-medium">
								Auto-approve settings{" "}
								<span className="codicon codicon-info" style={{ opacity: 0.6, fontSize: "12px" }}></span>
							</div>
						</div>
					</HeroTooltip>
					<VSCodeButton
						appearance="icon"
						onClick={() => {
							setIsVisible(false)
							// Focus the textarea after closing the modal by finding it directly
							setTimeout(() => {
								const textarea = document.querySelector('[data-testid="chat-input"]') as HTMLTextAreaElement
								if (textarea) {
									textarea.focus()
								}
							}, 0)
						}}>
						<span className="codicon codicon-close text-[10px]"></span>
					</VSCodeButton>
				</div>

				<div
					className="relative mb-3"
					ref={itemsContainerRef}
					style={{
						columnCount: containerWidth > breakpoint ? 2 : 1,
						columnGap: "4px",
					}}>
					{/* Vertical separator line - only visible in two-column mode */}
					{containerWidth > breakpoint && (
						<div
							className="absolute left-1/2 top-0 bottom-0 w-[0.5px] opacity-20"
							style={{
								background: getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND),
								transform: "translateX(-50%)", // Center the line
							}}
						/>
					)}

					{/* All items in a single list - CSS Grid will handle the column distribution */}
					{ACTION_METADATA.map((action) => (
						<AutoApproveMenuItem
							action={action}
							isChecked={isChecked}
							isFavorited={isFavorited}
							key={action.id}
							onToggle={updateAction}
							onToggleFavorite={toggleFavorite}
						/>
					))}
				</div>

				{/* <div className="mb-2.5">
					<span className="text-[color:var(--vscode-foreground)] font-medium">Quick Settings</span>
				</div> */}

				<AutoApproveMenuItem
					action={NOTIFICATIONS_SETTING}
					isChecked={isChecked}
					isFavorited={isFavorited}
					key={NOTIFICATIONS_SETTING.id}
					onToggle={updateAction}
					onToggleFavorite={toggleFavorite}
				/>

				<HeroTooltip
					content={`${agentName} will automatically make this many API requests before asking for approval to proceed with the task.`}
					placement="top">
					<div className="flex items-center pl-7.5 my-0">
						<span className="codicon codicon-settings text-[#CCCCCC] text-[14px]" />
						<span className="text-[#CCCCCC] text-xs font-medium ml-2">Max Requests:</span>
						<span className="max-w-10 ml-1">
							<VSCodeTextField
								onInput={async (e) => {
									const input = e.target as HTMLInputElement
									// Remove any non-numeric characters
									input.value = input.value.replace(/[^0-9]/g, "")
									const value = parseInt(input.value, 10)
									if (!Number.isNaN(value) && value > 0) {
										await updateMaxRequests(value)
									}
								}}
								onKeyDown={(e) => {
									// Prevent non-numeric keys (except for backspace, delete, arrows)
									if (
										!/^\d$/.test(e.key) &&
										!["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)
									) {
										e.preventDefault()
									}
								}}
								value={autoApprovalSettings.maxRequests.toString()}
							/>
						</span>
					</div>
				</HeroTooltip>
			</div>
		</div>
	)
}

export default AutoApproveModal
