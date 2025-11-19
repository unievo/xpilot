import { FoldVerticalIcon } from "lucide-react"
import HeroTooltip from "@/components/common/HeroTooltip"
import { Button } from "@/components/ui/button"

const CompactTaskButton: React.FC<{
	className?: string
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}> = ({ onClick, className }) => {
	return (
		<HeroTooltip content={"Compact Task"} delay={500} placement="bottom">
			<Button
				aria-label="Compact Task"
				className="[&_svg]:size-3"
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					onClick(e)
				}}
				size="icon"
				variant="icon">
				<FoldVerticalIcon size={12} />
			</Button>
		</HeroTooltip>
	)
}

export default CompactTaskButton
