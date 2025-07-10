import { FileServiceClient } from "@/services/grpc-client"
import { DeleteRuleFileRequest } from "@shared/proto-conversions/file/rule-files-conversion"
import { StringRequest } from "@shared/proto/common"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { rowBackground, rowBackgroundDisabled } from "../theme"
import { useState } from "react"

const RuleRow: React.FC<{
	rulePath: string
	enabled: boolean
	isGlobal: boolean
	ruleType: string
	toggleRule: (rulePath: string, enabled: boolean) => void
}> = ({ rulePath, enabled, isGlobal, toggleRule, ruleType }) => {
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
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						style={{ verticalAlign: "middle" }}>
						<g fill="none" stroke="currentColor" strokeWidth="1.2">
							<path d="M12 4L5 8l7 4 7-4-7-4z" fill="rgba(255,255,255,0.2)" />
							<path d="M5 8v8l7 4v-8L5 8z" fill="rgba(255,255,255,0.1)" />
							<path d="M19 8v8l-7 4v-8l7-4z" fill="rgba(255,255,255,0.15)" />
							<line x1="5" y1="8" x2="12" y2="12" />
							<line x1="12" y1="12" x2="19" y2="8" />
							<line x1="12" y1="12" x2="12" y2="20" />
						</g>
					</svg>
				)
			case "windsurf":
				return (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						style={{ verticalAlign: "middle" }}>
						<g fill="currentColor" stroke="currentColor" strokeWidth="1">
							<path d="M6 18L16 5L14 18H6z" fill="currentColor" />
							<line x1="14" y1="18" x2="16" y2="5" strokeWidth="1.5" />
							<path d="M4 19h12c0.5 0 1-0.3 1-1s-0.3-1-1-1H4c-0.5 0-1 0.3-1 1s0.3 1 1 1z" fill="currentColor" />
							<line x1="14" y1="13" x2="16" y2="9" strokeWidth="1" />
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
			DeleteRuleFileRequest.create({
				rulePath: rulePath,
				isGlobal: isGlobal,
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
					display: "flex",
					alignItems: "center",
					overflow: "hidden",
					padding: "1px 1px 1px 2.5px",
					background: enabled ? rowBackground : rowBackgroundDisabled,
					borderRadius: "4px",
					opacity: enabled ? 1 : 0.8,
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
					className="ph-no-capture"
					title={rulePath}>
					{getRuleTypeIcon() && (
						<span style={{ color: "var(--vscode-textLink-activeForeground)", opacity: 0.7 }}>
							{getRuleTypeIcon()}
						</span>
					)}
					<span style={{ marginLeft: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
						{displayName}{" "}
						<span
							style={{
								fontSize: "10px",
								opacity: 0.6,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}>
							/{directoryName}
						</span>
					</span>
				</span>

				{/* Toggle Switch */}
				<div style={{ display: "flex", alignItems: "center", marginTop: "0px", marginLeft: "4px", gap: "0px" }}>
					<div
						role="switch"
						aria-checked={enabled}
						tabIndex={0}
						style={{
							width: "20px",
							height: "11px",
							marginRight: "2px",
							borderRadius: "5px",
							position: "relative",
							cursor: "pointer",
							transition: "background-color 0.2s",
							backgroundColor: enabled
								? "var(--vscode-testing-iconPassed)"
								: "var(--vscode-titleBar-inactiveForeground)",
							opacity: enabled ? 0.9 : 0.5,
						}}
						onClick={() => toggleRule(rulePath, !enabled)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault()
								toggleRule(rulePath, !enabled)
							}
						}}>
						<div
							style={{
								width: "8px",
								height: "8px",
								backgroundColor: "white",
								border: "1px solid color-mix(in srgb, #666666 65%, transparent)",
								borderRadius: "50%",
								position: "absolute",
								top: "0.5px",
								left: enabled ? "10px" : "1px",
								transition: "left 0.2s",
							}}
						/>
					</div>
					<VSCodeButton
						appearance="icon"
						aria-label="Edit file"
						title="Edit file"
						onClick={handleEditClick}
						style={{ height: "20px" }}>
						<span
							className="codicon codicon-edit"
							style={{ fontSize: "13px", marginTop: "2px", marginRight: "-2px" }}
						/>
					</VSCodeButton>
					{!showConfirmDelete ? (
						<VSCodeButton
							appearance="icon"
							aria-label="Delete file"
							title="Delete file"
							onClick={handleDeleteClick}
							style={{ height: "20px" }}>
							<span className="codicon codicon-trash" style={{ fontSize: "14px", marginTop: "2px" }} />
						</VSCodeButton>
					) : (
						<div style={{ display: "flex", gap: "2px", overflow: "hidden", marginRight: "2px" }}>
							<VSCodeButton
								appearance="secondary"
								aria-label="Confirm delete"
								title="Confirm delete"
								onClick={handleConfirmDelete}
								style={{ width: "25px", height: "20px" }}>
								✓
							</VSCodeButton>
							<VSCodeButton
								appearance="secondary"
								aria-label="Cancel delete"
								title="Cancel delete"
								onClick={handleCancelDelete}
								style={{ width: "25px", height: "20px" }}>
								✗
							</VSCodeButton>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default RuleRow
