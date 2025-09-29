import { Button } from "@heroui/button"
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
			<Button
				aria-label="Copy"
				className={cn(
					"flex -m-0.5 items-center border-0 text-sm font-bold bg-transparent hover:opacity-100 p-0 text-[var(--vscode-icon-foreground)]",
					className,
				)}
				isIconOnly={true}
				onPress={() => handleCopy()}
				radius="sm"
				size="sm">
				{copied ? <CheckIcon size="13" /> : <CopyIcon size="13" />}
			</Button>
		</HeroTooltip>
	)
}

export default CopyTaskButton
