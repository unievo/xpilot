import { agentName } from "@shared/Configuration"
import { BooleanRequest, EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo, useEffect, useState } from "react"
import AgentLogo from "@/assets/AgentLogo"
import ApiOptions from "@/components/settings/ApiOptions"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient, StateServiceClient } from "@/services/grpc-client"
import { validateApiConfiguration } from "@/utils/validate"

const WelcomeView = memo(() => {
	const { apiConfiguration, mode } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	const disableLetsGoButton = apiErrorMessage != null

	const _handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	const handleSubmit = async () => {
		try {
			await StateServiceClient.setWelcomeViewCompleted(BooleanRequest.create({ value: true }))
		} catch (error) {
			console.error("Failed to update API configuration or complete welcome view:", error)
		}
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(mode, apiConfiguration))
	}, [apiConfiguration, mode])

	return (
		<div className="fixed inset-0 p-0 flex flex-col" style={{ scrollbarGutter: "stable" }}>
			<div className="h-full px-5 pr-1 overflow-auto" style={{ scrollbarGutter: "stable" }}>
				<div className="flex justify-center mt-15">
					<AgentLogo size={60} />
				</div>
				<h2 className="flex mb-10 justify-center">Welcome to {agentName}!</h2>
				<p>
					{agentName} can use VS Code as an AI provider by{" "}
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

				<VSCodeButton appearance="primary" className="w-full mt-1" onClick={handleLogin}>
					Get Started for Free
				</VSCodeButton> */}

				{!showApiOptions && (
					<VSCodeButton
						appearance="primary"
						className="mt-2.5 w-full"
						onClick={() => setShowApiOptions(!showApiOptions)}>
						Select an AI provider
					</VSCodeButton>
				)}

				<div className="mt-4.5 mb-4.5">
					{showApiOptions && (
						<div>
							<ApiOptions currentMode={mode} showModelOptions={false} />
							<VSCodeButton className="mt-0.75" disabled={disableLetsGoButton} onClick={handleSubmit}>
								Let's go!
							</VSCodeButton>
						</div>
					)}
				</div>
			</div>
		</div>
	)
})

export default WelcomeView
