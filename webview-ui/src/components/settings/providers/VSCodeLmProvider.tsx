import { EmptyRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useState } from "react"
import { useInterval } from "react-use"
import * as vscodemodels from "vscode"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { DROPDOWN_Z_INDEX, DropdownContainer } from "../ApiOptions"
import { getModeSpecificFields } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface VSCodeLmProviderProps {
	currentMode: Mode
}

export const VSCodeLmProvider = ({ currentMode }: VSCodeLmProviderProps) => {
	const [vsCodeLmModels, setVsCodeLmModels] = useState<vscodemodels.LanguageModelChatSelector[]>([])
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const { vsCodeLmModelSelector } = getModeSpecificFields(apiConfiguration, currentMode)

	// Poll VS Code LM models
	const requestVsCodeLmModels = useCallback(async () => {
		try {
			const response = await ModelsServiceClient.getVsCodeLmModels(EmptyRequest.create({}))
			if (response && response.models) {
				setVsCodeLmModels(response.models)
			}
		} catch (error) {
			console.error("Failed to fetch VS Code LM models:", error)
			setVsCodeLmModels([])
		}
	}, [])

	useEffect(() => {
		requestVsCodeLmModels()
	}, [requestVsCodeLmModels])

	useInterval(requestVsCodeLmModels, 2000)

	return (
		<div>
			<DropdownContainer className="dropdown-container" zIndex={DROPDOWN_Z_INDEX - 2}>
				<label htmlFor="vscode-lm-model">
					<span style={{ fontWeight: 500 }}>Language Model</span>
				</label>
				{vsCodeLmModels.length > 0 ? (
					<div>
						<VSCodeDropdown
							id="vscode-lm-model"
							onChange={(e) => {
								const value = (e.target as HTMLInputElement).value
								if (!value) {
									return
								}
								const [vendor, family] = value.split("/")

								handleModeFieldChange(
									{ plan: "planModeVsCodeLmModelSelector", act: "actModeVsCodeLmModelSelector" },
									{ vendor, family },
									currentMode,
								)
							}}
							style={{ width: "100%" }}
							value={
								vsCodeLmModelSelector
									? `${vsCodeLmModelSelector.vendor ?? ""}/${vsCodeLmModelSelector.family ?? ""}`
									: ""
							}>
							<VSCodeOption value="">Select a model...</VSCodeOption>
							{vsCodeLmModels.map((model) => (
								<VSCodeOption key={`${model.vendor}/${model.family}`} value={`${model.vendor}/${model.family}`}>
									{model.vendor} - {model.family}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
						<ul
							style={{
								fontSize: "12px",
								marginTop: "10px",
								marginLeft: "-6px",
								color: "var(--vscode-descriptionForeground)",
								paddingLeft: "18px",
							}}>
							<li>For simpler tasks, you can use cost effective models such as OpenAI GPT-4.1.</li>
							<li>For more complex coding tasks, use Claude Sonnet 4 / Gemini 2.5 Pro.</li>
						</ul>
					</div>
				) : (
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						The VS Code Language Model API allows you to use models provided by other VS Code extensions.
						<br />
						<br />
						Get started by{" "}
						<VSCodeLink href="https://code.visualstudio.com/docs/copilot/setup" style={{ display: "inline" }}>
							setting up
						</VSCodeLink>{" "}
						and{" "}
						<VSCodeLink href="https://github.com/settings/copilot" style={{ display: "inline" }}>
							enabling
						</VSCodeLink>{" "}
						the GitHub Copilot models.
					</p>
				)}
			</DropdownContainer>
		</div>
	)
}
