import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo } from "react"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"
import { Accordion, AccordionItem } from "@heroui/react"
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
const ulStyle: CSSProperties = { margin: "0 0 8px", paddingLeft: "10px", fontSize: "12px" }
const accountIconStyle: CSSProperties = { fontSize: 11 }
const hrStyle: CSSProperties = {
	height: "1px",
	background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
	opacity: 0.1,
	margin: "8px 0",
}
const linkContainerStyle: CSSProperties = { margin: "0 0 0 10px", fontSize: "11px", textAlign: "left" }
const linkStyle: CSSProperties = { display: "inline", fontSize: "11px" }

/*
You must update the latestAnnouncementId in ClineProvider for new announcements to show to users. This new id will be compared with what's in state for the 'last announcement shown', and if it's different then the announcement will render. As soon as an announcement is shown, the id will be updated in state. This ensures that announcements are not shown more than once, even if the user doesn't close it themselves.
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const minorVersion = version.split(".").slice(0, 2).join(".") // 2.0.0 -> 2.0
	return (
		<div style={containerStyle}>
			<VSCodeButton data-testid="close-button" appearance="icon" onClick={hideAnnouncement} style={closeIconStyle}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			<span className="codicon codicon-info" style={{ marginLeft: "0px", fontSize: "25px" }}></span>
			<h3 style={h3TitleStyle}>Release v{version}</h3>
			{
				<ul style={ulStyle}>
					Welcome to <b>{agentName}</b>!
					{/* <li>
					<b>Task Timeline:</b> See the history of your coding journey with a visual timeline of checkpoints, letting
					you understand what Cline did at a glance.
				</li>
				<li>
					<b>New Settings Page:</b> Redesigned settings, now split into tabs for easier navigation and a cleaner
					experience.
				</li>
				<li>
					<b>Global Endpoint for Vertex AI:</b> Improved availability and reduced rate limiting errors for Vertex AI
					users.
				</li>
				<li>
					<b>New User Experience:</b> Special components and guidance for new users to help them get started with Cline.
				</li>
				<li>
					<b>Auto Caching for Gemini:</b> Native support for Gemini's recently released Implicit Caching.
				</li> */}
				</ul>
			}
			{/*
			<Accordion isCompact className="pl-0">
				<AccordionItem
					key="1"
					aria-label="Previous Updates"
					title="Previous Updates:"
					classNames={{
						trigger: "bg-transparent border-0 pl-0 pb-0 w-fit",
						title: "font-bold text-[var(--vscode-foreground)]",
						indicator:
							"text-[var(--vscode-foreground)] mb-0.5 -rotate-180 data-[open=true]:-rotate-90 rtl:rotate-0 rtl:data-[open=true]:-rotate-90",
					}}>
					<ul style={ulStyle}>
						<li>
							<b>Workflows:</b> Create and manage workflow files that can be injected into conversations via slash
							commands, making it easy to automate repetitive tasks.
						</li>
						<li>
							<b>Collapsible Task List:</b> Hide your recent tasks when sharing your screen to keep your prompts
							private.
						</li>
						<li>
							<b>Global Endpoint for Vertex AI:</b> Improved availability and reduced rate limiting errors for
							Vertex AI users.
						</li>
						<li>
							<b>New User Experience:</b> Special components and guidance for new users to help them get started
							with Cline.
						</li>
						<li>
							<b>UI Improvements:</b> Fixed loading states and improved settings organization for a smoother
							experience.
						</li>
						<li>
							<b>Task Timeline:</b> See the history of your coding journey with a visual timeline of checkpoints.
						</li>
						<li>
							<b>UX Improvements:</b> Type while Cline works, smarter auto-scrolling, and copy buttons for task
							headers and messages.
						</li>
						<li>
							<b>Gemini prompt caching:</b> Gemini and Vertex providers now support prompt caching and price
							tracking.
						</li>
						<li>
							<b>Global Cline Rules:</b> Store multiple rules files in Documents/Cline/Rules to share between
							projects.
						</li>
					</ul>
				</AccordionItem>
			</Accordion> */}
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
