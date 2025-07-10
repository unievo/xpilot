import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import ApiOptions from "@/components/settings/ApiOptions"
import { agentName } from "@shared/Configuration"
import AgentLogo from "@/assets/AgentLogo"
import { AccountServiceClient, ModelsServiceClient, StateServiceClient } from "@/services/grpc-client"
import { EmptyRequest, BooleanRequest } from "@shared/proto/common"

const WelcomeView = memo(() => {
	const { apiConfiguration } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = () => {
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
		setApiErrorMessage(validateApiConfiguration(apiConfiguration))
	}, [apiConfiguration])

	return (
		<div className="fixed inset-0 p-0 flex flex-col" style={{ scrollbarGutter: "stable" }}>
			<div className="h-full px-5 overflow-auto" style={{ scrollbarGutter: "stable" }}>
				<div className="flex justify-center my-5">
					<AgentLogo size={50} />
				</div>
				<h2 className="flex justify-center my-5">Welcome to {agentName}!</h2>
				<p>
					{agentName} is an AI agent based on <a href="https://cline.bot">Cline</a>, a powerful open-source coding agent
					for VS Code, designed to support many AI providers and models, and to handle a wide range of development
					tasks.
				</p>
				<p>
					It can use available models in VS Code, by setting up{" "}
					<VSCodeLink href="https://code.visualstudio.com/docs/copilot/setup" style={{ display: "inline" }}>
						Copilot
					</VSCodeLink>{" "}
					and{" "}
					<VSCodeLink href="https://github.com/settings/copilot" style={{ display: "inline" }}>
						enabling
					</VSCodeLink>{" "}
					models based on your Copilot plan.
				</p>
				<p>
					You can also bring your own API key, or you can select and sign up below with providers like OpenRouter or
					Cline, for a variety of model options.
				</p>
				<p>
					For general tasks, you can use cost effective models such as OpenAI GPT-4.1. <br />
					For coding tasks use Claude Sonnet 4 or Google Gemini 2.5.
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
					{showApiOptions && (
						<div>
							<ApiOptions showModelOptions={false} />
							<VSCodeButton onClick={handleSubmit} disabled={disableLetsGoButton} className="mt-0.75">
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
