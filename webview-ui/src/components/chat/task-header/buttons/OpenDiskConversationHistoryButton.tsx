import { Button } from "@heroui/react"
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
			<Button
				aria-label="Open Disk Conversation History"
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					handleOpenDiskConversationHistory()
				}}
				size="icon"
				variant="icon">
				<ArrowDownToLineIcon />
			</Button>
		</HeroTooltip>
	)
}

OpenDiskConversationHistoryButton.displayName = "OpenDiskConversationHistoryButton"
export default OpenDiskConversationHistoryButton
