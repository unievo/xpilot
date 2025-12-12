import {
	defaultBorderRadius,
	optionBackground,
	optionBorder,
	optionPadding,
	optionSelectedBackground,
	primaryFontSize,
} from "@components/config"
import { AskResponseRequest } from "@shared/proto/cline/task"
import styled from "styled-components"
import { TaskServiceClient } from "@/services/grpc-client"

const OptionButton = styled.button<{ isSelected?: boolean; isNotSelectable?: boolean }>`
	padding: ${optionPadding};
	background: ${(props) => (props.isSelected ? optionSelectedBackground : optionBackground)};
	color: ${(props) => (props.isSelected ? "white" : "var(--vscode-input-foreground)")};
	border: ${optionBorder};
	border-radius: ${defaultBorderRadius}px;
	cursor: ${(props) => (props.isNotSelectable ? "default" : "pointer")};
	text-align: left;
	font-size: ${primaryFontSize}px;
	overflow: hidden;
	text-overflow: ellipsis;

	${(props) =>
		!props.isNotSelectable &&
		`
		&:hover {
			background: ${optionSelectedBackground};
			color: white;
		}
	`}
`

export const OptionsButtons = ({
	options,
	selected,
	isActive,
	inputValue,
}: {
	options?: string[]
	selected?: string
	isActive?: boolean
	inputValue?: string
}) => {
	if (!options?.length) {
		return null
	}

	const hasSelected = selected !== undefined && options.includes(selected)

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 10,
				paddingTop: 12,

				// marginTop: "22px",
			}}>
			<div style={{ color: "var(--vscode-descriptionForeground)", fontSize: `${primaryFontSize}px` }}>
				Select an option:
			</div>
			{options.map((option, index) => (
				<OptionButton
					className="options-button"
					id={`options-button-${index}`}
					isNotSelectable={hasSelected || !isActive}
					isSelected={option === selected}
					key={index}
					onClick={async () => {
						if (hasSelected || !isActive) {
							return
						}
						try {
							await TaskServiceClient.askResponse(
								AskResponseRequest.create({
									responseType: "messageResponse",
									text: option + (inputValue ? `: ${inputValue?.trim()}` : ""),
									images: [],
								}),
							)
						} catch (error) {
							console.error("Error sending option response:", error)
						}
					}}
					style={{ borderLeft: option === selected ? "3px solid var(--vscode-inputOption-activeBorder)" : undefined }}>
					<span className="ph-no-capture">{option}</span>
				</OptionButton>
			))}
		</div>
	)
}
