import { McpResource, McpResourceTemplate } from "@shared/mcp"
import { useState } from "react"
import { iconHighlightColor, mcpSectionsPadding, primaryFontSize } from "@/components/config"

type McpResourceRowProps = {
	item: McpResource | McpResourceTemplate
	collapseDescription?: boolean
}

const McpResourceRow = ({ item, collapseDescription }: McpResourceRowProps) => {
	const hasUri = "uri" in item
	const uri = hasUri ? item.uri : item.uriTemplate
	const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(collapseDescription ?? false)

	return (
		<div key={uri}>
			<div
				style={{
					padding: mcpSectionsPadding,
					// display: "flex",
					// alignItems: "center",
					// marginBottom: "4px",
				}}>
				<div
					onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
					style={{ display: "flex", alignItems: "center", gap: "3px", cursor: "pointer", userSelect: "none" }}>
					<span className={`codicon codicon-symbol-file`} style={{ color: iconHighlightColor }} />
					<span
						className={`codicon ${isDescriptionCollapsed ? "codicon-chevron-right" : "codicon-chevron-down"}`}
						style={{ fontSize: primaryFontSize }}
					/>
					<span style={{ fontWeight: 500, wordBreak: "break-all" }}>{uri}</span>
				</div>
			</div>
			{!isDescriptionCollapsed && (
				<div
					style={{
						opacity: 0.8,
						fontSize: "0.9em",
						margin: "6px 8px 0 10px",
					}}>
					<div>
						{item.name && item.description
							? `${item.name}: ${item.description}`
							: !item.name && item.description
								? item.description
								: !item.description && item.name
									? item.name
									: "No description"}
					</div>
					<div
						style={{
							opacity: 0.7,
							fontSize: "0.9em",
							padding: "6px 0 8px 0",
						}}>
						<span>Returns </span>
						<code
							style={{
								color: "var(--vscode-textPreformat-foreground)",
								background: "var(--vscode-textPreformat-background)",
								padding: "1px 4px",
								borderRadius: "3px",
							}}>
							{item.mimeType || "Unknown"}
						</code>
					</div>
				</div>
			)}
		</div>
	)
}

export default McpResourceRow
