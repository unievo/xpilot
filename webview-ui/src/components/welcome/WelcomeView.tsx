import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import ApiOptions from "@/components/settings/ApiOptions"
import { agentName } from "@shared/Configuration"
import AgentLogo from "@/assets/AgentLogo"
import { AccountServiceClient, ModelsServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"
import { UpdateApiConfigurationRequest } from "@shared/proto/models"
import { convertApiConfigurationToProto } from "@shared/proto-conversions/models/api-configuration-conversion"

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
		if (apiConfiguration) {
			try {
				await ModelsServiceClient.updateApiConfigurationProto(
					UpdateApiConfigurationRequest.create({
						apiConfiguration: convertApiConfigurationToProto(apiConfiguration),
					}),
				)
			} catch (error) {
				console.error("Failed to update API configuration:", error)
			}
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
					{agentName} is an AI agent based on <a href="https://cline.bot">Cline</a>, a powerful open-source agent for VS
					Code, designed to support many AI providers and models, and to handle a wide range of development tasks.
				</p>
				<p>
					{agentName} achieves the best results with models trained for coding and tool use, currently Claude Sonnet
					3.5–4, Google Gemini 2.5 Pro, xAI Grok 3, and OpenAI GPT-4.1. For easier tasks, it can also use simpler
					models.
				</p>
				<p>
					To access AI models, {agentName} needs to use an AI provider. It can use many different providers, and you can
					also bring your own AI API key.
					<br />
					Or, you can sign up with OpenRouter or Cline, for a variety of model options, using the providers list below.
				</p>
				<p>
					{agentName} can also use models available in VS Code. The easiest way is to set up{" "}
					<VSCodeLink href="https://code.visualstudio.com/docs/copilot/setup" style={{ display: "inline" }}>
						Copilot
					</VSCodeLink>{" "}
					and{" "}
					<VSCodeLink href="https://github.com/settings/copilot" style={{ display: "inline" }}>
						enable
					</VSCodeLink>{" "}
					the models you want to use. {agentName} can use them based on your Copilot plan. After setting up Copilot, you
					can select VS Code from the providers list.
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

				<div className="mt-4.5">
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
