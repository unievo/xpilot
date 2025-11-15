import { cn } from "@heroui/react"
import { StringArrayRequest } from "@shared/proto/cline/common"
import { TrashIcon } from "lucide-react"
import HeroTooltip from "@/components/common/HeroTooltip"
import { TaskServiceClient } from "@/services/grpc-client"
import { formatSize } from "@/utils/format"

const DeleteTaskButton: React.FC<{
	taskId?: string
	taskSize?: number
	className?: string
}> = ({ taskId, className, taskSize }) => (
	<HeroTooltip content={`Delete Task (size: ${taskSize ? formatSize(taskSize) : "--"})`} placement="right">
		<TrashIcon
			aria-label="Delete Task"
			className={cn(
				"flex items-center border-0 opacity-50 hover:opacity-100 p-1 text-[var(--vscode-icon-foreground)]",
				className,
			)}
			onClick={() => {
				taskId && TaskServiceClient.deleteTasksWithIds(StringArrayRequest.create({ value: [taskId] }))
			}}
			size="12"
		/>
	</HeroTooltip>
)
DeleteTaskButton.displayName = "DeleteTaskButton"

export default DeleteTaskButton
