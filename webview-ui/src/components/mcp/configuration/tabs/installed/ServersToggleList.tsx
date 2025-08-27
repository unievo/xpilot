import { McpServer } from "@shared/mcp"
import ServerRow from "./server-row/ServerRow"

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

	return servers.length > 0 ? (
		<div className={`flex flex-col ${gapClass}`}>
			{servers.map((server) => (
				<ServerRow hasTrashIcon={hasTrashIcon} isExpandable={isExpandable} key={server.name} server={server} />
			))}
		</div>
	) : (
		<div style={{ padding: "10px", textAlign: "center", opacity: 0.9 }}>No servers installed</div>
	)
}

export default ServersToggleList
