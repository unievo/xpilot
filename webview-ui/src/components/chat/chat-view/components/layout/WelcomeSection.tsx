import React from "react"
import Announcement from "@/components/chat/Announcement"
import { CURRENT_INFO_BANNER_VERSION } from "@/components/common/InfoBanner"
import HistoryPreview from "@/components/history/HistoryPreview"
import HomeHeader from "@/components/welcome/HomeHeader"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { WelcomeSectionProps } from "../../types/chatTypes"

/**
 * Welcome section shown when there's no active task
 * Includes info banner, announcements, home header, and history preview
 */
export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
	showAnnouncement,
	hideAnnouncement,
	showHistoryView,
	telemetrySetting,
	version,
	taskHistory,
	shouldShowQuickWins,
}) => {
	const { lastDismissedInfoBannerVersion } = useExtensionState()

	const shouldShowInfoBanner = lastDismissedInfoBannerVersion < CURRENT_INFO_BANNER_VERSION

	return (
		<>
			<div
				style={{
					flex: "1 1 0",
					minHeight: 0,
					overflowY: "auto",
					display: "flex",
					flexDirection: "column",
					paddingBottom: "1px",
					marginLeft: "-6px",
					scrollbarGutter: "stable",
				}}>
				{/* {enableTelemetrySettings && telemetrySetting === "unset" && <TelemetryBanner />} */}
				{/* {shouldShowInfoBanner && <InfoBanner />} */}
				{showAnnouncement && <Announcement hideAnnouncement={hideAnnouncement} version={version} />}
				<HomeHeader /> {/* shouldShowQuickWins={shouldShowQuickWins} /> */}
				{/* {!shouldShowQuickWins && taskHistory.length > 0 && */} <HistoryPreview showHistoryView={showHistoryView} />
			</div>
			{/* <SuggestedTasks shouldShowQuickWins={shouldShowQuickWins} /> */}
		</>
	)
}
