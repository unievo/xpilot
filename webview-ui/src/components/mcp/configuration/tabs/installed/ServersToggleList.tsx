import { McpServer } from "@shared/mcp"
import ServerRow from "./server-row/ServerRow"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"

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

	const { navigateToMcp } = useExtensionState()

	return servers.length > 0 ? (
		<div className={`flex flex-col ${gapClass}`}>
			{servers.map((server) => (
				<ServerRow key={server.name} server={server} isExpandable={isExpandable} hasTrashIcon={hasTrashIcon} />
			))}
		</div>
	) : (
		<div style={{ padding: "10px", textAlign: "center", opacity: 0.9 }}>
			No MCP servers installed.
			<br />
			<br />
			Install servers from the{" "}
			<VSCodeLink
				style={{ display: "" }}
				onClick={() => {
					navigateToMcp("library")
				}}>
				Library
			</VSCodeLink>
			, or use
			<VSCodeLink
				style={{ display: "inline" }}
				onClick={() => {
					navigateToMcp("installed")
				}}>
				Configure
			</VSCodeLink>
			to edit the configuration file.
		</div>
	)
}

export default ServersToggleList
