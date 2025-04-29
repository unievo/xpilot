import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { memo } from "react"
import { formatLargeNumber } from "@/utils/format"

type HistoryPreviewProps = {
	showHistoryView: () => void
}

const HistoryPreview = ({ showHistoryView }: HistoryPreviewProps) => {
	const { taskHistory } = useExtensionState()
	const handleHistorySelect = (id: string) => {
		vscode.postMessage({ type: "showTaskWithId", text: id })
	}

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp)
		return date
			?.toLocaleString("en-US", {
				month: "long",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			})
			.replace(", ", " ")
			.replace(" at", ",")
		//.toUpperCase()
	}

	return (
		<div style={{ flexShrink: 0 }}>
			<style>
				{`
					.history-preview-item {
						background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 65%, transparent);
						border-radius: 10px;
						position: relative;
						overflow: hidden;
						opacity: 1;
						cursor: pointer;
						margin-bottom: 7px;
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
					margin: "10px 20px 10px 20px",
					display: "flex",
					alignItems: "center",
				}}>
				<span
					className="codicon codicon-comment-discussion"
					style={{
						marginRight: "4px",
						transform: "scale(0.9)",
					}}></span>
				<span
					style={{
						fontWeight: 500,
						fontSize: "0.85em",
						textTransform: "uppercase",
					}}>
					Recent Tasks
				</span>
			</div>

			<div style={{ padding: "0px 20px 0 20px" }}>
				{taskHistory
					.filter((item) => item.ts && item.task)
					.slice(0, 5)
					.map((item) => (
						<div key={item.id} className="history-preview-item" onClick={() => handleHistorySelect(item.id)}>
							<div
								style={{
									fontSize: "var(--vscode-font-size)",
									color: "var(--vscode-descriptionForeground)",
									marginBottom: "3px",
									marginTop: "10px",
									marginLeft: "12px",
									marginRight: "12px",
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
									overflowWrap: "anywhere",
								}}>
								{item.task}
							</div>
							<div style={{ padding: "5px 0px 10px 10px" }}>
								<span
									style={{
										marginLeft: "2px",
										fontSize: "0.85em",
										fontWeight: "bold",
										opacity: 0.7,
										color: "var(--vscode-descriptionForeground)",
									}}>
									<span>
										Tokens: ↑{formatLargeNumber(item.tokensIn || 0)} ↓{formatLargeNumber(item.tokensOut || 0)}
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
								<span style={{ marginBottom: "3px" }}>
									<span
										style={{
											color: "var(--vscode-descriptionForeground)",
											//fontWeight: "bold",
											fontSize: "0.85em",
											opacity: 0.7,
											//textTransform: "uppercase",
										}}>
										{" - "}
										{formatDate(item.ts)}
									</span>
								</span>
							</div>
						</div>
					))}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}>
					<VSCodeButton
						appearance="icon"
						onClick={() => showHistoryView()}
						style={{
							opacity: 0.9,
						}}>
						<div
							style={{
								fontSize: "var(--vscode-font-size)",
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
