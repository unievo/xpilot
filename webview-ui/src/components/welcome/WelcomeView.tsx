import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import ApiOptions from "@/components/settings/ApiOptions"
import { agentName } from "../../../../src/shared/Configuration"
import AgentLogo from "@/assets/AgentLogo"

const WelcomeView = memo(() => {
	const { apiConfiguration } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = () => {
		vscode.postMessage({ type: "accountLoginClicked" })
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
				<p>
					I'm an AI software engineering agent with a mission to accelerate development on
					<VSCodeLink href="https://www.multiversx.com" style={{ display: "inline" }}>
						MultiversX
					</VSCodeLink>
				</p>
				<p>
					I can use AI models to plan and execute many coding tasks and I'm able to access external tools and data using
					the Model Context Protocol.
				</p>
				<p>
					I can work with different models, but I achieve the best results with models trained for coding and tool use,
					such as Claude Sonnet.
				</p>
				<p>To access an AI model I need to use an AI API Provider.</p>
				<p>
					I can use many different providers and you can use your own API key if you already have one. Or you can use
					providers such as Cline or Open Router which offer many models, by selecting them from the provider list.
				</p>
				<p>
					{" "}
					I can also use available models in VS Code, Cursor, or Windsurf. If you have{" "}
					<VSCodeLink href="https://code.visualstudio.com/docs/copilot/setup" style={{ display: "inline" }}>
						Copilot
					</VSCodeLink>{" "}
					installed, I can use the same models, so you don't need another API key or subscription. Select VS Code from
					the provider list.
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
