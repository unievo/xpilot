import {
	checkPointContainerHoverOpacity,
	checkPointContainerMargin,
	checkPointContainerMinHeight,
	checkPointContainerNormalOpacity,
	checkPointIconSize,
	checkPointLineNormalOpacity,
	defaultBorderRadius,
} from "@components/config"
import { flip, offset, shift, useFloating } from "@floating-ui/react"
import { CheckpointRestoreRequest } from "@shared/proto/cline/checkpoints"
import { Int64Request } from "@shared/proto/cline/common"
import { ClineCheckpointRestore } from "@shared/WebviewMessage"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import styled from "styled-components"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CheckpointsServiceClient } from "@/services/grpc-client"

interface CheckmarkControlProps {
	messageTs?: number
	isCheckpointCheckedOut?: boolean
}

export const CheckmarkControl = ({ messageTs, isCheckpointCheckedOut }: CheckmarkControlProps) => {
	const [compareDisabled, setCompareDisabled] = useState(false)
	const [_restoreTaskDisabled, setRestoreTaskDisabled] = useState(false)
	const [restoreWorkspaceDisabled, setRestoreWorkspaceDisabled] = useState(false)
	const [_restoreBothDisabled, setRestoreBothDisabled] = useState(false)
	const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
	const { onRelinquishControl } = useExtensionState()

	// Debounce
	const closeMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const scheduleCloseRestore = useCallback(() => {
		if (closeMenuTimeoutRef.current) {
			clearTimeout(closeMenuTimeoutRef.current)
		}
		closeMenuTimeoutRef.current = setTimeout(() => {
			setShowRestoreConfirm(false)
		}, 350)
	}, [])

	const cancelCloseRestore = useCallback(() => {
		if (closeMenuTimeoutRef.current) {
			clearTimeout(closeMenuTimeoutRef.current)
			closeMenuTimeoutRef.current = null
		}
	}, [])

	// Debounce cleanup
	useEffect(() => {
		return () => {
			if (closeMenuTimeoutRef.current) {
				clearTimeout(closeMenuTimeoutRef.current)
				closeMenuTimeoutRef.current = null
			}
		}
	}, [showRestoreConfirm])

	// Clear "Restore Files" button when checkpoint is no longer checked out
	useEffect(() => {
		if (!isCheckpointCheckedOut && restoreWorkspaceDisabled) {
			setRestoreWorkspaceDisabled(false)
		}
	}, [isCheckpointCheckedOut, restoreWorkspaceDisabled])

	const { refs, floatingStyles, update, placement } = useFloating({
		placement: "bottom-end",
		middleware: [
			offset({
				mainAxis: 8,
				crossAxis: 10,
			}),
			flip(),
			shift(),
		],
	})

	useEffect(() => {
		const handleScroll = () => {
			update()
		}
		window.addEventListener("scroll", handleScroll, true)
		return () => window.removeEventListener("scroll", handleScroll, true)
	}, [update])

	useEffect(() => {
		if (showRestoreConfirm) {
			update()
		}
	}, [showRestoreConfirm, update])

	// Use the onRelinquishControl hook instead of message event
	useEffect(() => {
		return onRelinquishControl(() => {
			setCompareDisabled(false)
			setRestoreTaskDisabled(false)
			setRestoreWorkspaceDisabled(false)
			setRestoreBothDisabled(false)
			setShowRestoreConfirm(false)
		})
	}, [onRelinquishControl])

	const handleRestoreTask = async () => {
		setRestoreTaskDisabled(true)
		try {
			const restoreType: ClineCheckpointRestore = "task"
			await CheckpointsServiceClient.checkpointRestore(
				CheckpointRestoreRequest.create({
					number: messageTs,
					restoreType,
				}),
			)
			setShowRestoreConfirm(false)
		} catch (err) {
			console.error("Checkpoint restore task error:", err)
			setRestoreTaskDisabled(false)
		}
	}

	const handleRestoreWorkspace = async () => {
		setRestoreWorkspaceDisabled(true)
		try {
			const restoreType: ClineCheckpointRestore = "workspace"
			await CheckpointsServiceClient.checkpointRestore(
				CheckpointRestoreRequest.create({
					number: messageTs,
					restoreType,
				}),
			)
			setShowRestoreConfirm(false)
		} catch (err) {
			console.error("Checkpoint restore workspace error:", err)
			setRestoreWorkspaceDisabled(false)
		}
	}

	const handleRestoreBoth = async () => {
		setRestoreBothDisabled(true)
		try {
			const restoreType: ClineCheckpointRestore = "taskAndWorkspace"
			await CheckpointsServiceClient.checkpointRestore(
				CheckpointRestoreRequest.create({
					number: messageTs,
					restoreType,
				}),
			)
			setShowRestoreConfirm(false)
		} catch (err) {
			console.error("Checkpoint restore both error:", err)
			setRestoreBothDisabled(false)
		}
	}

	const handleMouseEnter = () => {
		cancelCloseRestore()
	}

	const handleMouseLeave = () => {
		scheduleCloseRestore()
	}

	const handleControlsMouseEnter = () => {
		cancelCloseRestore()
	}

	const handleControlsMouseLeave = () => {
		scheduleCloseRestore()
	}

	return (
		<Container
			$isCheckedOut={isCheckpointCheckedOut}
			isMenuOpen={showRestoreConfirm}
			onMouseEnter={handleControlsMouseEnter}
			onMouseLeave={handleControlsMouseLeave}>
			{/* <i
				className="codicon codicon-bookmark"
				style={{
					color: isCheckpointCheckedOut ? "var(--vscode-textLink-foreground)" : "var(--vscode-descriptionForeground)",
					fontSize: rowIconFontSize,
					flexShrink: 0,
				}}
			/> */}
			<DottedLine $isCheckedOut={isCheckpointCheckedOut} className="hover-show-inverse" />
			<div className="hover-content">
				<Label $isCheckedOut={isCheckpointCheckedOut}>
					{isCheckpointCheckedOut ? "Checkpoint (restored)" : "Checkpoint"}
				</Label>
				<DottedLine $isCheckedOut={isCheckpointCheckedOut} />
				<ButtonGroup>
					<CustomButton
						$isCheckedOut={isCheckpointCheckedOut}
						disabled={compareDisabled}
						//style={{ cursor: compareDisabled ? "not-allowed" : "pointer" }}
						onClick={async () => {
							setCompareDisabled(true)
							try {
								await CheckpointsServiceClient.checkpointDiff(
									Int64Request.create({
										value: messageTs,
									}),
								)
							} catch (err) {
								console.error("CheckpointDiff error:", err)
							} finally {
								setCompareDisabled(false)
							}
						}}
						style={{ cursor: compareDisabled ? "wait" : "pointer" }}>
						Compare
					</CustomButton>
					<DottedLine $isCheckedOut={isCheckpointCheckedOut} small />
					<div ref={refs.setReference} style={{ position: "relative", marginTop: -2 }}>
						<CustomButton
							$isCheckedOut={isCheckpointCheckedOut}
							isActive={showRestoreConfirm}
							onClick={() => setShowRestoreConfirm(true)}>
							Restore
						</CustomButton>
						{showRestoreConfirm &&
							createPortal(
								<RestoreConfirmTooltip
									data-placement={placement}
									onMouseEnter={handleMouseEnter}
									onMouseLeave={handleMouseLeave}
									ref={refs.setFloating}
									style={floatingStyles}>
									<RestoreOption>
										<VSCodeButton
											appearance="secondary"
											onClick={handleRestoreTask}
											// disabled={restoreTaskDisabled}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor =
													"var(--vscode-inputOption-activeBackground)"
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = "var(--vscode-button-secondaryBackground)"
											}}
											style={{
												backgroundColor: "var(--vscode-button-secondaryBackground)",
												// cursor: restoreTaskDisabled ? "not-allowed" : "pointer",
												width: "100%",
												marginBottom: "3px",
											}}>
											<div style={{ fontSize: "12px" }}>Task</div>
										</VSCodeButton>
										{/* <p>Deletes messages after this point (does not affect workspace files)</p> */}
									</RestoreOption>
									<RestoreOption>
										<VSCodeButton
											appearance="secondary"
											onClick={handleRestoreWorkspace}
											// disabled={restoreWorkspaceDisabled}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor =
													"var(--vscode-inputOption-activeBackground)"
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = "var(--vscode-button-secondaryBackground)"
											}}
											style={{
												backgroundColor: "var(--vscode-button-secondaryBackground)",
												// cursor: restoreWorkspaceDisabled ? "not-allowed" : "pointer",
												width: "100%",
												marginBottom: "3px",
											}}>
											<div style={{ fontSize: "12px" }}>Files</div>
										</VSCodeButton>
										{/* <p>
										Restores your project's files back to a snapshot taken at this point (use "Compare" to see
										what will be reverted)
									</p> */}
									</RestoreOption>

									<RestoreOption>
										<VSCodeButton
											appearance="secondary"
											onClick={handleRestoreBoth}
											// disabled={restoreBothDisabled}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor =
													"var(--vscode-inputOption-activeBackground)"
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = "var(--vscode-button-secondaryBackground)"
											}}
											style={{
												backgroundColor: "var(--vscode-button-secondaryBackground)",
												// cursor: restoreBothDisabled ? "not-allowed" : "pointer",
												width: "100%",
												marginBottom: "3px",
											}}>
											<div style={{ fontSize: "12px" }}>Task & Files</div>
										</VSCodeButton>
										{/* <p>Restores your project's files and deletes all messages after this point</p> */}
									</RestoreOption>
								</RestoreConfirmTooltip>,
								document.body,
							)}
					</div>
					<DottedLine $isCheckedOut={isCheckpointCheckedOut} small />
				</ButtonGroup>
			</div>
			<i
				className="codicon codicon-bookmark"
				style={{
					color: isCheckpointCheckedOut ? "var(--vscode-textLink-foreground)" : "var(--vscode-descriptionForeground)",
					fontSize: checkPointIconSize,
					marginBottom: -2,
					flexShrink: 0,
				}}
			/>
		</Container>
	)
}

