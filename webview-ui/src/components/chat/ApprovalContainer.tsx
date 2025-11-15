import {
	approvalContainerBorder,
	approvalMessageColor,
	approvalMessageFontSize,
	approvalMessageMargin,
	defaultBorderRadius,
	defaultDuration,
	pulsate,
	pulseDuration,
	rowHeaderGap,
} from "@components/config"
import { memo, useMemo, useState } from "react"
import styled, { css } from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"

const approvalContainerPadding = 3
const approvalBorderPadding = 2

const ApprovalContainerStyled = styled.div<{ $showApproval: boolean }>`
	border: ${({ $showApproval }) => ($showApproval ? approvalContainerBorder : "")};
	animation: ${({ $showApproval }) => ($showApproval ? css`${pulsate} ${pulseDuration} infinite` : "none")};
	border-radius: ${defaultBorderRadius}px;
	transition: all ${defaultDuration}ms;
	min-width: 0;
	margin: ${({ $showApproval }) => ($showApproval ? -approvalBorderPadding : 0)}px;
	margin: ${approvalMessageMargin};
	padding: ${({ $showApproval }) => ($showApproval ? approvalBorderPadding : 0)}px;
	padding-top: ${({ $showApproval }) => ($showApproval ? approvalBorderPadding : 0)}px;
`

interface ApprovalContainerProps {
	isLastProcessing: boolean
	autoApproveSetting?: boolean
	autoApproveToolSetting?: boolean
	approvalRequested?: boolean
	isExecuting?: boolean
	showMessage?: boolean
	children?: React.ReactNode
}

const ApprovalContainerComponent: React.FC<ApprovalContainerProps> = ({
	isLastProcessing,
	autoApproveSetting,
	autoApproveToolSetting,
	approvalRequested,
	isExecuting,
	showMessage = true,
	children,
}) => {
	const { autoApprovalSettings } = useExtensionState()
	const [hasExecuted, setHasExecuted] = useState(false)
	const executing = isExecuting ?? false

	if (executing && !hasExecuted) {
		setHasExecuted(true)
	}

	const requestApproval = approvalRequested ?? false

	const showApproval = useMemo(
		() =>
			!hasExecuted &&
			isLastProcessing &&
			!executing &&
			(requestApproval || !(autoApprovalSettings.enabled && autoApproveSetting && (autoApproveToolSetting ?? true))),
		[isLastProcessing, executing, requestApproval, autoApprovalSettings.enabled, autoApproveSetting, autoApproveToolSetting],
	)

	return (
		<ApprovalContainerStyled $showApproval={showApproval}>
			{children}
			{showApproval && showMessage && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						overflow: "hidden",
						gap: rowHeaderGap,
						paddingTop: `${approvalContainerPadding}px`,
						paddingBottom: `${approvalContainerPadding - 1}px`,
						paddingLeft: `${approvalContainerPadding - 1}px`,
						fontSize: approvalMessageFontSize,
						color: approvalMessageColor,
					}}>
					<i className="codicon codicon-lock" style={{ fontSize: approvalMessageFontSize }}></i>
					<span style={{ marginTop: 1 }}>Requires approval</span>
				</div>
			)}
		</ApprovalContainerStyled>
	)
}

export const ApprovalContainer = memo(ApprovalContainerComponent)
export default ApprovalContainer
