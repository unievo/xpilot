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
	padding: "5px",
	margin: "0px 2px 5px 17px",
	position: "relative",
	flexShrink: 0,
}
const closeIconStyle: CSSProperties = { position: "absolute", top: "8px", right: "8px" }
const h3TitleStyle: CSSProperties = { margin: "5px 14px 8px", fontSize: "16px", fontWeight: "bold" }
const ulStyle: CSSProperties = { listStyle: "disc", margin: "4px", marginBottom: "0px", paddingLeft: "10px", fontSize: "12px" }
const accountIconStyle: CSSProperties = { fontSize: 11 }
const hrStyle: CSSProperties = {
	height: "1px",
	background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
	opacity: 0.1,
	margin: "6px 0",
}
const linkContainerStyle: CSSProperties = { margin: "0 0 0 14px", fontSize: "12px", textAlign: "left" }
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
			{/* <span className="codicon codicon-info" style={{ marginLeft: "0px", fontSize: "20px" }}></span> */}
			<div style={h3TitleStyle}>Release v{version}</div>
			{
				<ul style={ulStyle}>
					<li>User interface enhancements</li>
					<li>A new collaborative and expandable knowledge base using Git Instructions and Workflows </li>
					<li>New AI Providers, MCP optimizations, and more...</li>
				</ul>
			}
			{/* {<Accordion isCompact className="pl-0">
				<AccordionItem
					key="1"
					aria-label="Previous Updates"
					title="Previous Updates:"
					style={{ padding: "0px 15px" }}
					classNames={{
						trigger: "bg-transparent border-0 pl-0 pb-0 w-fit",
						title: "font-bold text-[var(--vscode-foreground)]",
						indicator:
							"text-[var(--vscode-foreground)] mb-0.5 -rotate-180 data-[open=true]:-rotate-90 rtl:rotate-0 rtl:data-[open=true]:-rotate-90",
					}}>
					<ul style={ulStyle}>
						<li>
							<b>Claude 4 Models:</b> Now with support for Anthropic Claude Sonnet 4 and Claude Opus 4 in both
							Anthropic and Vertex providers.
						</li>
						<li>
							<b>New Settings Page:</b> Redesigned settings, now split into tabs for easier navigation and a cleaner
							experience.
						</li>
						<li>
							<b>Nebius AI Studio:</b> Added Nebius AI Studio as a new provider. (Thanks @Aktsvigun!)
						</li>
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
					</ul>
				</AccordionItem>
			</Accordion> 
			} */}
			<div style={hrStyle} />
			<p style={linkContainerStyle}>
				{xUrl && (
					<span>
						<VSCodeLink style={linkStyle} href={xUrl}>
							X.com
						</VSCodeLink>
					</span>
				)}

				{" | "}
				<VSCodeLink style={linkStyle} href={repoUrl}>
					GitHub
				</VSCodeLink>

				{discordUrl && (
					<span>
						{" | "}
						<VSCodeLink style={linkStyle} href={discordUrl}>
							Discord
						</VSCodeLink>
					</span>
				)}
			</p>
		</div>
	)
}

export default memo(Announcement)
