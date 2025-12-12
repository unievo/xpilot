import { CheckIcon, CopyIcon } from "lucide-react"
import { useCallback, useState } from "react"
import HeroTooltip from "@/components/common/HeroTooltip"
import { Button } from "@/components/ui/button"

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
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					handleCopy()
				}}
				size="xs"
				variant="icon">
				{copied ? <CheckIcon /> : <CopyIcon />}
			</Button>
		</HeroTooltip>
	)
}

export default CopyTaskButton
