import { baseVersion, baseVersionUrl, discordUrl, repoUrl, xUrl } from "@shared/Configuration"
import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo, useState } from "react"
import { useMount } from "react-use"
import { useClineAuth } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INPUT_BACKGROUND } from "@/utils/vscStyles"
import { useApiConfigurationHandlers } from "../settings/utils/useApiConfigurationHandlers"

interface AnnouncementProps {
	version: string
	hideAnnouncement: () => void
}

const containerStyle: CSSProperties = {
	backgroundColor: getAsVar(VSC_INPUT_BACKGROUND),
	borderRadius: "10px",
	padding: "5px",
	margin: "5px 5px 5px 17px",
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
	marginTop: "20px",
	marginBottom: "5px",
}
const linkContainerStyle: CSSProperties = { margin: "0 0 0 14px", fontSize: "12px", textAlign: "right" }
const linkStyle: CSSProperties = { display: "inline", fontSize: "11px" }

/*
Announcements are automatically shown when the major.minor version changes (for ex 3.19.x → 3.20.x or 4.0.x). 
The latestAnnouncementId is now automatically generated from the extension's package.json version. 
Patch releases (3.19.1 → 3.19.2) will not trigger new announcements.
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const minorVersion = version.split(".").slice(0, 2).join(".") // 2.0.0 -> 2.0
	const { clineUser } = useClineAuth()
	const { apiConfiguration, openRouterModels, setShowChatModelSelector, refreshOpenRouterModels } = useExtensionState()
	const user = apiConfiguration?.clineAccountId ? clineUser : undefined
	const { handleFieldsChange } = useApiConfigurationHandlers()

	const [didClickGrokCodeButton, setDidClickGrokCodeButton] = useState(false)
	const [didClickCodeSupernovaButton, setDidClickCodeSupernovaButton] = useState(false)

	// Need to get latest model list in case user hits shortcut button to set model
	useMount(refreshOpenRouterModels)

	const setGrokCodeFast1 = () => {
		const modelId = "x-ai/grok-code-fast-1"
		// set both plan and act modes to use grok-code-fast-1
		handleFieldsChange({
			planModeOpenRouterModelId: modelId,
			actModeOpenRouterModelId: modelId,
			planModeOpenRouterModelInfo: openRouterModels[modelId],
			actModeOpenRouterModelInfo: openRouterModels[modelId],
			planModeApiProvider: "cline",
			actModeApiProvider: "cline",
		})

		setTimeout(() => {
			setDidClickGrokCodeButton(true)
			setShowChatModelSelector(true)
		}, 10)
	}

	const setCodeSupernova = () => {
		const modelId = "cline/code-supernova-1-million"
		// set both plan and act modes to use code-supernova-1-million
		handleFieldsChange({
			planModeOpenRouterModelId: modelId,
			actModeOpenRouterModelId: modelId,
			planModeOpenRouterModelInfo: openRouterModels[modelId],
			actModeOpenRouterModelInfo: openRouterModels[modelId],
			planModeApiProvider: "cline",
			actModeApiProvider: "cline",
		})

		setTimeout(() => {
			setDidClickCodeSupernovaButton(true)
			setShowChatModelSelector(true)
		}, 10)
	}

	const handleShowAccount = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	return (
		<div style={containerStyle}>
			<VSCodeButton appearance="icon" data-testid="close-button" onClick={hideAnnouncement} style={closeIconStyle}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			{/* <span className="codicon codicon-info" style={{ marginLeft: "0px", fontSize: "20px" }}></span> */}
			<div style={h3TitleStyle}>
				Release <a href="https://github.com/unievo/astro/blob/main/CHANGELOG.md">v{minorVersion}</a>
			</div>
			{
				<ul style={ulStyle}>
					<li>
						<b>Task Header:</b> Design update for better usability
					</li>
					<div className="mt-3" />
					<b>Base Features Update: </b>
					<div className="mt-1.5" />

					<li>
						<b>Claude Sonnet 4.5:</b> Support for Sonnet 4.5 in multiple API providers -{" "}
						<a href={`${baseVersionUrl}`}>{baseVersion}</a>
					</li>
					{/* <li>
						<b>Deep Planning:</b> New "/Deep Planning" slash command for codebase exploration and implementation
						planning, that integrates with Focus Chain for automatic progress tracking
					</li>
					<li>
						<b>New API providers, models, enhancements and fixes: </b> <a href={`${baseVersionUrl}`}>{baseVersion}</a>
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
						title: "font-bold text-xs text-[var(--vscode-foreground)]",
						indicator:
							"text-[var(--vscode-foreground)] mb-0.5 -rotate-180 data-[open=true]:-rotate-90 rtl:rotate-0 rtl:data-[open=true]:-rotate-90",
					}}
					key="1">
					<ul style={ulStyle}>
						<li>
							<b>Overview section:</b> for quick access to main features and usage recommendations.
						</li>
						<li>
							<b>Instructions and Workflows enhancements:</b> allowing for an expandable and collaborative knowledge bases using Git, with the "/Git Instructions" and "/Git Workflows" slash commands.
						</li>
						<li>
							<b>On demand MCP tools schema loading:</b> performance and cost optimization when using MCP servers with a large number of tools, reducing the system prompt size and token usage.
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
