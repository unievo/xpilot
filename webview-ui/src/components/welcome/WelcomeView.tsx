import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import ApiOptions from "@/components/settings/ApiOptions"
import { agentName } from "@shared/Configuration"
import AgentLogo from "@/assets/AgentLogo"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"

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

	const handleSubmit = () => {
		vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(apiConfiguration))
	}, [apiConfiguration])

	return (
		<div className="fixed inset-0 p-0 flex flex-col">
			<div className="h-full px-5 overflow-auto">
				<div className="flex justify-center my-5">
					<AgentLogo className="size-16" />
				</div>
				<h2 className="flex justify-center my-5">Hi, I am {agentName}!</h2>
				<p>I'm an AI software engineering agent.</p>
				<p>
					I can use AI models to plan and execute many tasks and I'm able to access external tools and data using the
					Model Context Protocol.
				</p>
				<p>
					I can work with different models and I achieve the best results with models trained for coding and tool use,
					such as Claude Sonnet.
				</p>
				<p>To access a model I need to use a provider.</p>
				<p>
					I can use many different providers and you can also bring your own API key. Or you can sign up with Open
					Router or Cline.
				</p>
				<p>
					{" "}
					I can also use supported models in VS Code, or any VS Code based IDE. You can set up{" "}
					<VSCodeLink href="https://code.visualstudio.com/docs/copilot/setup" style={{ display: "inline" }}>
						Copilot
					</VSCodeLink>{" "}
					and
					<VSCodeLink href="https://github.com/settings/copilot" style={{ display: "inline" }}>
						enable
					</VSCodeLink>{" "}
					the Copilot models. I can use them without another API key or subscription, by selecting VS Code from the AI
					API providers list.
				</p>
				<p></p>

				{/* <p className="text-[var(--vscode-descriptionForeground)]">
					Sign up for an account to get started for free, or use an API key that provides access to models like Claude
					3.7 Sonnet.
				</p>

				<VSCodeButton appearance="primary" onClick={handleLogin} className="w-full mt-1">
					Get Started for Free
				</VSCodeButton> */}

				{!showApiOptions && (
					<VSCodeButton
						appearance="primary"
						onClick={() => setShowApiOptions(!showApiOptions)}
						className="mt-2.5 w-full">
						Select an AI API provider
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
