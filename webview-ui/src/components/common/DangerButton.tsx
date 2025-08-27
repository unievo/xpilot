import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

interface DangerButtonProps extends React.ComponentProps<typeof VSCodeButton> {}

const DangerButton: React.FC<DangerButtonProps> = (props) => {
	return (
		<VSCodeButton
			{...props}
			appearance="icon"
			className={`
				bg-[var(--vscode-input-background)]
				text-[var(--vscode-input-foreground)]
				hover:!bg-[#a82424] 
				hover:!border-[#a82424]
				${props.className || ""}
			`}
		/>
	)
}

export default DangerButton
