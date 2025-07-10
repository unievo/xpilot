import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import Tooltip from "@/components/common/Tooltip"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { FileServiceClient } from "@/services/grpc-client"
import { vscode } from "@/utils/vscode"
import { EmptyRequest } from "@shared/proto/common"
import {
	ClineRulesToggles,
	RefreshedRules,
	ToggleClineRuleRequest,
	ToggleCursorRuleRequest,
	ToggleWindsurfRuleRequest,
	ToggleWorkflowRequest,
} from "@shared/proto/file"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useRef, useState } from "react"
import { useClickAway, useWindowSize } from "react-use"
import styled from "styled-components"
import RulesToggleList from "./RulesToggleList"
import { agentName } from "@shared/Configuration"
import { dropdown } from "@heroui/react"
import { dropdownBackground, itemIconColor, menuBackground } from "../theme"
import HeroTooltip from "../common/HeroTooltip"

// Helper function to sort rule entries by filename
const sortByFilename = (entries: [string, boolean][]): [string, boolean][] => {
	return entries.sort(([a], [b]) => {
		const filenameA = a.split(/[/\\]/).pop() || a
		const filenameB = b.split(/[/\\]/).pop() || b
		return filenameA.localeCompare(filenameB)
	})
}

const ClineRulesToggleModal: React.FC = () => {
	const {
		globalClineRulesToggles = {},
		localClineRulesToggles = {},
		localCursorRulesToggles = {},
		localWindsurfRulesToggles = {},
		localWorkflowToggles = {},
		globalWorkflowToggles = {},
		setGlobalClineRulesToggles,
		setLocalClineRulesToggles,
		setLocalCursorRulesToggles,
		setLocalWindsurfRulesToggles,
		setLocalWorkflowToggles,
		setGlobalWorkflowToggles,
	} = useExtensionState()
	const [isVisible, setIsVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)
	const modalRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)
	const [currentView, setCurrentView] = useState<"rules" | "workflows">("rules")

	useEffect(() => {
		if (isVisible) {
			FileServiceClient.refreshRules({} as EmptyRequest)
				.then((response: RefreshedRules) => {
					// Update state with the response data using all available setters
					if (response.globalClineRulesToggles?.toggles) {
						setGlobalClineRulesToggles(response.globalClineRulesToggles.toggles)
					}
					if (response.localClineRulesToggles?.toggles) {
						setLocalClineRulesToggles(response.localClineRulesToggles.toggles)
					}
					if (response.localCursorRulesToggles?.toggles) {
						setLocalCursorRulesToggles(response.localCursorRulesToggles.toggles)
					}
					if (response.localWindsurfRulesToggles?.toggles) {
						setLocalWindsurfRulesToggles(response.localWindsurfRulesToggles.toggles)
					}
					if (response.localWorkflowToggles?.toggles) {
						setLocalWorkflowToggles(response.localWorkflowToggles.toggles)
					}
					if (response.globalWorkflowToggles?.toggles) {
						setGlobalWorkflowToggles(response.globalWorkflowToggles.toggles)
					}
				})
				.catch((error) => {
					console.error("Failed to refresh rules:", error)
				})
		}
	}, [isVisible])

	// Format global rules for display with proper typing
	const globalRules = sortByFilename(
		Object.entries(globalClineRulesToggles || {}).map(([path, enabled]): [string, boolean] => [path, enabled as boolean]),
	)

	// Format local rules for display with proper typing
	const localRules = sortByFilename(
		Object.entries(localClineRulesToggles || {}).map(([path, enabled]): [string, boolean] => [path, enabled as boolean]),
	)

	const cursorRules = sortByFilename(
		Object.entries(localCursorRulesToggles || {}).map(([path, enabled]): [string, boolean] => [path, enabled as boolean]),
	)

	const windsurfRules = sortByFilename(
		Object.entries(localWindsurfRulesToggles || {}).map(([path, enabled]): [string, boolean] => [path, enabled as boolean]),
	)

	const localWorkflows = sortByFilename(
		Object.entries(localWorkflowToggles || {}).map(([path, enabled]): [string, boolean] => [path, enabled as boolean]),
	)

	const globalWorkflows = sortByFilename(
		Object.entries(globalWorkflowToggles || {}).map(([path, enabled]): [string, boolean] => [path, enabled as boolean]),
	)

	// Handle toggle rule using gRPC
	const toggleRule = (isGlobal: boolean, rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleClineRule(
			ToggleClineRuleRequest.create({
				isGlobal,
				rulePath,
				enabled,
			}),
		)
			.then((response) => {
				// Update the local state with the response
				if (response.globalClineRulesToggles?.toggles) {
					setGlobalClineRulesToggles(response.globalClineRulesToggles.toggles)
				}
				if (response.localClineRulesToggles?.toggles) {
					setLocalClineRulesToggles(response.localClineRulesToggles.toggles)
				}
			})
			.catch((error) => {
				console.error("Error toggling instruction:", error)
			})
	}

	const toggleCursorRule = (rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleCursorRule(
			ToggleCursorRuleRequest.create({
				rulePath,
				enabled,
			}),
		)
			.then((response) => {
				// Update the local state with the response
				if (response.toggles) {
					setLocalCursorRulesToggles(response.toggles)
				}
			})
			.catch((error) => {
				console.error("Error toggling Cursor rule:", error)
			})
	}

	const toggleWindsurfRule = (rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleWindsurfRule(
			ToggleWindsurfRuleRequest.create({
				rulePath,
				enabled,
			} as ToggleWindsurfRuleRequest),
		)
			.then((response: ClineRulesToggles) => {
				if (response.toggles) {
					setLocalWindsurfRulesToggles(response.toggles)
				}
			})
			.catch((error) => {
				console.error("Error toggling Windsurf rule:", error)
			})
	}

	const toggleWorkflow = (isGlobal: boolean, workflowPath: string, enabled: boolean) => {
		FileServiceClient.toggleWorkflow(
			ToggleWorkflowRequest.create({
				workflowPath,
				enabled,
				isGlobal,
			}),
		)
			.then((response) => {
				if (response.toggles) {
					if (isGlobal) {
						setGlobalWorkflowToggles(response.toggles)
					} else {
						setLocalWorkflowToggles(response.toggles)
					}
				}
			})
			.catch((err: Error) => {
				console.error("Failed to toggle workflow:", err)
			})
	}

	// Close modal when clicking outside
	useClickAway(modalRef, () => {
		setIsVisible(false)
	})

	// Calculate positions for modal and arrow
	useEffect(() => {
		if (isVisible && buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			const buttonCenter = buttonRect.left + buttonRect.width / 2
			const rightPosition = document.documentElement.clientWidth - buttonCenter - 5

			setArrowPosition(rightPosition)
			setMenuPosition(buttonRect.top + 1)
		}
	}, [isVisible, viewportWidth, viewportHeight])

	return (
		<div ref={modalRef}>
			<div ref={buttonRef} className="opacity-70 inline-flex min-w-0 max-w-full">
				<HeroTooltip delay={1000} content="Instructions and workflows">
					<VSCodeButton
						appearance="icon"
						aria-label={`${agentName} Instructions`}
						onClick={() => setIsVisible(!isVisible)}
						style={{ marginLeft: "-3px", height: "20px" }}>
						<div className="flex items-center gap-1 text-xs whitespace-nowrap min-w-0 w-full">
							<span
								className="codicon codicon-folder-active flex items-center"
								style={{ fontSize: "16px", marginBottom: 1 }}
							/>
						</div>
					</VSCodeButton>
				</HeroTooltip>
			</div>

			{isVisible && (
				<div
					className="fixed left-[15px] right-[15px] border border-[var(--vscode-editorGroup-border)] p-2 rounded-md z-[1000] overflow-y-auto"
					style={{
						bottom: `calc(100vh - ${menuPosition}px + 6px)`,
						background: menuBackground,
						maxHeight: "calc(100vh - 70px)",
						overscrollBehavior: "contain",
						paddingBottom: "10px",
						fontSize: "12px",
					}}>
					<div
						className="fixed w-[10px] h-[10px] z-[-1] rotate-45 border-r border-b border-[var(--vscode-editorGroup-border)]"
						style={{
							bottom: `calc(100vh - ${menuPosition}px)`,
							right: arrowPosition,
							background: menuBackground,
						}}
					/>

					{/* Tabs container */}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "10px",
						}}>
						<div
							style={{
								display: "flex",
								gap: "1px",
								borderBottom: "1px solid var(--vscode-panel-border)",
							}}>
							<TabButton isActive={currentView === "rules"} onClick={() => setCurrentView("rules")}>
								<span
									className="codicon codicon-book flex items-center"
									style={{
										color: itemIconColor,
										fontSize: "18px",
										marginLeft: -3,
										paddingRight: 5,
										verticalAlign: "-20%",
									}}
								/>
								Instructions{" "}
								<HeroTooltip content="Instruction files allow enhancing the AI context with specialized information such as coding rules, specifications, documentation. Add new instruction files, or type the `/Git Instructions` command to get instruction from git.">
									<span className="codicon codicon-info" style={{ fontSize: "13px", opacity: 0.6 }} />
								</HeroTooltip>
							</TabButton>
							<TabButton isActive={currentView === "workflows"} onClick={() => setCurrentView("workflows")}>
								<span
									className="codicon codicon-server-process flex items-center"
									style={{ color: itemIconColor, fontSize: "18px", paddingRight: 5, verticalAlign: "-20%" }}
								/>
								Workflows{" "}
								<HeroTooltip content="Workflow files allow defining executable instructions that can be invoked like commands, by typing `/Workflow name`. Add new workflow files, or use the `/Git Workflows` command to get workflows from git.">
									<span className="codicon codicon-info" style={{ fontSize: "13px", opacity: 0.6 }} />
								</HeroTooltip>
							</TabButton>
						</div>
						<div
							onMouseDown={() => setIsVisible(false)}
							className="cursor-pointer p-1.5 z-[9999] pointer-events-auto">
							<span className="codicon codicon-close" />
						</div>
					</div>

					{/* Description text */}
					<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-0">
						{currentView === "rules" ? <p></p> : <p></p>}
					</div>

					{currentView === "rules" ? (
						<>
							{/* Global Rules Section */}
							<div style={{ marginBottom: 2 }}>
								<HeroTooltip content="Global instructions are saved in a global location and can be used for general information available for all workspaces. They can be activated or deactivated at any time from this menu.">
									<div className="font-normal mt-3 mb-2">
										Global{" "}
										<span className="codicon codicon-info" style={{ fontSize: "13px", opacity: 0.6 }} />
									</div>
								</HeroTooltip>
								<RulesToggleList
									rules={globalRules}
									toggleRule={(rulePath, enabled) => toggleRule(true, rulePath, enabled)}
									listGap="small"
									isGlobal={true}
									ruleType={"cline"}
									showNewRule={true}
									showNoRules={true}
								/>
							</div>

							{/* Local Rules Section */}
							<div style={{ marginBottom: 2 }}>
								<HeroTooltip content="Workspace instructions are saved in the current workspace and can be used for specific information for each workspace. They can be activated or deactivated at any time from this menu.">
									<div className="font-normal mt-3 mb-2">
										Workspace{" "}
										<span className="codicon codicon-info" style={{ fontSize: "13px", opacity: 0.6 }} />
									</div>
								</HeroTooltip>
								<RulesToggleList
									rules={localRules}
									toggleRule={(rulePath, enabled) => toggleRule(false, rulePath, enabled)}
									listGap="small"
									isGlobal={false}
									ruleType={"cline"}
									showNewRule={false}
									showNoRules={false}
								/>
								<RulesToggleList
									rules={cursorRules}
									toggleRule={toggleCursorRule}
									listGap="small"
									isGlobal={false}
									ruleType={"cursor"}
									showNewRule={false}
									showNoRules={false}
								/>
								<RulesToggleList
									rules={windsurfRules}
									toggleRule={toggleWindsurfRule}
									listGap="small"
									isGlobal={false}
									ruleType={"windsurf"}
									showNewRule={true}
									showNoRules={
										localRules.length === 0 && cursorRules.length === 0 && windsurfRules.length === 0
									}
								/>
							</div>
						</>
					) : (
						<>
							{/* Global Workflows Section */}
							<div style={{ marginBottom: 2 }}>
								<HeroTooltip content="Global workflows are saved in a global location and can be invoked from any workspace. They can be activated or deactivated at any time from this menu.">
									<div className="font-normal mt-3 mb-2">
										Global{" "}
										<span className="codicon codicon-info" style={{ fontSize: "13px", opacity: 0.6 }} />
									</div>
								</HeroTooltip>
								<RulesToggleList
									rules={globalWorkflows}
									toggleRule={(rulePath, enabled) => toggleWorkflow(true, rulePath, enabled)}
									listGap="small"
									isGlobal={true}
									ruleType={"workflow"}
									showNewRule={true}
									showNoRules={false}
								/>
							</div>

							{/* Local Workflows Section */}
							<div style={{ marginBottom: 2 }}>
								<HeroTooltip content="Workspace workflows are saved in the current workspace and can be invoked in the current workspace. They can be activated or deactivated at any time from this menu.">
									<div className="font-normal mt-3 mb-2">
										Workspace{" "}
										<span className="codicon codicon-info" style={{ fontSize: "13px", opacity: 0.6 }} />
									</div>
								</HeroTooltip>
								<RulesToggleList
									rules={localWorkflows}
									toggleRule={(rulePath, enabled) => toggleWorkflow(false, rulePath, enabled)}
									listGap="small"
									isGlobal={false}
									ruleType={"workflow"}
									showNewRule={true}
									showNoRules={false}
								/>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	)
}

const StyledTabButton = styled.button<{ isActive: boolean }>`
	background: none;
	border: none;
	border-bottom: 2px solid ${(props) => (props.isActive ? "var(--vscode-foreground)" : "transparent")};
	color: ${(props) => (props.isActive ? "var(--vscode-foreground)" : "var(--vscode-descriptionForeground)")};
	padding: 8px 5px;
	cursor: pointer;
	font-size: 13px;
	margin-bottom: -1px;
	margin-top: -5px;
	font-family: inherit;

	&:hover {
		color: var(--vscode-foreground);
	}
`

export const TabButton = ({
	children,
	isActive,
	onClick,
}: {
	children: React.ReactNode
	isActive: boolean
	onClick: () => void
}) => (
	<StyledTabButton isActive={isActive} onClick={onClick}>
		{children}
	</StyledTabButton>
)

export default ClineRulesToggleModal
