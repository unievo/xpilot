import { Tooltip } from "@heroui/react"
import React, { useMemo } from "react"
import { defaultBorderRadius } from "../config"

interface HeroTooltipProps {
	content: React.ReactNode
	children: React.ReactNode
	className?: string
	delay?: number
	closeDelay?: number
	placement?: "top" | "bottom" | "left" | "right"
	showArrow?: boolean
	disabled?: boolean
	autoFormat?: boolean
}

/**
 * HeroTooltip component that wraps the HeroUI tooltip with styling
 * similar to TaskTimelineTooltip
 */
const HeroTooltip: React.FC<HeroTooltipProps> = ({
	content,
	children,
	className,
	delay = 1000,
	closeDelay = 200,
	placement = "top",
	disabled = false,
	showArrow = false,
	autoFormat = true,
}) => {
	// If content is a simple string, wrap it in the tailwind styled divs
	const formattedContent = useMemo(() => {
		return typeof content === "string" || autoFormat ? (
			<div
				className={`bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] 
      border border-[var(--vscode-textBlockQuote-border)] p-0.5 w-full shadow-lg text-xs max-w-[250px] ${className}`}
				style={{ borderRadius: defaultBorderRadius }}>
				<div
					className="whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto text-[12px] 
        font-[var(--vscode-editor-font-family)]  p-1 rounded">
					{content}
				</div>
			</div>
		) : (
			// If content is already a React node, assume it's pre-formatted
			content
		)
	}, [content, className])

	return (
		<Tooltip
			classNames={{
				content: "hero-tooltip-content pointer-events-none", // Prevent hovering over tooltip
			}}
			closeDelay={closeDelay}
			content={formattedContent} // Immediate close when cursor moves away
			delay={delay}
			disableAnimation={true}
			isDisabled={disabled}
			placement={placement} // Disable animation for immediate appearance/disappearance
			showArrow={showArrow}>
			{children}
		</Tooltip>
	)
}

export default HeroTooltip
