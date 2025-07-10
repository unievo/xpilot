import React, { useCallback, useRef, useEffect } from "react"
import { SlashCommand, getMatchingSlashCommands } from "@/utils/slash-commands"
import { dropdownBackground, itemIconColor } from "../theme"

interface SlashCommandMenuProps {
	onSelect: (command: SlashCommand) => void
	selectedIndex: number
	setSelectedIndex: (index: number) => void
	onMouseDown: () => void
	query: string
	localWorkflowToggles?: Record<string, boolean>
	globalWorkflowToggles?: Record<string, boolean>
}

const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
	onSelect,
	selectedIndex,
	setSelectedIndex,
	onMouseDown,
	query,
	localWorkflowToggles = {},
	globalWorkflowToggles = {},
}) => {
	const menuRef = useRef<HTMLDivElement>(null)

	const handleClick = useCallback(
		(command: SlashCommand) => {
			onSelect(command)
		},
		[onSelect],
	)

	useEffect(() => {
		if (menuRef.current) {
			const selectedElement = menuRef.current.querySelector(`#slash-command-menu-item-${selectedIndex}`) as HTMLElement
			if (selectedElement) {
				const menuRect = menuRef.current.getBoundingClientRect()
				const selectedRect = selectedElement.getBoundingClientRect()

				if (selectedRect.bottom > menuRect.bottom) {
					menuRef.current.scrollTop += selectedRect.bottom - menuRect.bottom
				} else if (selectedRect.top < menuRect.top) {
					menuRef.current.scrollTop -= menuRect.top - selectedRect.top
				}
			}
		}
	}, [selectedIndex])

	// Filter commands based on query
	const filteredCommands = getMatchingSlashCommands(query, localWorkflowToggles, globalWorkflowToggles)
	const defaultCommands = filteredCommands.filter((cmd) => cmd.section === "task" || !cmd.section)
	const instructionsCommands = filteredCommands.filter((cmd) => cmd.section === "instructions")
	const workflowCommands = filteredCommands.filter((cmd) => cmd.section === "custom")

	// Create a reusable function for rendering a command section
	const renderCommandSection = (commands: SlashCommand[], title: string, indexOffset: number, showDescriptions: boolean) => {
		if (commands.length === 0) return null

		return (
			<>
				<div className="text-[var(--vscode-descriptionForeground)] px-1 py-1 font-normal">{title}</div>
				{commands.map((command, index) => {
					const itemIndex = index + indexOffset
					return (
						<div
							key={command.name}
							id={`slash-command-menu-item-${itemIndex}`}
							className={`slash-command-menu-item py-0.5 px-1.5 cursor-pointer flex flex-col ${
								itemIndex === selectedIndex
									? "bg-[var(--vscode-quickInputList-focusBackground)] text-[var(--vscode-quickInputList-focusForeground)]"
									: ""
							} hover:bg-[var(--vscode-list-hoverBackground)]`}
							onClick={() => handleClick(command)}
							onMouseEnter={() => setSelectedIndex(itemIndex)}>
							<div
								className="font-normal whitespace-nowrap overflow-hidden text-ellipsis flex items-end"
								style={{ paddingTop: "1px", paddingBottom: "2px" }}>
								<span
									className="codicon codicon-sparkle"
									style={{ color: itemIconColor, opacity: 0.9, fontSize: "13px", marginRight: 4 }}
								/>
								<span>{command.name}</span>
								{showDescriptions && command.description && (
									<span className="text-[0.8em] text-[var(--vscode-descriptionForeground)] whitespace-nowrap overflow-hidden text-ellipsis">
										<span className="ph-no-capture ml-1.5 opacity-80">{command.description}</span>
									</span>
								)}
							</div>
						</div>
					)
				})}
			</>
		)
	}

	return (
		<div
			style={{ fontSize: "12px" }}
			className="absolute bottom-[calc(100%-7px)] left-[7px] right-[7px] overflow-x-hidden z-[1000]"
			onMouseDown={onMouseDown}>
			<div
				ref={menuRef}
				className="border border-[var(--vscode-editorGroup-border)] mb-1.5 rounded-md shadow-[0_2px_5px_rgba(0,0,0,0.25)] flex flex-col overflow-y-auto"
				style={{
					paddingBottom: 3,
					background: dropdownBackground,
					maxHeight: "min(800px, calc(50vh))",
					overscrollBehavior: "contain",
				}}>
				{filteredCommands.length > 0 ? (
					<>
						{(() => {
							const sections = [
								{ commands: defaultCommands, title: "Task", showDescriptions: true },
								{ commands: instructionsCommands, title: "Instructions", showDescriptions: true },
								{ commands: workflowCommands, title: "Workflows", showDescriptions: false },
							]

							let currentIndex = 0
							return sections.map((section, sectionIndex) => {
								const sectionElement = renderCommandSection(
									section.commands,
									section.title,
									currentIndex,
									section.showDescriptions,
								)
								currentIndex += section.commands.length
								return sectionElement
							})
						})()}
					</>
				) : (
					<div className="py-2 px-3 cursor-default flex flex-col">
						<div className="text-[0.85em] text-[var(--vscode-descriptionForeground)]">No matches found</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default SlashCommandMenu
