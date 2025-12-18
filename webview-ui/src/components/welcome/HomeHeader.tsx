import { iconHighlightColor } from "@components/config"
import { agentName } from "@shared/Configuration"
import { EmptyRequest } from "@shared/proto/cline/common"
import { PlanActMode, TogglePlanActModeRequest } from "@shared/proto/index.cline"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import AgentLogo from "@/assets/AgentLogo"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient, UiServiceClient } from "@/services/grpc-client"

interface HomeHeaderProps {
	shouldShowQuickWins?: boolean
}

const HomeHeader = ({ shouldShowQuickWins = false }: HomeHeaderProps) => {
	const { environment } = useExtensionState()

	const handleTakeATour = async () => {
		try {
			await UiServiceClient.openWalkthrough(EmptyRequest.create())
		} catch (error) {
			console.error("Error opening walkthrough:", error)
		}
	}
	const [isLogoExpanded, setIsLogoExpanded] = useState(() => {
		try {
			const saved = localStorage.getItem("logo-isExpanded")
			return saved ? JSON.parse(saved) : true
		} catch {
			return true
		}
	})

	const [isOverviewExpanded, setIsOverviewExpanded] = useState(() => {
		try {
			const saved = localStorage.getItem("overview-isExpanded")
			return saved ? JSON.parse(saved) : false
		} catch {
			return false
		}
	})

	useEffect(() => {
		try {
			localStorage.setItem("logo-isExpanded", JSON.stringify(isLogoExpanded))
		} catch (error) {
			console.warn("Failed to save logo expanded state:", error)
		}
	}, [isLogoExpanded])

	useEffect(() => {
		try {
			localStorage.setItem("overview-isExpanded", JSON.stringify(isOverviewExpanded))
		} catch (error) {
			console.warn("Failed to save overview expanded state:", error)
		}
	}, [isOverviewExpanded])

	const toggleLogoExpanded = () => {
		setIsLogoExpanded(!isLogoExpanded)
	}

	const toggleOverviewExpanded = () => {
		setIsOverviewExpanded(!isOverviewExpanded)
	}

	// Initial State for individual collapsible sections with localStorage persistence
	const [sectionStates, setSectionStates] = useState(() => {
		const defaultStates = {
			setup: true,
			introduction: false,
			taskContext: false,
			taskManagement: false,
			instructions: false,
			controls: false,
		}

		try {
			const saved = localStorage.getItem("homeHeader-sectionStates")
			if (saved) {
				const savedStates = JSON.parse(saved)
				// Merge saved states with defaults, ensuring new sections get their default values
				return { ...defaultStates, ...savedStates }
			}
			return defaultStates
		} catch (error) {
			console.warn("Failed to read homeHeader section states from localStorage:", error)
			return defaultStates
		}
	})

	// Save to localStorage whenever sectionStates changes
	useEffect(() => {
		try {
			localStorage.setItem("homeHeader-sectionStates", JSON.stringify(sectionStates))
		} catch (error) {
			console.warn("Failed to save homeHeader section states to localStorage:", error)
		}
	}, [sectionStates])

	const toggleSection = (sectionKey: keyof typeof sectionStates) => {
		setSectionStates((prev: typeof sectionStates) => {
			// Accordion mode: only one section can be expanded at a time
			const newStates = Object.keys(prev).reduce(
				(acc, key) => ({
					...acc,
					[key]: key === sectionKey ? !prev[sectionKey] : false,
				}),
				{} as typeof prev,
			)
			return newStates
		})
	}

	const { navigateToSettings, navigateToHistory } = useExtensionState()

	interface CollapsibleSectionProps {
		title: string
		children: React.ReactNode
		isExpanded: boolean
		onToggle: () => void
	}

	const CollapsibleSection = ({ title, children, isExpanded, onToggle }: CollapsibleSectionProps) => {
		return (
			<div style={{ marginBottom: "-5px", marginLeft: "-12px" }}>
				<div
					aria-expanded={isExpanded}
					aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title} section`}
					onClick={onToggle}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault()
							onToggle()
						}
					}}
					role="button"
					style={{
						// Section header styles
						cursor: "pointer",
						userSelect: "none",
						display: "flex",
						alignItems: "center",
						marginBottom: "8px",
						paddingBottom: "5px",
					}}
					tabIndex={0}>
					<span
						className={`codicon codicon-chevron-${isExpanded ? "down" : "right"}`}
						style={{
							marginRight: "3px",
							transform: "scale(0.9)",
						}}></span>
					<span
						style={{
							fontWeight: 600,
							color: "var(--vscode-descriptionForeground)",
						}}>
						{title}
					</span>
				</div>
				{isExpanded && (
					<div
						style={{
							//fontSize: "12px",
							marginLeft: "3px",
							paddingTop: "5px",
							//lineHeight: "18px",
							//borderLeft: "1px dotted var(--vscode-widget-border)"
						}}>
						{children}
						<div style={{ paddingBottom: "15px" }} />
					</div>
				)}
			</div>
		)
	}

	return (
		<div style={{ flexShrink: 0, scrollbarGutter: "stable" }}>
			<style>
				{`
					.info-header {
						cursor: pointer;
						user-select: none;
					}
					.info-header:hover {
						opacity: 0.8;
					}
					.overview-content {
						scrollbar-gutter: stable;
					}
				`}
			</style>
			{!isLogoExpanded && (
				<div
					aria-expanded={isLogoExpanded}
					aria-label={`${isLogoExpanded ? "Collapse" : "Expand"} logo section`}
					className="logo-header"
					onClick={toggleLogoExpanded}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault()
							toggleLogoExpanded()
						}
					}}
					role="button"
					style={{
						cursor: "pointer",
						marginLeft: "20px",
						marginTop: isLogoExpanded ? "0px" : "15px",
						marginBottom: isLogoExpanded ? "-10px" : "10px",
						display: "flex",
						alignItems: "center",
					}}
					tabIndex={0}>
					<span
						className={`codicon codicon-chevron-${isLogoExpanded ? "down" : "right"}`}
						style={{
							marginRight: "2px",
						}}></span>

					<span
						className="codicon codicon-sparkle-filled"
						style={{
							marginRight: "4px",
							fontSize: "15px",
						}}></span>
					<span
						style={{
							fontWeight: 600,
							textTransform: "uppercase",
							fontSize: "12px",
						}}>
						{agentName}
					</span>
				</div>
			)}
			{isLogoExpanded && (
				<div className="flex justify-center ml-5 mt-5 mb-5" onClick={toggleLogoExpanded}>
					<AgentLogo size={40} />
				</div>
			)}

			{/* Quick Wins Section */}
			{/* {shouldShowQuickWins && (
				<div className="mt-4">
					<button
						className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-panel bg-white/2 hover:bg-list-background-hover transition-colors duration-150 ease-in-out text-code-foreground text-sm font-medium cursor-pointer"
						onClick={handleTakeATour}
						type="button">
						Take a Tour
						<span className="codicon codicon-play scale-90"></span>
					</button>
				</div>
			)} */}

			{/* Overview Section */}

			<div
				aria-expanded={isOverviewExpanded}
				aria-label={`${isOverviewExpanded ? "Collapse" : "Expand"} overview section`}
				className="info-header"
				onClick={toggleOverviewExpanded}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault()
						toggleOverviewExpanded()
					}
				}}
				role="button"
				style={{
					//color: "var(--vscode-descriptionForeground)",
					margin: "20px 20px 10px 20px",
					display: "flex",
					alignItems: "center",
				}}
				tabIndex={0}>
				<span
					className={`codicon codicon-chevron-${isOverviewExpanded ? "down" : "right"}`}
					style={{
						marginRight: "2px",
						//transform: "scale(0.9)",
					}}></span>
				<span
					className="codicon codicon-info"
					style={{
						marginRight: "4px",
						fontSize: "15px",
					}}></span>
				<span
					style={{
						fontWeight: 600,
						textTransform: "uppercase",
						fontSize: "12px",
					}}>
					Overview
				</span>
			</div>

			{isOverviewExpanded && (
				<div
					className="overview-content"
					style={{
						paddingLeft: "0px",
						paddingRight: "5px",
						paddingBottom: "15px",
						marginLeft: "22px",
						marginRight: "0px",
						marginTop: "15px",
					}}>
					<div>
						<div>
							<div
								style={{
									fontSize: "13px",
									lineHeight: "18px",
									marginLeft: "15px",
									marginRight: "15px",
								}}>
								<div style={{ marginLeft: "-14px", marginBottom: "15px" }}>
									<p>
										This is a quick overview of the main features and recommendations on how to use{" "}
										{agentName}.
									</p>
								</div>

								<CollapsibleSection
									isExpanded={sectionStates.setup}
									onToggle={() => toggleSection("setup")}
									title="Workspace Setup">
									<div style={{ marginTop: "-8px", marginBottom: "16px", paddingLeft: "5px" }}>
										<ul
											style={{
												listStyleType: "disc",
												paddingLeft: "12px",
												marginBlockStart: 2,
												marginBlockEnd: 0,
											}}>
											<li style={{ marginBottom: "8px" }}>
												To view the workspace explorer and other views while working with {agentName},
												move it to the secondary side bar.
												<span style={{ fontSize: "11px", color: "var(--vscode-descriptionForeground)" }}>
													{" "}
													(Right-click on the {agentName} icon in the activity bar, and use{" "}
													<b>Move To</b> {">"} <b>Secondary Side Bar</b>)
												</span>
											</li>
											<li style={{ marginBottom: "3px" }}>Open a workspace folder</li>
											<li style={{ marginBottom: "3px" }}>
												Type <b>/git-instructions</b> to get the latest{" "}
												<a href="https://github.com/unievo/xpilot-instructions.git">
													instructions library
												</a>{" "}
												from GitHub into the workspace or global instructions folder.
											</li>
											<li style={{ marginBottom: "3px" }}>
												Use the Instructions chat menu to activate relevant instructions for each task:{" "}
												<span
													className="codicon codicon-folder-active"
													style={{ verticalAlign: "middle" }}
												/>
											</li>
										</ul>
									</div>
								</CollapsibleSection>
								<CollapsibleSection
									isExpanded={sectionStates.introduction}
									onToggle={() => toggleSection("introduction")}
									title="Task Overview">
									<div style={{ marginTop: "-8px", marginBottom: "16px", paddingLeft: "5px" }}>
										{agentName} manages your requests using <b>tasks</b>.
										<br />A task is composed of {agentName}'s system prompt, your chat messages, added files
										or folders, tool call results, and any additional information provided in instruction
										files.
										<br />
										<br />
										This forms the task context, which is sent to the selected AI model for processing and
										generating responses, that become also part of the context.
										<br />
										<br />
										The task context is stored in a context window (active task memory) which grows with each
										new task request as new information is added. Different AI models/providers support
										different context window sizes, and there is always a limit to the amount of information a
										task context can contain.
										<br />
										<br />
										The context window content translates into AI model tokens. Token usage information is
										displayed in the task header, including the current context window size, total input
										tokens (tokens sent to the model), total output tokens (tokens received from the model),
										and the maximum context window size the selected provider/model supports.
										<br />
										<br />
										For usage-based providers, the task log and the task header also shows the cost for each
										request and total cost of the task.
									</div>
								</CollapsibleSection>

								<CollapsibleSection
									isExpanded={sectionStates.taskContext}
									onToggle={() => toggleSection("taskContext")}
									title="Task Context">
									<div style={{ marginTop: "-4px", paddingLeft: "5px" }}>
										A key for having a task completed efficiently, is providing the right context information
										and tools to the right model -{" "}
										<a href="https://www.philschmid.de/context-engineering">context engineering</a>. These are
										some recommendations on how to achieve that:
									</div>
									<ul
										style={{
											listStyleType: "disc",
											paddingLeft: "20px",
											marginBlockStart: 8,
											marginBlockEnd: 0,
											marginBottom: "16px",
										}}>
										<li style={{ marginBottom: "5px" }}>
											When starting a new task, activate relevant context information and tools, by enabling
											applicable instruction files and relevant MCP servers the model can use.
										</li>
										<li style={{ marginBottom: "5px" }}>
											The context automatically includes information about the currently opened editor files
											and the files that are visible.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Include any other relevant context information by typing <b>@</b> when writing a chat
											message. You can also drag and drop files in the chat message by holding Shift.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Select any text in the file editor and use the <b>Add to {agentName}</b> context menu
											command to add the selected text and file to the current chat message.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use
											<VSCodeLink
												onClick={() => {
													toggleChatMode(PlanActMode.PLAN)
												}}
												style={{ display: "inline" }}>
												<b>Plan</b>
											</VSCodeLink>
											mode to make a plan before executing a complex task. Iterate on the plan as needed.
											After the plan is ready, switch to execution mode.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use
											<VSCodeLink
												onClick={() => {
													toggleChatMode(PlanActMode.ACT)
												}}
												style={{ display: "inline" }}>
												<b>Act</b>
											</VSCodeLink>
											mode to execute a plan, or to directly execute simpler tasks, commands, or workflows.
										</li>
										<li style={{ marginBottom: "5px" }}>
											You can configure different AI models for each mode in{" "}
											<VSCodeLink
												onClick={() => {
													navigateToSettings()
												}}>
												settings
											</VSCodeLink>
											.
										</li>
									</ul>
								</CollapsibleSection>

								<CollapsibleSection
									isExpanded={sectionStates.taskManagement}
									onToggle={() => toggleSection("taskManagement")}
									title="Task Management">
									<div style={{ marginTop: "-6px", paddingLeft: "5px" }}>
										Using tasks efficiently optimizes performance, costs, and results.
									</div>
									<ul
										style={{
											listStyleType: "disc",
											paddingLeft: "20px",
											marginBlockStart: 8,
											marginBlockEnd: 0,
											marginBottom: "16px",
										}}>
										<li style={{ marginBottom: "5px" }}>
											Always start a new task each time you have a new scope. Keep your task context
											specific to the same scope, so you can reuse its context later if necessary.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use the <b>/newtask</b> command in a current task, to create a new task with the
											summarized context from the current task. This is useful to continue work on a new
											scope with existing context information.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use the <b>/compact</b> command in a task with a large context window, to summarize
											the context window and reduce its size.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use autogenerated task checkpoints in the task log, to restore the task and/or
											workspace to a previous state.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Edit a previous chat message in the task log to restart from that point. This is
											useful to correct AI mistakes or change the course of the task.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Do not try to correct AI mistakes using new chat messages. Instead, restore a
											checkpoint, or edit a previous chat message and restart from that point.
										</li>

										<li style={{ marginBottom: "5px" }}>
											Use the
											<VSCodeLink
												onClick={() => {
													navigateToHistory()
												}}
												style={{ display: "inline" }}>
												task history
											</VSCodeLink>
											to filter, search, manage, and switch between previous tasks at any time.
										</li>
									</ul>
								</CollapsibleSection>

								<CollapsibleSection
									isExpanded={sectionStates.instructions}
									onToggle={() => toggleSection("instructions")}
									title="Instructions and Workflows">
									<div style={{ marginTop: "-18px", marginBottom: "-2px", paddingLeft: "5px" }}>
										<p>
											Use instruction files for rules, specifications, documentation, or any information
											that is relevant for the AI model to achieve optimal task completion.
										</p>
										<p>
											Use workflow files to define a sequence of executable steps that can be triggered as a
											slash command in a chat message using <b>/workflow-name</b>{" "}
											<i>followed by any optional info</i>. Workflows can be used to automate complex or
											repetitive tasks.
										</p>
										<p>
											Use <b>/new-instructions</b> <i>followed by a short description of purpose</i>, to
											create a new instruction file based on the current task context. This is useful to
											create reusable instructions for similar tasks in the future.
										</p>
										<p>
											Use the <b>/git-instructions</b> and <b>/git-workflows</b> commands to get instruction
											and workflow files from a dedicated git repository. You can specify as arguments any
											repository source, and the location (global/workspace). The repository will be cloned
											into the specified location. If the repository already exists, it will pull any
											updates.
										</p>
										<p>
											The <b>global</b> location is used to store instructions and workflows that are
											available across all workspaces.
										</p>
										<p>
											The <b>workspace</b> location is used to store instructions and workflows only in the
											current workspace.
										</p>
									</div>
								</CollapsibleSection>

								<CollapsibleSection
									isExpanded={sectionStates.controls}
									onToggle={() => toggleSection("controls")}
									title="Interface Controls">
									<div style={{ marginTop: "-18px", paddingLeft: "5px" }}>
										<p>Use the top bar controls to:</p>

										<ul
											style={{
												listStyleType: "disc",
												paddingLeft: "20px",
												marginBlockStart: 0,
												marginBlockEnd: 0,
											}}>
											<li style={{ marginBottom: "5px" }}>
												<span className="codicon codicon-add" style={{ verticalAlign: "middle" }} /> -
												start a new, empty task
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span className="codicon codicon-history" style={{ verticalAlign: "middle" }} /> -
												manage task history
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span className="codicon codicon-server" style={{ verticalAlign: "middle" }} /> -
												configure MCP servers
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span className="codicon codicon-gear" style={{ verticalAlign: "middle" }} /> -
												access settings
											</li>
										</ul>
										<p>Use the bottom chat bar controls to:</p>
										<ul
											style={{
												listStyleType: "disc",
												paddingLeft: "20px",
												marginBlockStart: 0,
												marginBlockEnd: 0,
											}}>
											<li style={{ marginBottom: "5px" }}>
												<strong>Auto:</strong> manage auto-approve settings
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span style={{ fontSize: "16px", marginBottom: 1 }}>@</span> - add context
												information
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span
													className="codicon codicon-diff-ignored"
													style={{ verticalAlign: "middle" }}
												/>{" "}
												- execute commands and workflows
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span className="codicon codicon-server" style={{ verticalAlign: "middle" }} /> -
												manage MCP servers
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span
													className="codicon codicon-folder-active"
													style={{ verticalAlign: "middle" }}
												/>{" "}
												- manage instructions, workflows and hooks
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span
													className="codicon codicon-sparkle-filled"
													style={{
														verticalAlign: "middle",
														color: iconHighlightColor,
														fontSize: "14px",
													}}
												/>{" "}
												- change the current provider/model
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span className="codicon codicon-files" style={{ verticalAlign: "middle" }} /> -
												attach supported files and images
											</li>
										</ul>
									</div>
								</CollapsibleSection>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default HomeHeader

function toggleChatMode(mode: PlanActMode) {
	StateServiceClient.togglePlanActModeProto(
		TogglePlanActModeRequest.create({
			mode: mode,
			chatContent: {
				message: "",
			},
		}),
	)
}
