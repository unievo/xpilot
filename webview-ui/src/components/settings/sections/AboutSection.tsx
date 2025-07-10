import { agentName, discordUrl, clineVersion, repoUrl, xUrl } from "@shared/Configuration"
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
				<div className="text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto">
					<div style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold" }}>
						<p>{agentName}</p>
					</div>
					<p>
						{agentName} is an AI agent based on <a href="https://cline.bot">Cline</a>, a powerful open-source agent
						for VS Code, designed to support many AI providers and models, and to handle a wide range of development
						tasks.
						<br />
						<br />
						Shoutout to the amazing Cline team, contributors and community!
					</p>
					<p>
						Astro started as an experimental project, to adapt Cline as a foundation for custom and domain specific
						agents, that can have specialized functionalities and capabilities applicable to different industries.
					</p>
					<p>
						As a base agent, it includes Cline's functionality, with additional customizations and features, and it is
						released also as a community experiment.
					</p>
					<p>If you have any issues, questions or feedback, feel free to contact us on:</p>
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
					<br />
					<br />
					<p className="text-center text-sm mt-[10px] mb-0 p-0 font-bold">Versions</p>
					<p className="text-center italic mt-[10px] mb-0 p-0">Cline: v{clineVersion}</p>
					<p className="text-center italic mt-[10px] mb-0 p-0">Astro: v{version}</p>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
