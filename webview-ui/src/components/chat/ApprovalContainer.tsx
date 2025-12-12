import {
	approvalContainerBorder,
	approvalMessageColor,
	approvalMessageFontSize,
	approvalMessageMargin,
	defaultBorderRadius,
	pulsate,
	pulseDuration,
	rowHeaderGap,
} from "@components/config"
import { memo, useEffect, useMemo, useState } from "react"
import styled, { css } from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"

const approvalContainerPadding = 3
const approvalBorderPadding = 2
const approvalDebounce = 500

const ApprovalContainerStyled = styled.div<{ $showApproval: boolean }>`
	border: ${({ $showApproval }) => ($showApproval ? approvalContainerBorder : "")};
	animation: ${({ $showApproval }) => ($showApproval ? css`${pulsate} ${pulseDuration} infinite` : "none")};
	border-radius: ${defaultBorderRadius}px;
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
	const [showApproval, setShowApproval] = useState(false)
	const executing = isExecuting ?? false

	if (executing && !hasExecuted) {
		setHasExecuted(true)
	}

	const requestApproval = approvalRequested ?? false

	const shouldShowApproval = useMemo(() => {
		const canAutoApprove = autoApprovalSettings.enabled && autoApproveSetting && (autoApproveToolSetting ?? true)

		return !hasExecuted && isLastProcessing && !executing && (requestApproval || !canAutoApprove)
	}, [
		isLastProcessing,
		executing,
		requestApproval,
		autoApprovalSettings.enabled,
		autoApproveSetting,
		autoApproveToolSetting,
		hasExecuted,
	])

	useEffect(() => {
		if (shouldShowApproval) {
			if (requestApproval) {
				setShowApproval(true)
				return
			}
			// Delay showing the approval to prevent flicker from auto-approval settings changing while loading
			const timer = setTimeout(() => setShowApproval(true), approvalDebounce)
			return () => clearTimeout(timer)
		}

		setShowApproval(false)
	}, [shouldShowApproval, requestApproval])

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
					<span style={{ marginTop: 1 }}>
						{approvalRequested ? "Explicit approval requested by the model" : "Requires approval"}
					</span>
				</div>
			)}
		</ApprovalContainerStyled>
	)
}

export const ApprovalContainer = memo(ApprovalContainerComponent)
export default ApprovalContainer
