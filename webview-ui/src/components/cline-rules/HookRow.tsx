import { StringRequest } from "@shared/proto/cline/common"
import { DeleteHookRequest, HooksToggles } from "@shared/proto/cline/file"
import { FilePen, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FileServiceClient } from "@/services/grpc-client"
import { iconHighlightColor, menuFontSize, menuRowBackground, menuRowDisabledBackground } from "../config"

interface HookRowProps {
	hookName: string
	enabled: boolean
	absolutePath: string
	isGlobal: boolean
	isWindows: boolean
	workspaceName?: string
	onToggle: (hookName: string, newEnabled: boolean) => void
	onDelete: (hooksToggles: HooksToggles) => void
}

const HookRow: React.FC<HookRowProps> = ({
	hookName,
	enabled,
	absolutePath,
	isGlobal,
	isWindows,
	workspaceName,
	onToggle,
	onDelete,
}) => {
	const handleEditClick = () => {
		FileServiceClient.openFile(StringRequest.create({ value: absolutePath })).catch((err) =>
			console.error("Failed to open file:", err),
		)
	}
	const [showConfirmDelete, setShowConfirmDelete] = useState(false)

	const handleDeleteClick = () => {
		setShowConfirmDelete(true)
	}

	const handleConfirmDelete = () => {
		FileServiceClient.deleteHook(
			DeleteHookRequest.create({
				hookName,
				isGlobal,
				workspaceName,
			}),
		)
			.then((response) => {
				if (response.hooksToggles) {
					onDelete(response.hooksToggles)
				}
			})
			.catch((err) => console.error("Failed to delete hook:", err))
	}

	const handleCancelDelete = () => {
		setShowConfirmDelete(false)
	}

	return (
		<div className="mb-0.5">
			<div
				// className="flex items-center px-2 py-3 rounded bg-text-block-background max-h-4"
				style={{
					fontSize: menuFontSize,
					display: "flex",
					alignItems: "center",
					overflow: "hidden",
					padding: "1px 1px 1px 2.5px",
					background: enabled ? menuRowBackground : menuRowDisabledBackground,
					borderRadius: "4px",
					opacity: enabled ? 1 : 0.8,
					cursor: "default",
				}}>
				<span className="flex-1 overflow-hidden break-all whitespace-normal flex items-center mr-1">
					<span className="codicon codicon-terminal mr-1" style={{ color: iconHighlightColor, fontSize: "inherit" }} />
					<span className="ph-no-capture">{hookName}</span>
				</span>

				{/* Toggle Switch */}
				<div className="flex items-center space-x-0 gap-0.5">
					<div
						title={
							isWindows
								? "Hook toggling not supported on Windows. Hooks can be edited and deleted, but won't execute."
								: undefined
						}>
						<Switch
							checked={enabled}
							className="mx-1"
							disabled={isWindows}
							key={hookName}
							onClick={() => onToggle(hookName, !enabled)}
							style={isWindows ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
						/>
					</div>
					<Button aria-label="Edit hook file" onClick={handleEditClick} size="xs" title="Edit hook file" variant="icon">
						<FilePen />
					</Button>
					{!showConfirmDelete ? (
						<Button aria-label="Delete file" onClick={handleDeleteClick} size="xs" title="Delete file" variant="icon">
							<Trash2Icon />
						</Button>
					) : (
						<>
							<Button
								aria-label="Confirm delete"
								onClick={handleConfirmDelete}
								style={{ width: "18px", height: "18px" }}
								title="Confirm delete">
								✓
							</Button>
							<Button
								aria-label="Cancel delete"
								onClick={handleCancelDelete}
								style={{ width: "18px", height: "18px" }}
								title="Cancel delete">
								✗
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default HookRow
