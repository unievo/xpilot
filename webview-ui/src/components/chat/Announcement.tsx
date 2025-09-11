import { agentName, discordUrl, repoUrl, xUrl } from "@shared/Configuration"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo } from "react"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"

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
const ulStyle: CSSProperties = { listStyle: "disc", margin: "4px", marginBottom: "-10px", paddingLeft: "10px", fontSize: "12px" }
const _accountIconStyle: CSSProperties = { fontSize: 11 }
const hrStyle: CSSProperties = {
	height: "1px",
	background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
	opacity: 0.1,
	margin: "6px 0",
}
const linkContainerStyle: CSSProperties = { margin: "0 0 0 14px", fontSize: "12px", textAlign: "left" }
const linkStyle: CSSProperties = { display: "inline", fontSize: "11px" }

/*
Announcements are automatically shown when the major.minor version changes (for ex 3.19.x → 3.20.x or 4.0.x). 
The latestAnnouncementId is now automatically generated from the extension's package.json version. 
Patch releases (3.19.1 → 3.19.2) will not trigger new announcements.
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const minorVersion = version.split(".").slice(0, 2).join(".") // 2.0.0 -> 2.0
	return (
		<div style={containerStyle}>
			<VSCodeButton appearance="icon" data-testid="close-button" onClick={hideAnnouncement} style={closeIconStyle}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			{/* <span className="codicon codicon-info" style={{ marginLeft: "0px", fontSize: "20px" }}></span> */}
			<div style={h3TitleStyle}>Release v{version}</div>
			{
				<ul style={ulStyle}>
					Welcome to <b>{agentName}</b>!<br />
					<br />
					{/* <li>
						<b>Task Timeline:</b> See the history of your coding journey with a visual timeline of checkpoints,
						letting you understand what Cline did at a glance.
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
						<b>New User Experience:</b> Special components and guidance for new users to help them get started with
						Cline.
					</li>
					<li>
						<b>Auto Caching for Gemini:</b> Native support for Gemini's recently released Implicit Caching.
					</li> */}
				</ul>
			}

			{/* <Accordion isCompact className="pl-0">
				<AccordionItem
					aria-label="Previous Updates"
					title="Previous Updates:"
					style={{ padding: "0px 15px" }}
					classNames={{
						trigger: "bg-transparent border-0 pl-0 pb-0 w-fit",
						title: "font-bold text-[var(--vscode-foreground)]",
						indicator:
							"text-[var(--vscode-foreground)] mb-0.5 -rotate-180 data-[open=true]:-rotate-90 rtl:rotate-0 rtl:data-[open=true]:-rotate-90",
					}}
					key="1"
					title="Previous Updates:">
					<ul style={ulStyle}>
						<li>
							<b>1M Context for Claude Sonnet 4:</b> Cline/OpenRouter users get instant access, Anthropic users need
							Tier 4, and Bedrock users must be on a supported region.
						</li>
						<li>
							<b>Optimized for Claude 4:</b> Cline is now optimized to work with the Claude 4 family of models,
							resulting in improved performance, reliability, and new capabilities.
						</li>
						<li>
							<b>Workflows:</b> Create and manage workflow files that can be injected into conversations via slash
							commands, making it easy to automate repetitive tasks.
						</li>
					</ul>
				</AccordionItem>
			</Accordion> */}
			<div style={hrStyle} />
			<p style={linkContainerStyle}>
				{xUrl && (
					<span>
						<VSCodeLink href={xUrl} style={linkStyle}>
							X.com
						</VSCodeLink>
					</span>
				)}

				{" | "}
				<VSCodeLink href={repoUrl} style={linkStyle}>
					GitHub
				</VSCodeLink>

				{discordUrl && (
					<span>
						{" | "}
						<VSCodeLink href={discordUrl} style={linkStyle}>
							Discord
						</VSCodeLink>
					</span>
				)}
			</p>
		</div>
	)
}

export default memo(Announcement)
