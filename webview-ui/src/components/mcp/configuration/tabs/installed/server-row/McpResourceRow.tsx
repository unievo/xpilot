import { McpResource, McpResourceTemplate } from "@shared/mcp"
import { itemIconColor } from "@/components/theme"

type McpResourceRowProps = {
	item: McpResource | McpResourceTemplate
}

const McpResourceRow = ({ item }: McpResourceRowProps) => {
	const hasUri = "uri" in item
	const uri = hasUri ? item.uri : item.uriTemplate

	return (
		<div
			key={uri}
			style={{
				padding: "3px 0",
			}}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					marginBottom: "4px",
				}}>
				<span className={`codicon codicon-symbol-file`} style={{ color: itemIconColor, marginRight: "6px" }} />
				<span style={{ fontWeight: 500, wordBreak: "break-all" }}>{uri}</span>
			</div>
			<div
				style={{
					opacity: 0.8,
					fontSize: "0.9em",
					margin: "6px 0",
				}}>
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
	)
}

export default McpResourceRow
