import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import ApiOptions from "@/components/settings/ApiOptions"
import { agentName } from "../../../../src/shared/Configuration"
import AgentLogoWhite from "@/assets/ClineLogoWhite"

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
				<h2>Hi, I'm {agentName}!</h2>
				<div className="flex justify-left my-5">
					<AgentLogoWhite className="size-16" />
				</div>
				<p>I'm an AI software engineering agent.</p>
				<p>
					I can use AI models to plan and execute tasks, create and edit files, read terminal output and even execute
					commands in the terminal. I'm also able to access external tools, resources and APIs using the Model Context
					Protocol (MCP).
				</p>
				<p>
					I can work with models with different capabilities, though I achieve best results with agentic models that
					understand coding, tools and tool use, and I prefer Claude Sonnet. Feel free to experiment with different
					models.
				</p>
				<p>
					If you already have{" "}
					<VSCodeLink href="https://github.com/settings/copilot" style={{ display: "inline" }}>
						Copilot
					</VSCodeLink>{" "}
					installed, or other VS Code extensions that provide a language model API, I can use that so you don't need to
					configure another API key. Just select VS Code from the provider list below.
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
