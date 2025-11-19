import { StringRequest } from "@shared/proto/cline/common"
import { useRef, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { UiServiceClient } from "@/services/grpc-client"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import AutoApproveModal from "./AutoApproveModal"
import { ACTION_METADATA } from "./constants"

interface AutoApproveBarProps {
	style?: React.CSSProperties
}

const AutoApproveBar = ({ style }: AutoApproveBarProps) => {
	const { autoApprovalSettings, yoloModeToggled, navigateToSettings } = useExtensionState()

	const [isModalVisible, setIsModalVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	const handleNavigateToFeatures = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		navigateToSettings()

		setTimeout(async () => {
			try {
				await UiServiceClient.scrollToSettings(StringRequest.create({ value: "features" }))
			} catch (error) {
				console.error("Error scrolling to features settings:", error)
			}
		}, 300)
	}

	const getEnabledActionsText = () => {
		const baseClasses = isModalVisible
			? "text-foreground truncate"
			: "text-muted-foreground group-hover:text-foreground truncate"
		const enabledActionsNames = Object.keys(autoApprovalSettings.actions).filter(
			(key) => autoApprovalSettings.actions[key as keyof typeof autoApprovalSettings.actions],
		)
		const enabledActions = enabledActionsNames.map((action) => {
			return ACTION_METADATA.flatMap((a) => [a, a.subAction]).find((a) => a?.id === action)
		})

		// Filter out parent actions if their subaction is also enabled (show only subaction)
		const actionsToShow = enabledActions.filter((action) => {
			if (!action?.shortName) {
				return false
			}

			// If this is a parent action and its subaction is enabled, skip it
			if (action.subAction?.id && enabledActionsNames.includes(action.subAction.id)) {
				return false
			}

			return true
		})

		if (actionsToShow.length === 0) {
			return <span className={baseClasses}>None</span>
		}

		return (
			<span className={baseClasses}>
				{actionsToShow.map((action, index) => (
					<span key={action?.id}>
						{action?.shortName}
						{index < actionsToShow.length - 1 && ", "}
					</span>
				))}
			</span>
		)
	}

	const borderColor = `color-mix(in srgb, ${getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND)} 20%, transparent)`
	const borderGradient = `linear-gradient(to bottom, ${borderColor} 0%, transparent 50%)`
	const bgGradient = `linear-gradient(to bottom, color-mix(in srgb, var(--vscode-sideBar-background) 96%, white) 0%, transparent 80%)`

	// If YOLO mode is enabled, show disabled message
	if (yoloModeToggled) {
		return (
			<div
				className="mx-3.5 select-none break-words relative"
				style={{
					borderTop: `0.5px solid ${borderColor}`,
					borderRadius: "4px 4px 0 0",
					background: bgGradient,
					opacity: 0.5,
					...style,
				}}>
				{/* Left border gradient */}
				<div
					className="absolute left-0 pointer-events-none"
					style={{
						width: 0.5,
						top: 3,
						height: "100%",
						background: borderGradient,
					}}
				/>
				{/* Right border gradient */}
				<div
					className="absolute right-0 top-0 pointer-events-none"
					style={{
						width: 0.5,
						top: 3,
						height: "100%",
						background: borderGradient,
					}}
				/>

				<div className="pt-4 pb-3.5 px-3.5">
					<div className="text-sm mb-1">Auto-approve: YOLO</div>
					<div className="text-muted-foreground text-xs">
						YOLO mode is enabled.{" "}
						<span className="underline cursor-pointer hover:text-foreground" onClick={handleNavigateToFeatures}>
							Disable it in Settings
						</span>
						.
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="px-[10px] select-none">
			{/* <HeroTooltip content="Quick Access Auto-Approve Settings" delay={1000}> */}
			<div
				className="cursor-pointer py-[5px] pr-[0px] flex items-center justify-between gap-[8px]"
				onClick={() => {
					setIsModalVisible((prev) => !prev)
				}}
				ref={buttonRef}>
				<div
					className="flex flex-nowrap items-center overflow-x-auto gap-[3px] whitespace-nowrap"
					style={{
						opacity: isModalVisible ? 1 : 0.7,
						fontSize: "0.88em",
						msOverflowStyle: "none",
						scrollbarWidth: "none",
						WebkitOverflowScrolling: "touch",
					}}>
					<span>Auto:</span>
					{(() => {
						if (!autoApprovalSettings.enabled) {
							return " off"
						}
						getEnabledActionsText()
					})()}
				</div>
				<div>
					{isModalVisible ? (
						<span className="codicon codicon-chevron-down" />
					) : (
						<span className="codicon codicon-chevron-up" style={{ opacity: 0.6 }} />
					)}
				</div>
			</div>
			{/* </HeroTooltip> */}

			<AutoApproveModal
				ACTION_METADATA={ACTION_METADATA}
				buttonRef={buttonRef}
				isVisible={isModalVisible}
				setIsVisible={setIsModalVisible}
			/>
		</div>
	)
}

export default AutoApproveBar
