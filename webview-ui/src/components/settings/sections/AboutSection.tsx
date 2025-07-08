import { agentName, discordUrl, repoUrl, xUrl } from "@shared/Configuration"
import Section from "../Section"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"

interface AboutSectionProps {
	version: string
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="text-center text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto">
					<div style={{ fontSize: "18px", fontWeight: "bold" }}>
						<p>{agentName}</p>
					</div>
					<p style={{ margin: "0 0 0 5px", fontSize: "13px", textAlign: "center" }}>
						<VSCodeLink href={repoUrl}>GitHub</VSCodeLink>
						{xUrl && (
							<span>
								{" | "}
								<VSCodeLink href={xUrl}>X.com</VSCodeLink>
							</span>
						)}
						{discordUrl && (
							<span>
								{" | "}
								<VSCodeLink href={discordUrl}>Discord</VSCodeLink>
							</span>
						)}
					</p>
					<p className="italic mt-[10px] mb-0 p-0">v{version}</p>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
