import { defaultBorderRadius, rowItemExpandedMaxHeight, toolBackground, toolBorder } from "@components/config"
import React from "react"
import MarkdownBlock from "../common/MarkdownBlock"

interface NewTaskPreviewProps {
	context: string
}

const NewTaskPreview: React.FC<NewTaskPreviewProps> = ({ context }) => {
	return (
		<div
			// className="bg-[var(--vscode-input-background)] rounded-[8px] pl-[8px] pb-[6px] overflow-auto"
			style={{
				border: toolBorder,
				borderRadius: defaultBorderRadius,
				background: toolBackground,
				maxHeight: rowItemExpandedMaxHeight,
				overflow: "auto",
				wordBreak: "break-word",
				padding: "0 5px",
			}}>
			{/* <span style={{ fontWeight: "bold" }}>New Task Context:</span> */}
			<MarkdownBlock markdown={context} />
		</div>
	)
}

export default NewTaskPreview
