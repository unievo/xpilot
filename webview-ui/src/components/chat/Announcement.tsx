import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo } from "react"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"
import { vscode } from "../../utils/vscode"
import { agentName, xUrl } from "../../../../src/shared/Configuration"

interface AnnouncementProps {
	version: string
	hideAnnouncement: () => void
}

const containerStyle: CSSProperties = {
	backgroundColor: getAsVar(VSC_INACTIVE_SELECTION_BACKGROUND),
	borderRadius: "10px",
	padding: "12px 16px",
	margin: "5px 15px 5px 15px",
	position: "relative",
	flexShrink: 0,
}
const closeIconStyle: CSSProperties = { position: "absolute", top: "8px", right: "8px" }
const h3TitleStyle: CSSProperties = { margin: "5px 10px 8px" }
const ulStyle: CSSProperties = { margin: "0 0 8px", paddingLeft: "12px" }
const accountIconStyle: CSSProperties = { fontSize: 11 }
const hrStyle: CSSProperties = {
	height: "1px",
	background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
	opacity: 0.1,
	margin: "8px 0",
}
const linkContainerStyle: CSSProperties = { margin: "0 0 0 10px" }
const linkStyle: CSSProperties = { display: "inline" }

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
			<span className="codicon codicon-info" style={{ marginLeft: "8px", fontSize: "24px" }}></span>
			<h3 style={h3TitleStyle}>Release v{version}</h3>
			{
				<ul style={ulStyle}>
					Welcome to the initial release of <b>{agentName}</b>! This is where new features will be announced.
				</ul>

				/* <ul style={{ margin: "0 0 8px", paddingLeft: "12px" }}>
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
			{/*
			// Leave this here for an example of how to structure the announcement
			<ul style={{ margin: "0 0 8px", paddingLeft: "12px" }}>
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
				<VSCodeLink style={linkStyle} href={xUrl}>
					Join us on X{" "}
				</VSCodeLink>{" "}
				{/* <VSCodeLink style={linkStyle} href="https://discord.gg/cline">
					discord,
				</VSCodeLink>{" "}
				or{" "}
				<VSCodeLink style={linkStyle} href="https://www.reddit.com/r/cline/">
					r/cline
				</VSCodeLink> */}
				for more updates!
			</p>
		</div>
	)
}

export default memo(Announcement)
