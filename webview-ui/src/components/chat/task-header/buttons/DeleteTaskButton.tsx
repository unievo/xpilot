import { StringArrayRequest } from "@shared/proto/cline/common"
import { TrashIcon } from "lucide-react"
import HeroTooltip from "@/components/common/HeroTooltip"
import { Button } from "@/components/ui/button"
import { TaskServiceClient } from "@/services/grpc-client"
import { formatSize } from "@/utils/format"

const DeleteTaskButton: React.FC<{
	taskId?: string
	taskSize?: number
	className?: string
}> = ({ taskId, className, taskSize }) => (
	<HeroTooltip content={`Delete Task (size: ${taskSize ? formatSize(taskSize) : "--"})`} placement="right">
		<Button
			aria-label="Delete Task"
			disabled={!taskId}
			onClick={(e) => {
				e.preventDefault()
				e.stopPropagation()
				taskId && TaskServiceClient.deleteTasksWithIds(StringArrayRequest.create({ value: [taskId] }))
			}}
			size="xs"
			variant="icon">
			<TrashIcon />
		</Button>
	</HeroTooltip>
)
DeleteTaskButton.displayName = "DeleteTaskButton"

export default DeleteTaskButton
