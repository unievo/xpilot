import { useRef, useState, useMemo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAutoApproveActions } from "@/hooks/useAutoApproveActions"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import AutoApproveMenuItem from "./AutoApproveMenuItem"
import AutoApproveModal from "./AutoApproveModal"
import { ACTION_METADATA, NOTIFICATIONS_SETTING } from "./constants"
import { chatTextAreaBackground } from "@/components/theme"
import HeroTooltip from "@/components/common/HeroTooltip"

interface AutoApproveBarProps {
	style?: React.CSSProperties
}

const AutoApproveBar = ({ style }: AutoApproveBarProps) => {
	const { autoApprovalSettings } = useExtensionState()
	const { isChecked, isFavorited, updateAction } = useAutoApproveActions()

	const [isModalVisible, setIsModalVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	const favorites = useMemo(() => autoApprovalSettings.favorites || [], [autoApprovalSettings.favorites])

	// Render a favorited item with a checkbox
	const renderFavoritedItem = (favId: string) => {
		const actions = [...ACTION_METADATA.flatMap((a) => [a, a.subAction]), NOTIFICATIONS_SETTING]
		const action = actions.find((a) => a?.id === favId)
		if (!action) return null

		return (
			<AutoApproveMenuItem
				action={action}
				isChecked={isChecked}
				isFavorited={isFavorited}
				onToggle={updateAction}
				condensed={true}
				showIcon={false}
			/>
		)
	}

	const getQuickAccessItems = () => {
		const notificationsEnabled = autoApprovalSettings.enableNotifications
		const enabledActionsNames = Object.keys(autoApprovalSettings.actions).filter(
			(key) => autoApprovalSettings.actions[key as keyof typeof autoApprovalSettings.actions],
		)
		const enabledActions = enabledActionsNames.map((action) => {
			return ACTION_METADATA.flatMap((a) => [a, a.subAction]).find((a) => a?.id === action)
		})

		let minusFavorites = enabledActions.filter((action) => !favorites.includes(action?.id ?? "") && action?.shortName)

		if (notificationsEnabled) {
			minusFavorites.push(NOTIFICATIONS_SETTING)
		}

		return [
			...favorites.map((favId) => renderFavoritedItem(favId)),
			// minusFavorites.length > 0 ? (
			// 	<span className="text-[color:var(--vscode-foreground-muted)] pl-[1px] opacity-70" key="separator">
			// 		-
			// 	</span>
			// ) : null,
			...minusFavorites.map((action, index) => (
				<span className="text-[color:var(--vscode-foreground-muted)] opacity-70" key={action?.id}>
					{action?.shortName}
					{index < minusFavorites.length - 1 && ""}
				</span>
			)),
		]
	}

	return (
		<div
			className="px-[10px] mt-[10px] mx-[8px] -mb-2 select-none rounded-[10px_10px_0_0]"
			style={{
				borderTop: `0.5px solid color-mix(in srgb, ${getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND)} 20%, transparent)`,
				overflowY: "auto",
				backgroundColor: chatTextAreaBackground,
				//backgroundColor: isModalVisible ? chatTextAreaBackgroundActive : chatTextAreaBackground,
				...style,
			}}>
			<HeroTooltip content="Quick Access Auto-Approve Settings">
				<div
					ref={buttonRef}
					className="cursor-pointer py-[8px] pr-[0px] flex items-center justify-between gap-[8px]"
					onClick={() => {
						setIsModalVisible((prev) => !prev)
					}}>
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
							if (!autoApprovalSettings.enabled) return " off"
							const items = getQuickAccessItems()
							return items.length > 0 ? items : " none"
						})()}
					</div>
					{isModalVisible ? (
						<span className="codicon codicon-chevron-down" />
					) : (
						<span className="codicon codicon-chevron-up" style={{ opacity: 0.6 }} />
					)}
				</div>
			</HeroTooltip>

			<AutoApproveModal
				isVisible={isModalVisible}
				setIsVisible={setIsModalVisible}
				buttonRef={buttonRef}
				ACTION_METADATA={ACTION_METADATA}
				NOTIFICATIONS_SETTING={NOTIFICATIONS_SETTING}
			/>
		</div>
	)
}

export default AutoApproveBar