const Container = styled.div<{ isMenuOpen?: boolean; $isCheckedOut?: boolean }>`
	display: flex;
	align-items: center;
	padding: 6px 0;
	margin: ${checkPointContainerMargin};
	gap: 4px;
	position: relative;
	min-width: 0;
	min-height: ${checkPointContainerMinHeight}px;
	margin-top: -10px;
	margin-bottom: -10px;
	opacity: ${(props) => (props.$isCheckedOut ? 1 : props.isMenuOpen ? checkPointContainerHoverOpacity : checkPointContainerNormalOpacity)};

	&:hover {
		opacity: 1;
	}

	.hover-content {
		display: ${(props) => (props.isMenuOpen ? "flex" : "none")};
		align-items: center;
		gap: 4px;
		flex: 1;
	}

	&:hover .hover-content {
		display: flex;
	}

	.hover-show-inverse {
		display: ${(props) => (props.isMenuOpen ? "none" : "flex")};
		flex: 1;
		opacity: ${(props) => (props.isMenuOpen ? 0.5 : checkPointLineNormalOpacity)};
	}

	&:hover .hover-show-inverse {
		display: none;;
	}
`

const Label = styled.span<{ $isCheckedOut?: boolean }>`
	color: ${(props) => (props.$isCheckedOut ? "var(--vscode-textLink-foreground)" : "var(--vscode-descriptionForeground)")};
	font-size: 9px;
	flex-shrink: 0;
`

