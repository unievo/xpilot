import { cn } from "@heroui/react"
import { StringRequest } from "@shared/proto/cline/common"
import { ArrowDownToLineIcon } from "lucide-react"
import HeroTooltip from "@/components/common/HeroTooltip"
import { FileServiceClient } from "@/services/grpc-client"

const OpenDiskConversationHistoryButton: React.FC<{
	taskId?: string
	className?: string
}> = ({ taskId, className }) => {
	const handleOpenDiskConversationHistory = () => {
		if (!taskId) {
			return
		}

		FileServiceClient.openDiskConversationHistory(StringRequest.create({ value: taskId })).catch((err) => {
			console.error(err)
		})
	}

	return (
		<HeroTooltip content="Open Conversation History File" placement="right">
			<ArrowDownToLineIcon
				aria-label="Open Disk Conversation History"
				className={cn(
					"flex items-center border-0 opacity-50 hover:opacity-100 p-1 text-[var(--vscode-icon-foreground)]",
					className,
				)}
				onClick={handleOpenDiskConversationHistory}
				size="13"
			/>
		</HeroTooltip>
	)
}

export default OpenDiskConversationHistoryButton
