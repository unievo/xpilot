import { McpServer } from "@shared/mcp"
import ServerRow from "./server-row/ServerRow"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { mcpLibraryEnabled } from "@shared/Configuration"

const ServersToggleList = ({
	servers,
	isExpandable,
	hasTrashIcon,
	listGap = "small",
}: {
	servers: McpServer[]
	isExpandable: boolean
	hasTrashIcon: boolean
	listGap?: "small" | "medium" | "large"
}) => {
	const gapClasses = {
		small: "gap-0.5",
		medium: "gap-1.5",
		large: "gap-2.5",
	}

	const gapClass = gapClasses[listGap]

	const { navigateToMcp, mcpMarketplaceEnabled } = useExtensionState()

	return servers.length > 0 ? (
		<div className={`flex flex-col ${gapClass}`}>
			{servers.map((server) => (
				<ServerRow key={server.name} server={server} isExpandable={isExpandable} hasTrashIcon={hasTrashIcon} />
			))}
		</div>
	) : (
		<div style={{ padding: "10px", textAlign: "center", opacity: 0.9 }}>
			No servers installed, set up in
			<VSCodeLink
				style={{ display: "inline" }}
				onClick={() => {
					navigateToMcp("installed")
				}}>
				MCP Servers
			</VSCodeLink>
		</div>
	)
}

export default ServersToggleList
