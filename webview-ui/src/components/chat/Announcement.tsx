import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo } from "react"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"
import { vscode } from "../../utils/vscode"
import { agentName, discordUrl, repoUrl, xUrl } from "../../../../src/shared/Configuration"

interface AnnouncementProps {
	version: string
	hideAnnouncement: () => void
}

const containerStyle: CSSProperties = {
	backgroundColor: getAsVar(VSC_INACTIVE_SELECTION_BACKGROUND),
	borderRadius: "10px",
	padding: "10px 10px",
	margin: "5px 15px 5px 15px",
	position: "relative",
	flexShrink: 0,
}
const closeIconStyle: CSSProperties = { position: "absolute", top: "8px", right: "8px" }
const h3TitleStyle: CSSProperties = { margin: "5px 10px 8px", fontSize: "15px" }
const ulStyle: CSSProperties = { margin: "0 0 8px", paddingLeft: "10px", fontSize: "13px" }
const accountIconStyle: CSSProperties = { fontSize: 11 }
const hrStyle: CSSProperties = {
	height: "1px",
	background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
	opacity: 0.1,
	margin: "8px 0",
}
const linkContainerStyle: CSSProperties = { margin: "0 0 0 10px", fontSize: "12px", textAlign: "left" }
const linkStyle: CSSProperties = { display: "inline", fontSize: "12px" }

/*
You must update the latestAnnouncementId in ClineProvider for new announcements to show to users. This new id will be compared with what's in state for the 'last announcement shown', and if it's different then the announcement will render. As soon as an announcement is shown, the id will be updated in state. This ensures that announcements are not shown more than once, even if the user doesn't close it themselves.
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const minorVersion = version.split(".").slice(0, 2).join(".") // 2.0.0 -> 2.0
	return (
		<div style={containerStyle}>
			<VSCodeButton appearance="icon" onClick={hideAnnouncement} style={closeIconStyle}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			<span className="codicon codicon-info" style={{ marginLeft: "0px", fontSize: "25px" }}></span>
			<h3 style={h3TitleStyle}>Release v{version}</h3>
			{
				<ul style={ulStyle}>
					<li>Chat toolbar redesign</li>
					<li>Auto-approve menu and task history UI improvements</li>
					<hr style={{ marginBottom: "10px", borderStyle: "dashed", color: "var(--vscode-editor-foreground)" }} />
					<p style={{ fontSize: "13px", fontWeight: "bold" }}>Previous updates:</p>
					<li>
						New{" "}
						<VSCodeLink
							onClick={() => {
								vscode.postMessage({
									type: "showMcpView",
									tab: "library",
								})
							}}
							style={{}}>
							MCP server library
						</VSCodeLink>{" "}
						in server configuration, for discovering and installing servers.
					</li>
					<li>
						MCP tool call arguments and responses are now collapsible, keeping the chat more compact when receiving
						large data quantities. Expand for full details.
					</li>
					<li>
						MCP configuration is now stored in a global configuration file, allowing for using xPilot in multiple IDEs
						(VS Code, Cursor, Windsurf, etc.) at the same time with the same configuration.
					</li>
					<li>Cline v3.13.1 features update</li>
				</ul>
				/*<ul style={{ margin: "0 0 8px", paddingLeft: "12px" }}>
				<ul style={{ margin: "0 0 8px", paddingLeft: "12px" }}>
				<li>
					<b>Model Favorites:</b> You can now mark your favorite models when using Cline & OpenRouter providers for
					quick access!
				</li>
				<li>
					<b>Faster Diff Editing:</b> Improved animation performance for large files, plus a new indicator in chat
					showing the number of edits Cline makes.
				</li>
				<li>
					<b>New Auto-Approve Options:</b> Turn off Cline's ability to read and edit files outside your workspace.
				</li>
			</ul>
			<h4 style={{ margin: "5px 0 5px" }}>Previous Updates:</h4>

			<ul style={ulStyle}>
				<li>
					<b>Browser Tool Upgrades:</b> Use your local Chrome browser for session-based browsing, enabling debugging and
					productivity workflows tied to your actual browser state.
				</li>
				<li>
					<b>Auto-Approve Commands:</b> New option to automatically approve <b>ALL</b> commands (use at your own risk!)
				</li>
				<li>
					<b>Easily Toggle MCP's:</b> New popover in the chat area to easily enable/disable MCP servers.
				</li>
			</ul> */
				/*<ul style={{ margin: "0 0 8px", paddingLeft: "12px" }}>
				 <li>
					OpenRouter now supports prompt caching! They also have much higher rate limits than other providers,
					so I recommend trying them out.
					<br />
					{!apiConfiguration?.openRouterApiKey && (
						<VSCodeButtonLink
							href={getOpenRouterAuthUrl(vscodeUriScheme)}
							style={{
								transform: "scale(0.85)",
								transformOrigin: "left center",
								margin: "4px -30px 2px 0",
							}}>
							Get OpenRouter API Key
						</VSCodeButtonLink>
					)}
					{apiConfiguration?.openRouterApiKey && apiConfiguration?.apiProvider !== "openrouter" && (
						<VSCodeButton
							onClick={() => {
								vscode.postMessage({
									type: "apiConfiguration",
									apiConfiguration: { ...apiConfiguration, apiProvider: "openrouter" },
								})
							}}
							style={{
								transform: "scale(0.85)",
								transformOrigin: "left center",
								margin: "4px -30px 2px 0",
							}}>
							Switch to OpenRouter
						</VSCodeButton>
					)}
				</li>
				<li>
					<b>Edit Cline's changes before accepting!</b> When he creates or edits a file, you can modify his
					changes directly in the right side of the diff view (+ hover over the 'Revert Block' arrow button in
					the center to undo "<code>{"// rest of code here"}</code>" shenanigans)
				</li>
				<li>
					New <code>search_files</code> tool that lets Cline perform regex searches in your project, letting
					him refactor code, address TODOs and FIXMEs, remove dead code, and more!
				</li>
				<li>
					When Cline runs commands, you can now type directly in the terminal (+ support for Python
					environments)
				</li>
			</ul>*/
			}
			<div style={hrStyle} />
			<p style={linkContainerStyle}>
				{" "}
				<VSCodeLink style={linkStyle} href={xUrl}>
					X.com{" "}
				</VSCodeLink>{" "}
				|
				<VSCodeLink style={linkStyle} href={repoUrl}>
					GitHub{" "}
				</VSCodeLink>{" "}
				|
				<VSCodeLink style={linkStyle} href={discordUrl}>
					Discord
				</VSCodeLink>{" "}
			</p>
		</div>
	)
}

export default memo(Announcement)
