import { cn } from "@heroui/react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { FoldVerticalIcon } from "lucide-react"
import HeroTooltip from "@/components/common/HeroTooltip"

const CompactTaskButton: React.FC<{
	className?: string
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}> = ({ onClick, className }) => {
	return (
		<HeroTooltip content={"Reduces the number of tokens used by summarizing the task."} delay={500} placement="bottom">
			<VSCodeButton
				appearance="icon"
				className={cn(
					"text-foreground flex items-center text-sm font-bold hover:bg-transparent hover:opacity-80",
					className,
				)}
				onClick={onClick}
				type="button">
				<FoldVerticalIcon size={12} />
			</VSCodeButton>
		</HeroTooltip>
	)
}

export default CompactTaskButton
