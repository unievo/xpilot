import AgentLogo from "@/assets/AgentLogo"
import ClineLogoVariable from "@/assets/ClineLogoVariable"
import HeroTooltip from "@/components/common/HeroTooltip"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { agentName } from "@shared/Configuration"
import { ChatSettings } from "@shared/ChatSettings"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState, useEffect } from "react"
import { itemIconColor } from "../theme"

const HomeHeader = () => {
	const [isExpanded, setIsExpanded] = useState(() => {
		try {
			const saved = localStorage.getItem("homeHeader-isExpanded")
			return saved ? JSON.parse(saved) : true
		} catch (error) {
			console.warn("Failed to read homeHeader expansion state from localStorage:", error)
			return true
		}
	})

	// Save to localStorage whenever isExpanded changes
	useEffect(() => {
		try {
			localStorage.setItem("homeHeader-isExpanded", JSON.stringify(isExpanded))
		} catch (error) {
			console.warn("Failed to save homeHeader expansion state to localStorage:", error)
		}
	}, [isExpanded])

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded)
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

	const { navigateToSettings, navigateToHistory, setChatSettings, navigateToMcp } = useExtensionState()

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
					onClick={onToggle}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault()
							onToggle()
						}
					}}
					role="button"
					tabIndex={0}
					aria-expanded={isExpanded}
					aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title} section`}
					style={{
						// Section header styles
						cursor: "pointer",
						userSelect: "none",
						display: "flex",
						alignItems: "center",
						marginBottom: "8px",
						paddingBottom: "5px",
					}}>
					<span
						className={`codicon codicon-chevron-${isExpanded ? "down" : "right"}`}
						style={{
							marginRight: "3px",
							transform: "scale(0.9)",
							//color: "var(--vscode-descriptionForeground)",
						}}></span>
					<span
						style={{
							fontWeight: 600,
							color: "var(--vscode-descriptionForeground)",
							//lineHeight: "20px",
							//fontSize: "12px",
							//color: "var(--vscode-foreground)",
							//opacity: 0.9,
						}}>
						{title}
					</span>
				</div>
				{isExpanded && (
					<div
						style={{
							//fontSize: "12px",
							marginLeft: "2px",
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

			<div
				className="info-header"
				onClick={toggleExpanded}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault()
						toggleExpanded()
					}
				}}
				role="button"
				tabIndex={0}
				aria-expanded={isExpanded}
				aria-label={`${isExpanded ? "Collapse" : "Expand"} overview section`}
				style={{
					//color: "var(--vscode-descriptionForeground)",
					margin: "20px 20px 10px 20px",
					display: "flex",
					alignItems: "center",
				}}>
				<span
					className={`codicon codicon-chevron-${isExpanded ? "down" : "right"}`}
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

			{isExpanded && (
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
									//fontSize: "13px",
									lineHeight: "18px",
									marginLeft: "15px",
									marginRight: "15px",
									//opacity: 0.9,
								}}>
								<div className="flex justify-center my-4">
									<AgentLogo size={40} />
								</div>
								<div style={{ marginLeft: "-14px", marginBottom: "15px" }}>
									{/* <p>
										This is a quick overview of the main features and recommendations on how to use{" "}
										{agentName}.
									</p> */}
								</div>

								<CollapsibleSection
									title="Workspace Setup"
									isExpanded={sectionStates.setup}
									onToggle={() => toggleSection("setup")}>
									<div style={{ marginTop: "-8px", paddingLeft: "5px" }}>
										<ul
											style={{
												listStyleType: "disc",
												paddingLeft: "12px",
												marginBlockStart: 2,
												marginBlockEnd: 0,
											}}>
											<li style={{ marginBottom: "8px" }}>
												To be able to see your file explorer and other views while working with{" "}
												{agentName}, move it to the secondary side bar. Right-click the {agentName} icon
												in the activity bar, and use <b>Move To - Secondary Side Bar</b>.
											</li>
											<li style={{ marginBottom: "3px" }}>Open a workspace folder in VS Code.</li>
										</ul>
									</div>
								</CollapsibleSection>
								<CollapsibleSection
									title="Task Overview"
									isExpanded={sectionStates.introduction}
									onToggle={() => toggleSection("introduction")}>
									<div style={{ marginTop: "-8px", paddingLeft: "5px" }}>
										{agentName} manages your requests using <b>tasks</b>. A task is composed of the agent
										system prompt, your chat messages, tool responses, and any additional information
										provided, such as instruction files. This forms the task context, which is sent to the AI
										model to process and generate responses that also become part of the task context.
										<br />
										<br />
										The current task context is stored in a context window, and it is sent to the AI model
										with each new task request. The task context window grows with each new request and adds
										to the total tokens used by the task.
										<br />
										<br />
										The task header displays the current context window size, total input tokens (tokens sent
										to the model), total output tokens (tokens received from the model), and the maximum
										context window size the selected provider/model supports.
										<br />
										<br />
										For usage-based providers, the task header also shows the total cost of the task.
									</div>
								</CollapsibleSection>

								<CollapsibleSection
									title="Task Context"
									isExpanded={sectionStates.taskContext}
									onToggle={() => toggleSection("taskContext")}>
									<div style={{ marginTop: "-8px", paddingLeft: "5px" }}>
										The key to having a task completed efficiently is providing the right context information
										and tools to the AI model -{" "}
										<a href="https://www.philschmid.de/context-engineering">context engineering</a>.
									</div>
									<ul
										style={{
											listStyleType: "disc",
											paddingLeft: "20px",
											marginBlockStart: 8,
											marginBlockEnd: 0,
										}}>
										<li style={{ marginBottom: "5px" }}>
											When starting a new task, activate relevant context information and tools by enabling
											instruction files applicable to the task and any relevant MCP servers the model can
											use in the task.
										</li>
										<li style={{ marginBottom: "5px" }}>
											The context automatically includes information about the currently opened editor files
											and the files that are visible. Add any other references to relevant files, folders,
											or code problems by typing the <b>@</b> symbol when writing a chat message.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Select any text in the editor, and use the <b>Add to {agentName}</b> command in the
											editor context menu to add the text to the current chat message.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use
											<VSCodeLink
												style={{ display: "inline" }}
												onClick={() => {
													setChatSettings({ mode: "plan" })
												}}>
												<b>Plan</b>
											</VSCodeLink>
											mode to make a plan before executing a complex task. Iterate on the plan as needed.
											After the plan is ready, switch to execution mode.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use
											<VSCodeLink
												style={{ display: "inline" }}
												onClick={() => {
													setChatSettings({ mode: "act" })
												}}>
												<b>Act</b>
											</VSCodeLink>
											mode to execute a plan or to directly execute simpler tasks, commands, or workflows.
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
									title="Task Management"
									isExpanded={sectionStates.taskManagement}
									onToggle={() => toggleSection("taskManagement")}>
									<div style={{ marginTop: "-8px", paddingLeft: "5px" }}>
										Using tasks efficiently optimizes performance, costs, and results.
									</div>
									<ul
										style={{
											listStyleType: "disc",
											paddingLeft: "20px",
											marginBlockStart: 8,
											marginBlockEnd: 0,
										}}>
										<li style={{ marginBottom: "5px" }}>
											Always start a new task each time you have a new scope. Keep your task context
											specific to the same scope, so you can reuse it later if necessary.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use the <b>/New Task</b> command in a previous task to create a new task with the
											summarized context from the task. This is useful to continue work on a new scope with
											existing context from previous tasks.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use the <b>/Compact Task</b> command in a task with a large context window to
											summarize the context window and reduce its size.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Use autogenerated task checkpoints in the task's log to restore the task and/or
											workspace to a previous state.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Edit a previous chat message in a task's log to restart from that point. This is
											useful to correct AI mistakes or change the course of the task.
										</li>
										<li style={{ marginBottom: "5px" }}>
											Do not try to correct AI mistakes in the chat messages, as it can degrade performance.
											Instead, restore a checkpoint or edit a previous message and restart from that point.
										</li>

										<li style={{ marginBottom: "5px" }}>
											Use
											<VSCodeLink
												style={{ display: "inline" }}
												onClick={() => {
													navigateToHistory()
												}}>
												task history
											</VSCodeLink>
											to filter, search, manage, and switch between previous tasks at any time.
										</li>
									</ul>
								</CollapsibleSection>

								<CollapsibleSection
									title="Instructions and Workflows"
									isExpanded={sectionStates.instructions}
									onToggle={() => toggleSection("instructions")}>
									<div style={{ marginTop: "-20px", marginBottom: "-6px", paddingLeft: "5px" }}>
										<p>
											Use instruction files for rules, specifications, documentation, or any information
											that is relevant for the AI model to achieve optimal task completion.
										</p>
										<p>
											Use workflow files to define a sequence of executable steps that can be triggered as a
											command by typing <b>/Workflow name</b> in the chat. Workflows can be used to automate
											complex or repetitive tasks.
										</p>
										<p>
											Use the <b>/Git Instructions</b> and <b>/Git Workflows</b> commands to get instruction
											and workflow files from a git repository. The first execution will clone the
											repository into the chosen location (global/workspace). Subsequent executions will
											pull the latest changes.
										</p>
									</div>
								</CollapsibleSection>

								<CollapsibleSection
									title="Interface Controls"
									isExpanded={sectionStates.controls}
									onToggle={() => toggleSection("controls")}>
									<div style={{ marginTop: "-20px", paddingLeft: "5px" }}>
										<p>
											There are two main locations to control the interface: the top bar and the bottom chat
											bar.
										</p>
										<p>Use the top bar controls to:</p>

										<ul
											style={{
												listStyleType: "disc",
												paddingLeft: "20px",
												marginBlockStart: 0,
												marginBlockEnd: 0,
											}}>
											<li style={{ marginBottom: "5px" }}>
												<span style={{ verticalAlign: "middle" }} className="codicon codicon-plus" /> -
												start a new, empty task
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span style={{ verticalAlign: "middle" }} className="codicon codicon-history" /> -
												manage task history
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span style={{ verticalAlign: "middle" }} className="codicon codicon-server" /> -
												configure MCP servers
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span style={{ verticalAlign: "middle" }} className="codicon codicon-gear" /> -
												access settings
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span
													style={{ verticalAlign: "middle" }}
													className="codicon codicon-link-external"
												/>{" "}
												- open new {agentName} instances
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
													style={{ verticalAlign: "middle" }}
													className="codicon codicon-diff-ignored"
												/>{" "}
												- execute commands and workflows
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span
													style={{ verticalAlign: "middle" }}
													className="codicon codicon-folder-active"
												/>{" "}
												- manage instructions and workflows
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span style={{ verticalAlign: "middle" }} className="codicon codicon-server" /> -
												manage MCP servers
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span style={{ verticalAlign: "middle" }} className="codicon codicon-file-add" />{" "}
												- attach supported files and images
											</li>
											<li style={{ marginBottom: "5px" }}>
												<span
													style={{ verticalAlign: "middle", color: itemIconColor, fontSize: "14px" }}
													className="codicon codicon-sparkle-filled"
												/>{" "}
												- change the current provider/model
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
