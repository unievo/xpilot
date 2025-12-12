import { XIcon } from "lucide-react"
import HeroTooltip from "@/components/common/HeroTooltip"
import { Button } from "@/components/ui/button"

const NewTaskButton: React.FC<{
	onClick: () => void
	className?: string
}> = ({ className, onClick }) => {
	return (
		<HeroTooltip content="Close task" delay={1000} placement="bottom">
			<Button
				aria-label="New Task"
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					onClick()
				}}
				size="xs"
				variant="icon">
				<XIcon />
			</Button>
		</HeroTooltip>
	)
}

export default NewTaskButton
