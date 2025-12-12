import { rowIconFontSize, warningColor } from "@components/config"
import React from "react"
import { ClineError, ClineErrorType } from "../../../../src/services/error/ClineError"
import { ProgressIndicator } from "./ChatRow"

interface ErrorBlockTitleProps {
	cost?: number
	apiReqCancelReason?: string
	apiRequestFailedMessage?: string
	retryStatus?: {
		attempt: number
		maxAttempts: number
		delaySec?: number
		errorSnippet?: string
	}
	apiRequestCompletedVisible?: boolean
}

export const ErrorBlockTitle = ({
	cost,
	apiReqCancelReason,
	apiRequestFailedMessage,
	retryStatus,
}: ErrorBlockTitleProps): [React.ReactElement, React.ReactElement] => {
	const getIconSpan = (iconName: string, colorClass: string) => (
		<div className="flex items-center justify-center">
			<span className={`codicon codicon-${iconName} text-base ${colorClass}`} style={{ fontSize: rowIconFontSize }}></span>
		</div>
	)

	const icon =
		apiReqCancelReason != null ? (
			apiReqCancelReason === "user_cancelled" ? (
				getIconSpan("error", "text-(--vscode-descriptionForeground)")
			) : (
				getIconSpan("error", `text-[${warningColor}]`)
			)
		) : cost != null ? (
			getIconSpan("check", "text-(--vscode-charts-green)")
		) : apiRequestFailedMessage ? (
			getIconSpan("error", `text-[${warningColor}]`)
		) : (
			<ProgressIndicator />
		)

	const title = (() => {
		// Default loading state
		const details = { title: "Working...", classNames: [""] }
		// Handle cancellation states first
		if (apiReqCancelReason === "user_cancelled") {
			details.title = "Request Cancelled"
			// details.classNames.push("text-(--vscode-foreground)")
		} else if (apiReqCancelReason != null) {
			details.title = "API Request Failed"
			details.classNames.push(`text-[${warningColor}]`)
		} else if (cost != null) {
			// Handle completed request
			details.title = "Completed"
			// details.classNames.push("text-(--vscode-foreground)")
		} else if (apiRequestFailedMessage) {
			// Handle failed request
			const clineError = ClineError.parse(apiRequestFailedMessage)
			const titleText = clineError?.isErrorType(ClineErrorType.Balance) ? "Credit Limit Reached" : "Request Failed"
			details.title = titleText
			details.classNames.push(`text-[${warningColor}]`)
		} else if (retryStatus) {
			// Handle retry state
			details.title = "API Request"
			details.classNames.push("text-(--vscode-foreground)")
		}

		return <span className={details.classNames.join(" ")}>{details.title}</span>
	})()

	return [icon, title]
}
