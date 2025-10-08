import React from "react"
import MarkdownBlock from "../common/MarkdownBlock"

interface NewTaskPreviewProps {
	context: string
}

const NewTaskPreview: React.FC<NewTaskPreviewProps> = ({ context }) => {
	return (
		<div className="bg-[var(--vscode-input-background)] rounded-[8px] pl-[5px] pb-[6px] overflow-auto">
			{/* <span style={{ fontWeight: "bold" }}>New Task Context:</span> */}
			<MarkdownBlock markdown={context} />
		</div>
	)
}

export default NewTaskPreview
