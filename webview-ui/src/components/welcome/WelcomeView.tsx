import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState, memo } from "react"
import ApiOptions from "@/components/settings/ApiOptions"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"
import AgentLogo from "@/assets/AgentLogo"
import { agentName } from "@shared/Configuration"

const WelcomeView = memo(() => {
	const [showApiOptions, setShowApiOptions] = useState(false)

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	return (
		<div className="fixed inset-0 p-0 flex flex-col" style={{ scrollbarGutter: "stable" }}>
			<div className="h-full px-5 pr-1 overflow-auto" style={{ scrollbarGutter: "stable" }}>
				<div className="flex justify-center mt-15">
					<AgentLogo size={60} />
				</div>
				<h2 className="flex mb-10 justify-center">Welcome to {agentName}!</h2>
				<p>
					{agentName} can use VS Code as an AI provider, by{" "}
					<VSCodeLink href="https://code.visualstudio.com/docs/copilot/setup" style={{ display: "inline" }}>
						setting up
					</VSCodeLink>
					and{" "}
					<VSCodeLink href="https://github.com/settings/copilot" style={{ display: "inline" }}>
						enabling
					</VSCodeLink>{" "}
					the GitHub Copilot models.
				</p>
				<p>
					You can also bring your own API key, or you can sign in below with Cline or OpenRouter, for a variety of model
					options.
				</p>
				{/* <p className="text-[var(--vscode-descriptionForeground)]">
					Sign up for an account to get started for free, or use an API key that provides access to models like Claude 4
					Sonnet.
				</p>

				<VSCodeButton appearance="primary" onClick={handleLogin} className="w-full mt-1">
					Get Started for Free
				</VSCodeButton> */}

				{!showApiOptions && (
					<VSCodeButton
						appearance="primary"
						onClick={() => setShowApiOptions(!showApiOptions)}
						className="mt-2.5 w-full">
						Select an AI provider
					</VSCodeButton>
				)}

				<div className="mt-4.5 mb-4.5">
					{showApiOptions && <ApiOptions showModelOptions={false} showSubmitButton={true} />}
				</div>
			</div>
		</div>
	)
})

export default WelcomeView
