import { VSCodeButton, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useRef, useState } from "react"
import { useClickAway, useWindowSize } from "react-use"
import HeroTooltip from "@/components/common/HeroTooltip"
import { chatInputSectionBackground, chatInputSectionBorder, menuTopBorder } from "@/components/config"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAutoApproveActions } from "@/hooks/useAutoApproveActions"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import AutoApproveMenuItem from "./AutoApproveMenuItem"
import { updateAutoApproveSettings } from "./AutoApproveSettingsAPI"
import { ActionMetadata } from "./types"

const breakpoint = 500

interface AutoApproveModalProps {
	isVisible: boolean
	setIsVisible: (visible: boolean) => void
	buttonRef: React.RefObject<HTMLDivElement>
	ACTION_METADATA: ActionMetadata[]
}

const AutoApproveModal: React.FC<AutoApproveModalProps> = ({ isVisible, setIsVisible, buttonRef, ACTION_METADATA }) => {
	const { autoApprovalSettings } = useExtensionState()
	const { isChecked, updateAction } = useAutoApproveActions()
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

	// Calculate safe positioning to prevent overflow while preserving original position
	const calculateModalStyle = () => {
		// Original positioning: bottom: calc(100vh - ${menuPosition}px + 6px)
		const originalBottom = viewportHeight - menuPosition + 1.5

		// Calculate the available space from the button to the top of the viewport
		const availableSpace = viewportHeight - originalBottom

		// Set a minimum top margin to prevent the modal from touching the top edge
		const minTopMargin = 15

		// Calculate the maximum height the modal can have
		// Use the full available space minus the top margin, but also respect the original constraint
		const maxAvailableHeight = availableSpace - minTopMargin
		const originalMaxHeight = viewportHeight - 100

		// Use the smaller of the two to ensure we don't overflow but still use full height when possible
		let finalMaxHeight: number

		if (menuPosition <= minTopMargin) {
			// Button is very close to the top, use all available space
			finalMaxHeight = maxAvailableHeight
		} else {
			// Normal case: use the original max height unless it would cause overflow
			finalMaxHeight = Math.min(originalMaxHeight, maxAvailableHeight)
		}

		return {
			bottom: `${originalBottom}px`,
			maxHeight: `${Math.max(finalMaxHeight, 200)}px`, // Ensure minimum usable height
			background: chatInputSectionBackground,
			overscrollBehavior: "contain" as const,
			border: chatInputSectionBorder,
			borderTop: menuTopBorder,
		}
	}

	return (
		<div ref={modalRef}>
			{/* Expanded menu content - renders directly below the bar */}
			<div
				className={`fixed left-[13px] right-[14px] p-2.5 rounded-t-lg z-[1000] overflow-hidden`}
				style={calculateModalStyle()}>
				<div className="flex justify-between items-center mb-3">
					{/* <div className="text-[color:var(--vscode-foreground)] font-bold">Settings</div> */}
					<HeroTooltip
						content="Perform the following actions without asking for permission. AI can make mistakes, use with caution."
						placement="top">
						<div className="mt-0">
							<div className="text-[color:var(--vscode-foreground)] font-medium">
								Auto-approve{" "}
								<span
									className="codicon codicon-info"
									style={{ cursor: "pointer", opacity: 0.6, fontSize: "12px" }}></span>
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
						<AutoApproveMenuItem action={action} isChecked={isChecked} key={action.id} onToggle={updateAction} />
					))}
				</div>

				{/* Separator line */}
				<div
					style={{
						height: "0.5px",
						background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
						opacity: 0.1,
						margin: "8px 0",
					}}
				/>

				{/* Notifications toggle */}
				<div className="flex items-center gap-2">
					<VSCodeCheckbox
						checked={autoApprovalSettings.enableNotifications}
						onChange={async (e: any) => {
							const checked = e.target.checked === true
							await updateAutoApproveSettings({
								...autoApprovalSettings,
								version: (autoApprovalSettings.version ?? 1) + 1,
								enableNotifications: checked,
							})
						}}>
						<span className="text-sm">Enable notifications</span>
					</VSCodeCheckbox>
				</div>
			</div>
		</div>
	)
}

export default AutoApproveModal
