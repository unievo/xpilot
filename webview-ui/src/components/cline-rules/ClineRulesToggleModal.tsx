import { chatInputSectionBorder, iconHighlightColor, menuBackground, menuFontSize, menuTopBorder } from "@components/config"
import { agentWorkspaceDirectory, hooksDirectory } from "@shared/Configuration"
import { EmptyRequest } from "@shared/proto/cline/common"
import {
	ClineRulesToggles,
	RefreshedRules,
	RuleScope,
	ToggleAgentsRuleRequest,
	ToggleClineRuleRequest,
	ToggleCursorRuleRequest,
	ToggleWindsurfRuleRequest,
	ToggleWorkflowRequest,
} from "@shared/proto/cline/file"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useEffect, useRef, useState } from "react"
import { useClickAway, useWindowSize } from "react-use"
import styled from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { FileServiceClient } from "@/services/grpc-client"
import { isMacOSOrLinux } from "@/utils/platformUtils"
import HeroTooltip from "../common/HeroTooltip"
import HookRow from "./HookRow"
import NewRuleRow from "./NewRuleRow"
import RuleRow from "./RuleRow"
import RulesToggleList from "./RulesToggleList"

// Helper function to sort rule entries by filename
const sortByFilename = (entries: [string, boolean][]): [string, boolean][] => {
	return entries.sort(([a], [b]) => {
		const filenameA = a.split(/[/\\]/).pop() || a
		const filenameB = b.split(/[/\\]/).pop() || b
		return filenameA.localeCompare(filenameB)
	})
}

interface ClineRulesToggleModalProps {
	textAreaRef?: React.RefObject<HTMLTextAreaElement>
}

