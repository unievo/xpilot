import { menuFontSize, menuRowBackground, menuRowDisabledBackground } from "@components/config"
import { StringRequest } from "@shared/proto/cline/common"
import { RuleFileRequest } from "@shared/proto/index.cline"
import { FilePen, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FileServiceClient } from "@/services/grpc-client"

const RuleRow: React.FC<{
	rulePath: string
	enabled: boolean
	isGlobal: boolean
	ruleType: string
	toggleRule: (rulePath: string, enabled: boolean) => void
	isRemote?: boolean
	alwaysEnabled?: boolean
}> = ({ rulePath, enabled, isGlobal, toggleRule, ruleType, isRemote = false, alwaysEnabled = false }) => {
	const [showConfirmDelete, setShowConfirmDelete] = useState(false)

	// Check if the path type is Windows
	const win32Path = /^[a-zA-Z]:\\/.test(rulePath)
	// Get the filename from the path for display
	const displayName = (() => {
		const filename = rulePath.split(win32Path ? "\\" : "/").pop() || rulePath
		// Remove the file extension for display purposes
		const dotIndex = filename.lastIndexOf(".")
		return dotIndex > 0 ? filename.substring(0, dotIndex) : filename
		//return filename
	})()

	// For remote rules, the rulePath is already the display name
	const finalDisplayName = isRemote ? rulePath : displayName
	const isDisabled = isRemote && alwaysEnabled

	// Get the directory name from the path for display
	const directoryName = (() => {
		const pathSegments = rulePath.split(win32Path ? "\\" : "/")
		// Remove the filename (last segment) to get directory path
		const dirSegments = pathSegments.slice(0, -1)
		// Return the last directory name, or empty string if at root
		return dirSegments.length > 0 ? dirSegments[dirSegments.length - 1] : ""
	})()

	const getRuleTypeIcon = () => {
		switch (ruleType) {
			case "cursor":
				return (
					<svg
						height="16"
						style={{ verticalAlign: "middle" }}
						viewBox="0 0 24 24"
						width="16"
						xmlns="http://www.w3.org/2000/svg">
						<g fill="none" stroke="currentColor" strokeWidth="1.2">
							<path d="M12 4L5 8l7 4 7-4-7-4z" fill="rgba(255,255,255,0.2)" />
							<path d="M5 8v8l7 4v-8L5 8z" fill="rgba(255,255,255,0.1)" />
							<path d="M19 8v8l-7 4v-8l7-4z" fill="rgba(255,255,255,0.15)" />
							<line x1="5" x2="12" y1="8" y2="12" />
							<line x1="12" x2="19" y1="12" y2="8" />
							<line x1="12" x2="12" y1="12" y2="20" />
						</g>
					</svg>
				)
			case "windsurf":
				return (
					<svg
						height="16"
						style={{ verticalAlign: "middle" }}
						viewBox="0 0 24 24"
						width="16"
						xmlns="http://www.w3.org/2000/svg">
						<g fill="currentColor" stroke="currentColor" strokeWidth="1">
							<path d="M6 18L16 5L14 18H6z" fill="currentColor" />
							<line strokeWidth="1.5" x1="14" x2="16" y1="18" y2="5" />
							<path d="M4 19h12c0.5 0 1-0.3 1-1s-0.3-1-1-1H4c-0.5 0-1 0.3-1 1s0.3 1 1 1z" fill="currentColor" />
							<line strokeWidth="1" x1="14" x2="16" y1="13" y2="9" />
						</g>
					</svg>
				)
			case "agents":
				return (
					<svg
						height="16"
						style={{ verticalAlign: "middle" }}
						viewBox="0 0 24 24"
						width="16"
						xmlns="http://www.w3.org/2000/svg">
						<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
							<circle cx="12" cy="8" r="3" />
							<path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" />
						</g>
					</svg>
				)
			default:
				return <span className="codicon codicon-markdown" style={{ fontSize: "14px", verticalAlign: "-18%" }}></span>
		}
	}

	const handleEditClick = () => {
		FileServiceClient.openFile(StringRequest.create({ value: rulePath })).catch((err) =>
			console.error("Failed to open file:", err),
		)
	}

	const handleDeleteClick = () => {
		setShowConfirmDelete(true)
	}

	const handleConfirmDelete = () => {
		FileServiceClient.deleteRuleFile(
			RuleFileRequest.create({
				rulePath,
				isGlobal,
				type: ruleType || "cline",
			}),
		).catch((err) => console.error("Failed to delete file:", err))
		setShowConfirmDelete(false)
	}

	const handleCancelDelete = () => {
		setShowConfirmDelete(false)
	}

	return (
		<div className="mb-0.5">
			{/* Rule Row */}
			<div
				style={{
					fontSize: menuFontSize,
					display: "flex",
					alignItems: "center",
					overflow: "hidden",
					padding: "1px 1px 1px 2.5px",
					background: enabled ? menuRowBackground : menuRowDisabledBackground,
					borderRadius: "4px",
					opacity: isDisabled ? 0.5 : enabled ? 1 : 0.8,
					cursor: "default",
				}}>
				<span
					style={{
						flex: 1,
						overflow: "hidden",
						whiteSpace: "normal",
						display: "flex",
						alignItems: "center",
						marginRight: "4px",
					}}
					title={rulePath}>
					{getRuleTypeIcon() && (
						<span style={{ color: "var(--vscode-textLink-activeForeground)", opacity: 0.7 }}>
							{getRuleTypeIcon()}
						</span>
					)}
					<span
						className="ph-no-capture"
						style={{ marginLeft: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
						{finalDisplayName}{" "}
						<span
							style={{
								fontSize: "10px",
								opacity: 0.6,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}>
							{directoryName && `/${directoryName}`}
						</span>
					</span>
					{ruleType === "agents" && (
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="mt-1 ml-1.5 cursor-help">
									<i className="codicon codicon-info" style={{ fontSize: "12px", opacity: 0.7 }} />
								</span>
							</TooltipTrigger>
							<TooltipContent>
								Searches recursively for all AGENTS.md files in the workspace when a top-level AGENTS.md exists
							</TooltipContent>
						</Tooltip>
					)}
				</span>

				{/* Toggle Switch */}
				<div className="flex items-center space-x-2 gap-2">
					<Switch
						checked={enabled}
						className="mx-1"
						disabled={isDisabled}
						key={rulePath}
						onClick={() => toggleRule(rulePath, !enabled)}
						title={isDisabled ? "This rule is required and cannot be disabled" : undefined}
					/>
					<Button
						aria-label="Edit file"
						disabled={isRemote}
						onClick={handleEditClick}
						size="xs"
						title="Edit file"
						variant="icon">
						<FilePen />
					</Button>
					{!showConfirmDelete ? (
						<Button
							aria-label="Delete file"
							disabled={isRemote}
							onClick={handleDeleteClick}
							size="xs"
							title="Delete file"
							variant="icon">
							<Trash2Icon />
						</Button>
					) : (
						<>
							<Button
								aria-label="Confirm delete"
								onClick={handleConfirmDelete}
								// style={{ width: "25px", height: "20px" }}
								title="Confirm delete">
								✓
							</Button>
							<Button
								aria-label="Cancel delete"
								onClick={handleCancelDelete}
								// style={{ width: "25px", height: "20px" }}
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

export default RuleRow
