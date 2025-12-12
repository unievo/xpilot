import React from "react"
import Announcement from "@/components/chat/Announcement"
import { CURRENT_CLI_BANNER_VERSION } from "@/components/common/CliInstallBanner"
import { CURRENT_INFO_BANNER_VERSION } from "@/components/common/InfoBanner"
import { CURRENT_MODEL_BANNER_VERSION } from "@/components/common/NewModelBanner"
import HistoryPreview from "@/components/history/HistoryPreview"
import HomeHeader from "@/components/welcome/HomeHeader"
import { PLATFORM_CONFIG, PlatformType } from "@/config/platform.config"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { isMacOSOrLinux } from "@/utils/platformUtils"
import { WelcomeSectionProps } from "../../types/chatTypes"

/**
 * Welcome section shown when there's no active task
 * Includes info banner, announcements, home header, and history preview
 */
export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
	showAnnouncement,
	hideAnnouncement,
	showHistoryView,
	version,
	taskHistory,
	shouldShowQuickWins,
}) => {
	const { lastDismissedInfoBannerVersion, lastDismissedCliBannerVersion, lastDismissedModelBannerVersion } = useExtensionState()

	const shouldShowInfoBanner = lastDismissedInfoBannerVersion < CURRENT_INFO_BANNER_VERSION
	const shouldShowNewModelBanner = lastDismissedModelBannerVersion < CURRENT_MODEL_BANNER_VERSION

	// Show CLI banner if not dismissed and platform is VSCode (not JetBrains/standalone)
	const shouldShowCliBanner =
		isMacOSOrLinux() &&
		PLATFORM_CONFIG.type === PlatformType.VSCODE &&
		lastDismissedCliBannerVersion < CURRENT_CLI_BANNER_VERSION

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
				{/* {shouldShowNewModelBanner && <NewModelBanner />} */}
				{/* {shouldShowCliBanner && <CliInstallBanner />} */}
				<HomeHeader /> {/* shouldShowQuickWins={shouldShowQuickWins} /> */}
				{/* {!shouldShowQuickWins && taskHistory.length > 0 && */}
				<HistoryPreview showHistoryView={showHistoryView} />
			</div>
			{/* <SuggestedTasks shouldShowQuickWins={shouldShowQuickWins} /> */}
		</>
	)
}