const ClineRulesToggleModal: React.FC<ClineRulesToggleModalProps> = ({ textAreaRef }) => {
	const {
		globalClineRulesToggles = {},
		localClineRulesToggles = {},
		localCursorRulesToggles = {},
		localWindsurfRulesToggles = {},
		localAgentsRulesToggles = {},
		localWorkflowToggles = {},
		globalWorkflowToggles = {},
		remoteRulesToggles = {},
		remoteWorkflowToggles = {},
		remoteConfigSettings = {},
		hooksEnabled,
		setGlobalClineRulesToggles,
		setLocalClineRulesToggles,
		setLocalCursorRulesToggles,
		setLocalWindsurfRulesToggles,
		setLocalAgentsRulesToggles,
		setLocalWorkflowToggles,
		setGlobalWorkflowToggles,
		setRemoteRulesToggles,
		setRemoteWorkflowToggles,
	} = useExtensionState()
	const [globalHooks, setGlobalHooks] = useState<Array<{ name: string; enabled: boolean; absolutePath: string }>>([])
	const [workspaceHooks, setWorkspaceHooks] = useState<
		Array<{ workspaceName: string; hooks: Array<{ name: string; enabled: boolean; absolutePath: string }> }>
	>([])

	const isWindows = !isMacOSOrLinux()
	const [isVisible, setIsVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)
	const modalRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)
	const [currentView, setCurrentView] = useState<"rules" | "workflows" | "hooks">("rules")

	// Auto-switch to rules tab if hooks become disabled while viewing hooks tab
	useEffect(() => {
		const areHooksEnabled = hooksEnabled?.user
		if (currentView === "hooks" && !areHooksEnabled) {
			setCurrentView("rules")
		}
	}, [currentView, hooksEnabled])
	const [descCollapsed, setDescCollapsed] = useState(true)

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
					if (response.localAgentsRulesToggles?.toggles) {
						setLocalAgentsRulesToggles(response.localAgentsRulesToggles.toggles)
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
	}, [
		isVisible,
		setGlobalClineRulesToggles,
		setLocalClineRulesToggles,
		setGlobalWorkflowToggles,
		setLocalCursorRulesToggles,
		setLocalWindsurfRulesToggles,
		setLocalWorkflowToggles,
	])

	// Refresh hooks when hooks tab becomes visible
	useEffect(() => {
		if (!isVisible || currentView !== "hooks") {
			return
		}

		const abortController = new AbortController()

		// Initial refresh when tab opens
		const refreshHooks = () => {
			if (abortController.signal.aborted) return

			FileServiceClient.refreshHooks({} as EmptyRequest)
				.then((response) => {
					if (!abortController.signal.aborted) {
						setGlobalHooks(response.globalHooks || [])
						setWorkspaceHooks(response.workspaceHooks || [])
					}
				})
				.catch((error) => {
					if (!abortController.signal.aborted) {
						console.error("Failed to refresh hooks:", error)
					}
				})
		}

		// Refresh immediately
		refreshHooks()

		// Poll every 1 second to detect filesystem changes
		const pollInterval = setInterval(refreshHooks, 1000)

		return () => {
			abortController.abort()
			clearInterval(pollInterval)
		}
	}, [isVisible, currentView])

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

	const agentsRules = sortByFilename(
		Object.entries(localAgentsRulesToggles || {}).map(([path, enabled]): [string, boolean] => [path, enabled as boolean]),
	)

	const localWorkflows = sortByFilename(
		Object.entries(localWorkflowToggles || {}).map(([path, enabled]): [string, boolean] => [path, enabled as boolean]),
	)

	const globalWorkflows = sortByFilename(
		Object.entries(globalWorkflowToggles || {}).map(([path, enabled]): [string, boolean] => [path, enabled as boolean]),
	)

	// Get remote rules and workflows from remote config
	const remoteGlobalRules = remoteConfigSettings.remoteGlobalRules || []
	const remoteGlobalWorkflows = remoteConfigSettings.remoteGlobalWorkflows || []

	// Check if we have any remote rules or workflows
	const hasRemoteRules = remoteGlobalRules.length > 0
	const hasRemoteWorkflows = remoteGlobalWorkflows.length > 0

	// Handle toggle rule using gRPC
	const toggleRule = (isGlobal: boolean, rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleClineRule(
			ToggleClineRuleRequest.create({
				scope: isGlobal ? RuleScope.GLOBAL : RuleScope.LOCAL,
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
				if (response.remoteRulesToggles?.toggles) {
					setRemoteRulesToggles(response.remoteRulesToggles.toggles)
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

	const toggleAgentsRule = (rulePath: string, enabled: boolean) => {
		FileServiceClient.toggleAgentsRule(
			ToggleAgentsRuleRequest.create({
				rulePath,
				enabled,
			} as ToggleAgentsRuleRequest),
		)
			.then((response: ClineRulesToggles) => {
				if (response.toggles) {
					setLocalAgentsRulesToggles(response.toggles)
				}
			})
			.catch((error) => {
				console.error("Error toggling Agents rule:", error)
			})
	}

	// Toggle hook handler
	const toggleHook = (isGlobal: boolean, hookName: string, enabled: boolean, workspaceName?: string) => {
		FileServiceClient.toggleHook({
			metadata: {} as any,
			hookName,
			isGlobal,
			enabled,
			workspaceName,
		})
			.then((response) => {
				setGlobalHooks(response.hooksToggles?.globalHooks || [])
				setWorkspaceHooks(response.hooksToggles?.workspaceHooks || [])
			})
			.catch((error) => {
				console.error("Error toggling hook:", error)
			})
	}

	const toggleWorkflow = (isGlobal: boolean, workflowPath: string, enabled: boolean) => {
		FileServiceClient.toggleWorkflow(
			ToggleWorkflowRequest.create({
				workflowPath,
				enabled,
				scope: isGlobal ? RuleScope.GLOBAL : RuleScope.LOCAL,
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

	// Handle toggle for remote rules
	const toggleRemoteRule = (ruleName: string, enabled: boolean) => {
		FileServiceClient.toggleClineRule(
			ToggleClineRuleRequest.create({
				scope: RuleScope.REMOTE,
				rulePath: ruleName,
				enabled,
			}),
		)
			.then((response) => {
				// Update the local state with the response
				if (response.remoteRulesToggles?.toggles) {
					setRemoteRulesToggles(response.remoteRulesToggles.toggles)
				}
			})
			.catch((error) => {
				console.error("Error toggling remote rule:", error)
			})
	}

	// Handle toggle for remote workflows
	const toggleRemoteWorkflow = (workflowName: string, enabled: boolean) => {
		FileServiceClient.toggleWorkflow(
			ToggleWorkflowRequest.create({
				workflowPath: workflowName,
				enabled,
				scope: RuleScope.REMOTE,
			}),
		)
			.then((response) => {
				if (response.toggles) {
					setRemoteWorkflowToggles(response.toggles)
				}
			})
			.catch((error) => {
				console.error("Error toggling remote workflow:", error)
			})
	}

	// Close modal when clicking outside
	useClickAway(modalRef, () => {
		setIsVisible(false)
	})

	// Global Esc key handler for rules modal
	useEffect(() => {
		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isVisible) {
				event.preventDefault()
				event.stopPropagation()
				setIsVisible(false)
				// Focus the textarea after closing the modal
				setTimeout(() => {
					textAreaRef?.current?.focus()
				}, 0)
			}
		}

		if (isVisible) {
			document.addEventListener("keydown", handleGlobalKeyDown)
		}

		return () => {
			document.removeEventListener("keydown", handleGlobalKeyDown)
		}
	}, [isVisible, textAreaRef])

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
			<div className="opacity-70 inline-flex min-w-0 max-w-full" ref={buttonRef}>
				<HeroTooltip content= "Instructions, Workflows and Hooks" delay={1000}>
					<VSCodeButton
						appearance="icon"
						aria-label={isVisible ? `Hide Instructions and Workflows` : `Manage Instructions and Workflows`}
						onClick={() => setIsVisible(!isVisible)}
						style={{ marginLeft: "-1px", height: "20px" }}>
						<div className="flex items-center gap-1 text-xs whitespace-nowrap min-w-0 w-full">
							<span
								className="codicon codicon-folder-active flex items-center"
								style={{ fontSize: "17px", marginBottom: 1 }}
							/>
						</div>
					</VSCodeButton>
				</HeroTooltip>
			</div>

			{isVisible && (
				<div
					className={`fixed left-[15px] right-[15px] overflow-hidden p-2 rounded-md z-[1000] overflow-y-auto shadow-[0_2px_5px_rgba(0,0,0,0.25)]`}
					style={{
						bottom: `calc(100vh - ${menuPosition}px + 10px)`,
						border: chatInputSectionBorder,
						borderTop: menuTopBorder,
						background: menuBackground,
						maxHeight: "calc(100vh - 70px)",
						minHeight: "400px",
						overscrollBehavior: "contain",
						paddingBottom: "10px",
						fontSize: menuFontSize,
					}}>
					{/* <div
						className={`fixed w-[10px] h-[10px] z-[-1] rotate-45 border-r border-b border-[${chatTextAreaBorder}]`}
						style={{
							bottom: `calc(100vh - ${menuPosition}px)`,
							right: arrowPosition,
							background: menuBackground,
						}}
					/> */}

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
								// gap: "1px",
								borderBottom: "1px solid var(--vscode-panel-border)",
							}}>
							<TabButton isActive={currentView === "rules"} onClick={() => setCurrentView("rules")}>
								<span
									className="codicon codicon-book flex items-center"
									style={{
										color: iconHighlightColor,
										fontSize: "16px",
										marginLeft: -3,
										paddingRight: 5,
										verticalAlign: "-20%",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								/>
								Instructions
							</TabButton>
							<TabButton isActive={currentView === "workflows"} onClick={() => setCurrentView("workflows")}>
								<span
									className="codicon codicon-server-process flex items-center"
									style={{
										color: iconHighlightColor,
										fontSize: "16px",
										paddingRight: 5,
										verticalAlign: "-20%",
									}}
								/>
								Workflows
							</TabButton>
							{hooksEnabled?.user && (
								<TabButton isActive={currentView === "hooks"} onClick={() => setCurrentView("hooks")}>
									<span
										className="codicon codicon-symbol-event flex items-center"
										style={{
											color: iconHighlightColor,
											fontSize: "16px",
											paddingRight: 5,
											verticalAlign: "-20%",
										}}
									/>
									Hooks
								</TabButton>
							)}
						</div>
						<div
							className="cursor-pointer pt-1.5 z-[9999] pointer-events-auto"
							onMouseDown={() => {
								setIsVisible(false)
								// Focus the textarea after closing the modal
								setTimeout(() => {
									textAreaRef?.current?.focus()
								}, 0)
							}}>
							<span className="codicon codicon-close" />
						</div>
					</div>

					{/* Description text (chevron collapsible) */}
					<div
						style={{
							color: descCollapsed ? "var(--vscode-descriptionForeground)" : "",
							marginBottom: 8,
						}}>
						<div
							aria-expanded={!descCollapsed}
							onClick={() => setDescCollapsed((v) => !v)}
							role="button"
							style={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer", userSelect: "none" }}
							tabIndex={0}>
							<span
								className={`codicon codicon-chevron-${descCollapsed ? "right" : "down"}`}
								style={{ marginLeft: -3, fontSize: 10 }}
							/>
							<span style={{ fontWeight: descCollapsed ? "normal" : "bold" }}>
								{currentView === "rules"
									? "Instructions Overview"
									: currentView === "workflows"
										? "Workflows Overview"
										: "Hooks Overview"}
							</span>
						</div>
						{!descCollapsed && (
							<div className="text-sm mt-1 mb-6">
								{currentView === "rules" && (
									<p>
										Use instruction files for rules, specifications, documentation, or any information that is
										relevant for the AI model to achieve optimal task completion.
										<br />
										<br />
										Add new instruction files or use the <strong>/git-instructions</strong> command to get
										existing instructions from a git repository.
										<br />
										<br />
										Enable relevant instructions for the task. Enabled instructions are always included in the
										task context.
										<br />
									</p>
								)}
								{currentView === "workflows" && (
									<p>
										Use workflow files to define a sequence of steps that can be triggered as a command, by
										starting a chat message with <strong>/workflow-name</strong>.
										<br />
										<br />
										Workflows can be used to automate complex or repetitive tasks. Add new workflow files or
										use the <strong>/git-workflows</strong> command to get existing workflows from a git
										repository.
										<br />
										<br />
										Enable relevant workflows to be available in the commands list.
									</p>
								)}
								{currentView === "hooks" && (
									<div>
										<p>
											Hooks allow you to execute custom scripts at specific points in the task execution
											lifecycle, enabling automation and integration with external tools.
											<br />
											<br />
											Toggle to enable/disable (chmod +x/-x).
										</p>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Remote config banner */}
					{((currentView === "rules" && hasRemoteRules) || (currentView === "workflows" && hasRemoteWorkflows)) && (
						<div className="flex items-center gap-2 px-2 py-3 mb-2 bg-vscode-textBlockQuote-background border-l-[3px] border-vscode-textLink-foreground">
							{/* <i className="codicon codicon-lock text-xs" /> */}
							<span className="text-sm">
								{currentView === "rules"
									? "Your organization manages remote instructions"
									: "Your organization manages remote workflows"}
							</span>
						</div>
					)}

					{/* Description text */}
					{/* <div className="text-xs text-description mb-4">
						{currentView === "rules" ? (
							<p>
								Rules allow you to provide Cline with system-level guidance. Think of them as a persistent way to
								include context and preferences for your projects or globally for every conversation.{" "}
								<VSCodeLink
									className="text-xs"
									href="https://docs.cline.bot/features/cline-rules"
									style={{ display: "inline", fontSize: "inherit" }}>
									Docs
								</VSCodeLink>
							</p>
						) : currentView === "workflows" ? (
							<p>
								Workflows allow you to define a series of steps to guide Cline through a repetitive set of tasks,
								such as deploying a service or submitting a PR. To invoke a workflow, type{" "}
								<span className="text-foreground font-bold">/workflow-name</span> in the chat.{" "}
								<VSCodeLink
									className="text-xs inline"
									href="https://docs.cline.bot/features/slash-commands/workflows">
									Docs
								</VSCodeLink>
							</p>
						) : (
							<p>
								Hooks allow you to execute custom scripts at specific points in Cline's execution lifecycle,
								enabling automation and integration with external tools.
							</p>
						)}
					</div> */}

					{currentView === "rules" ? (
						<>
							{/* Remote Rules Section */}
							{hasRemoteRules && (
								<div className="mb-3">
									<div className="font-normal mb-2">Remote</div>
									<div className="flex flex-col gap-0">
										{remoteGlobalRules.map((rule) => {
											const enabled = rule.alwaysEnabled || remoteRulesToggles[rule.name] === true
											return (
												<RuleRow
													alwaysEnabled={rule.alwaysEnabled}
													enabled={enabled}
													isGlobal={false}
													isRemote={true}
													key={rule.name}
													rulePath={rule.name}
													ruleType="cline"
													toggleRule={toggleRemoteRule}
												/>
											)
										})}
									</div>
								</div>
							)}

							{/* Global Rules Section */}
							<div style={{ marginBottom: 2 }}>
								<div className="font-normal mt-3 mb-2">Global</div>

								{/* File-based Global Rules */}
								<RulesToggleList
									isGlobal={true}
									listGap="small"
									rules={globalRules}
									ruleType={"cline"}
									showNewRule={true}
									showNoRules={true}
									toggleRule={(rulePath, enabled) => toggleRule(true, rulePath, enabled)}
								/>
							</div>

							{/* Local Rules Section */}
							<div style={{ marginBottom: 2 }}>
								<div className="font-normal mt-3 mb-2">Workspace </div>
								<RulesToggleList
									isGlobal={false}
									listGap="small"
									rules={localRules}
									ruleType={"cline"}
									showNewRule={false}
									showNoRules={false}
									toggleRule={(rulePath, enabled) => toggleRule(false, rulePath, enabled)}
								/>

								<RulesToggleList
									isGlobal={false}
									listGap="small"
									rules={cursorRules}
									ruleType={"cursor"}
									showNewRule={false}
									showNoRules={false}
									toggleRule={toggleCursorRule}
								/>
								<RulesToggleList
									isGlobal={false}
									listGap="small"
									rules={windsurfRules}
									ruleType={"windsurf"}
									showNewRule={false}
									showNoRules={false}
									toggleRule={toggleWindsurfRule}
								/>
								<RulesToggleList
									isGlobal={false}
									listGap="small"
									rules={agentsRules}
									ruleType={"agents"}
									showNewRule={true}
									showNoRules={false}
									toggleRule={toggleAgentsRule}
								/>
							</div>
						</>
					) : currentView === "workflows" ? (
						<>
							{/* Remote Workflows Section */}
							{hasRemoteWorkflows && (
								<div className="mb-3">
									<div className="text-sm font-normal mb-2">Enterprise Workflows</div>
									<div className="flex flex-col gap-0">
										{remoteGlobalWorkflows.map((workflow) => {
											const enabled =
												workflow.alwaysEnabled || remoteWorkflowToggles[workflow.name] === true
											return (
												<RuleRow
													alwaysEnabled={workflow.alwaysEnabled}
													enabled={enabled}
													isGlobal={false}
													isRemote={true}
													key={workflow.name}
													rulePath={workflow.name}
													ruleType="workflow"
													toggleRule={toggleRemoteWorkflow}
												/>
											)
										})}
									</div>
								</div>
							)}

							{/* Global Workflows Section */}
							<div style={{ marginBottom: 2 }}>
								<div className="font-normal mt-3 mb-2">Global</div>

								{/* File-based Global Workflows */}
								<RulesToggleList
									isGlobal={true}
									listGap="small"
									rules={globalWorkflows}
									ruleType={"workflow"}
									showNewRule={true}
									showNoRules={false}
									toggleRule={(rulePath, enabled) => toggleWorkflow(true, rulePath, enabled)}
								/>
							</div>
							{/* Local Workflows Section */}
							<div style={{ marginBottom: 2 }}>
								<div className="font-normal mt-3 mb-2">Workspace</div>
								<RulesToggleList
									isGlobal={false}
									listGap="small"
									rules={localWorkflows}
									ruleType={"workflow"}
									showNewRule={true}
									showNoRules={false}
									toggleRule={(rulePath, enabled) => toggleWorkflow(false, rulePath, enabled)}
								/>
							</div>
						</>
					) : (
						<>
							{/* <div className="text-xs text-description mb-4">
								<p>
									Toggle to enable/disable (chmod +x/-x).{" "}
									<VSCodeLink
										className="text-xs"
										href="https://docs.cline.bot/features/hooks"
										style={{ display: "inline", fontSize: "inherit" }}>
										Docs
									</VSCodeLink>
								</p>
							</div> */}
							{/* Hooks Tab */}
							{/* Windows warning banner */}
							{isWindows && (
								<div className="flex items-center gap-2 px-5 py-3 mb-4 bg-vscode-inputValidation-warningBackground border-l-[3px] border-vscode-inputValidation-warningBorder">
									<i className="codicon codicon-warning text-sm" />
									<span className="text-base">
										Hook toggling is not supported on Windows. Hooks can be created, edited, and deleted, but
										cannot be enabled/disabled and will not execute.
									</span>
								</div>
							)}

							{/* Global Hooks */}
							<div className="mb-3">
								<div className="text-sm font-normal mb-2">Global</div>
								<div className="flex flex-col gap-0">
									{globalHooks
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((hook) => (
											<HookRow
												absolutePath={hook.absolutePath}
												enabled={hook.enabled}
												hookName={hook.name}
												isGlobal={true}
												isWindows={isWindows}
												key={hook.name}
												onDelete={(hooksToggles) => {
													// Use response data directly, no need to refresh
													setGlobalHooks(hooksToggles.globalHooks || [])
													setWorkspaceHooks(hooksToggles.workspaceHooks || [])
												}}
												onToggle={(name: string, newEnabled: boolean) =>
													toggleHook(true, name, newEnabled)
												}
											/>
										))}
									<NewRuleRow existingHooks={globalHooks.map((h) => h.name)} isGlobal={true} ruleType="hook" />
								</div>
							</div>

							{/* Workspace Hooks - one section per workspace */}
							{workspaceHooks.map((workspace, index) => (
								<div
									key={workspace.workspaceName}
									style={{ marginBottom: index === workspaceHooks.length - 1 ? -10 : 12 }}>
									<div className="text-sm font-normal mb-2">
										{workspace.workspaceName}/{agentWorkspaceDirectory}/{hooksDirectory}
									</div>
									<div className="flex flex-col gap-0">
										{workspace.hooks
											.sort((a, b) => a.name.localeCompare(b.name))
											.map((hook) => (
												<HookRow
													absolutePath={hook.absolutePath}
													enabled={hook.enabled}
													hookName={hook.name}
													isGlobal={false}
													isWindows={isWindows}
													key={hook.absolutePath}
													onDelete={(hooksToggles) => {
														// Use response data directly, no need to refresh
														setGlobalHooks(hooksToggles.globalHooks || [])
														setWorkspaceHooks(hooksToggles.workspaceHooks || [])
													}}
													onToggle={(name: string, newEnabled: boolean) =>
														toggleHook(false, name, newEnabled, workspace.workspaceName)
													}
													workspaceName={workspace.workspaceName}
												/>
											))}
										<NewRuleRow
											existingHooks={workspace.hooks.map((h) => h.name)}
											isGlobal={false}
											ruleType="hook"
											workspaceName={workspace.workspaceName}
										/>
									</div>
								</div>
							))}
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
	<StyledTabButton aria-pressed={isActive} isActive={isActive} onClick={onClick}>
		{children}
	</StyledTabButton>
)

export default ClineRulesToggleModal