const DottedLine = styled.div<{ small?: boolean; $isCheckedOut?: boolean }>`
	flex: ${(props) => (props.small ? "0 0 3px" : "1")};
	min-width: ${(props) => (props.small ? "3px" : "5px")};
	height: 0.5px;
	background-image: linear-gradient(
		to right,
		${(props) => (props.$isCheckedOut ? "var(--vscode-textLink-foreground)" : "var(--vscode-descriptionForeground)")} 50%,
		transparent 50%
	);
	background-size: 4px 1px;
	background-repeat: repeat-x;
`

const ButtonGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
`

const CustomButton = styled.button<{ disabled?: boolean; isActive?: boolean; $isCheckedOut?: boolean }>`
	background: ${(props) =>
		props.isActive || props.disabled
			? props.$isCheckedOut
				? "var(--vscode-textLink-foreground)"
				: "var(--vscode-descriptionForeground)"
			: "transparent"};
	border: none;
	border-radius: ${defaultBorderRadius}px;
	color: ${(props) =>
		props.isActive || props.disabled
			? "var(--vscode-editor-background)"
			: props.$isCheckedOut
				? "var(--vscode-textLink-foreground)"
				: "var(--vscode-descriptionForeground)"};
	padding: 2px 6px;
	font-size: 9px;
	cursor: pointer;
	position: relative;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: ${defaultBorderRadius}px;
		border: 0.5px solid ${(props) => (props.$isCheckedOut ? "var(--vscode-textLink-foreground)" : "var(--vscode-descriptionForeground)")};
	}

	&:hover:not(:disabled) {
		background: ${(props) =>
			props.$isCheckedOut ? "var(--vscode-textLink-foreground)" : "var(--vscode-descriptionForeground)"};
		color: var(--vscode-editor-background);
		&::before {
			display: none;
		}
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`

const RestoreOption = styled.div`
	&:not(:last-child) {
		margin-bottom: 0px;
		padding-bottom: 3px;
		//border-bottom: 1px solid var(--vscode-editorGroup-border);
	}

	p {
		margin: 0 0 2px 0;
		color: var(--vscode-descriptionForeground);
		font-size: 11px;
		line-height: 14px;
	}

	&:last-child p {
		margin: 0 0 -2px 0;
	}
`

const RestoreConfirmTooltip = styled.div`
	position: fixed;
	background: ${CODE_BLOCK_BG_COLOR};
	border: 1px solid var(--vscode-editorGroup-border);
	padding: 8px;
	border-radius: 10px;
	width: min(calc(100vw - 54px), 130px);
	z-index: 1000;
	margin-top: -3px;

	// Add invisible padding to create a safe hover zone
	&::before {
		content: "";
		position: absolute;
		top: -8px;
		left: 0;
		right: 0;
		height: 8px;
	}

	// Adjust arrow to be above the padding
	&::after {
		content: "";
		position: absolute;
		top: -4px;
		right: 26px;
		width: 6px;
		height: 6px;
		background: ${CODE_BLOCK_BG_COLOR};
		border-left: 1px solid var(--vscode-editorGroup-border);
		border-top: 1px solid var(--vscode-editorGroup-border);
		transform: rotate(45deg);
		z-index: 1;
	}

	// When menu appears above the button
	&[data-placement^="top"] {
		&::before {
			top: auto;
			bottom: -8px;
		}

		&::after {
			top: auto;
			bottom: -6px;
			right: 24px;
			transform: rotate(225deg);
		}
	}

	p {
		margin: 0 0 6px 0;
		color: var(--vscode-descriptionForeground);
		font-size: 12px;
		white-space: normal;
		word-wrap: break-word;
	}
`
