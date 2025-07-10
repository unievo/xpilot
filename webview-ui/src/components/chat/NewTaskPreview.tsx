import React from "react"
import MarkdownBlock from "../common/MarkdownBlock"

interface NewTaskPreviewProps {
	context: string
}

const NewTaskPreview: React.FC<NewTaskPreviewProps> = ({ context }) => {
	return (
		<div className="bg-[var(--vscode-input-background)] rounded-[8px] p-[14px] pb-[6px] overflow-scroll">
			<span style={{ fontWeight: "bold" }}>New Task Context:</span>
			<MarkdownBlock markdown={context} />
		</div>
	)
}

export default NewTaskPreview
