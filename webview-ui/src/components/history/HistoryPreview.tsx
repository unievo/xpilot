import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { memo } from "react"
import { TaskServiceClient } from "@/services/grpc-client"
import { formatLargeNumber } from "@/utils/format"

type HistoryPreviewProps = {
	showHistoryView: () => void
}

const HistoryPreview = ({ showHistoryView }: HistoryPreviewProps) => {
	const { taskHistory } = useExtensionState()
	const handleHistorySelect = (id: string) => {
		TaskServiceClient.showTaskWithId({ value: id }).catch((error) => console.error("Error showing task:", error))
	}

	const formatDate = (timestamp: number) => {
		const now = Date.now()
		const diffMs = Math.max(now - timestamp, 0)
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
		if (diffDays >= 1) {
			return `${diffDays}d`
		}
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
		if (diffHours >= 1) {
			return `${diffHours}h`
		}
		const diffMinutes = Math.floor(diffMs / (1000 * 60))
		return `${diffMinutes}m`
	}

	return (
		<div style={{ flexShrink: 0 }}>
			<style>
				{`
					.history-preview-item {
						background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 65%, transparent);
						border-radius: 8px;
						position: relative;
						overflow: hidden;
						opacity: 0.9;
						cursor: pointer;
						margin-bottom: 8px;
					}
					.history-preview-item:hover {
						background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 100%, transparent);
						opacity: 1;
						pointer-events: auto;
					}
				`}
			</style>

			<div
				style={{
					color: "var(--vscode-descriptionForeground)",
					margin: "10px 20px 15px 20px",
					display: "flex",
					alignItems: "center",
				}}>
				<span
					className="codicon codicon-tasklist"
					style={{
						marginRight: "5px",
						transform: "scale(0.9)",
					}}></span>
				<span
					style={{
						fontWeight: 600,
						fontSize: "0.85em",
						textTransform: "uppercase",
					}}>
					Task History
				</span>
			</div>

			<div style={{ padding: "5px 20px 0 20px" }}>
				{taskHistory
					.filter((item) => item.ts && item.task)
					.slice(0, 5)
					.map((item) => (
						<div key={item.id} className="history-preview-item" onClick={() => handleHistorySelect(item.id)}>
							<div style={{ padding: "5px", paddingLeft: "12px", paddingRight: "12px" }}>
								<div
									id={`history-preview-task-${item.id}`}
									className="history-preview-task"
									style={{
										fontSize: "var(--vscode-font-size)",
										color: "var(--vscode-descriptionForeground)",
										marginBottom: "3px",
										marginTop: "1px",
										marginLeft: "0px",
										marginRight: "15px",
										display: "-webkit-box",
										WebkitLineClamp: 1,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
										whiteSpace: "pre-wrap",
										wordBreak: "break-word",
										overflowWrap: "anywhere",
									}}>
									<span className="ph-no-capture">{item.task}</span>
								</div>
								{item.isFavorited && (
									<div
										style={{
											position: "absolute",
											top: "6px",
											right: "6px",
											color: "var(--vscode-button-background)",
										}}>
										<span
											style={{ fontSize: "12px" }}
											className="codicon codicon-star-full"
											aria-label="Favorited"
										/>
									</div>
								)}
								<div style={{ padding: "0px 0px 0px 0px" }}>
									<span style={{ marginBottom: "0px" }}>
										<span
											style={{
												color: "var(--vscode-descriptionForeground)",
												//fontWeight: "bold",
												fontSize: "0.95em",
												opacity: 0.7,
												//textTransform: "uppercase",
											}}>
											{formatDate(item.ts)}
										</span>
									</span>
									<span
										style={{
											marginLeft: "0px",
											fontSize: "0.85em",
											//fontWeight: "bold",
											opacity: 0.7,
											color: "var(--vscode-descriptionForeground)",
										}}>
										<span>
											{" • "}Tokens: ↑{formatLargeNumber(item.tokensIn || 0)} ↓
											{formatLargeNumber(item.tokensOut || 0)}
										</span>
										{!!item.cacheWrites && (
											<>
												{" • "}
												<span>
													Cache: +{formatLargeNumber(item.cacheWrites || 0)} →{" "}
													{formatLargeNumber(item.cacheReads || 0)}
												</span>
											</>
										)}
										{!!item.totalCost && (
											<>
												{" • "}
												<span>API Cost: ${item.totalCost?.toFixed(4)}</span>
											</>
										)}
									</span>
								</div>
							</div>
						</div>
					))}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "right",
					}}>
					<VSCodeButton
						appearance="icon"
						onClick={() => showHistoryView()}
						style={{
							marginTop: "-3px",
							opacity: 0.6,
						}}>
						<div
							style={{
								fontSize: "0.93em",
								//fontSize: "var(--vscode-font-size)",
								color: "var(--vscode-descriptionForeground)",
							}}>
							View all history
						</div>
					</VSCodeButton>
				</div>
			</div>
		</div>
	)
}

export default memo(HistoryPreview)
