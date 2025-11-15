import { cn } from "@heroui/react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { useCallback, useState } from "react"
import HeroTooltip from "@/components/common/HeroTooltip"

const CopyTaskButton: React.FC<{
	taskText?: string
	className?: string
}> = ({ taskText, className }) => {
	const [copied, setCopied] = useState(false)

	const handleCopy = useCallback(() => {
		if (!taskText) {
			return
		}

		navigator.clipboard.writeText(taskText).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		})
	}, [taskText])

	return (
		<HeroTooltip content="Copy Text" placement="right">
			{copied ? (
				<CheckIcon
					aria-label="Copy"
					className={cn(
						"flex items-center border-0 opacity-50 hover:opacity-100 p-1 text-[var(--vscode-icon-foreground)]",
						className,
					)}
					size="12"
				/>
			) : (
				<CopyIcon
					aria-label="Copied"
					className={cn(
						"flex items-center border-0 opacity-50 hover:opacity-100 p-1 text-[var(--vscode-icon-foreground)]",
						className,
					)}
					onClick={handleCopy}
					size="12"
				/>
			)}
		</HeroTooltip>
	)
}

export default CopyTaskButton
