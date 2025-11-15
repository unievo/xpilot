import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

interface SuccessButtonTWProps extends React.ComponentProps<typeof VSCodeButton> {}

const SuccessButtonTW: React.FC<SuccessButtonTWProps> = (props) => {
	return (
		<VSCodeButton
			{...props}
			appearance="icon"
			className={`
				!bg-[#175126] 
				!border-[#176f2c] 
				!text-white
				hover:!bg-[#197f31] 
				hover:!border-[#197f31]
				active:!bg-[#156528] 
				active:!border-[#156528]
				${props.className || ""}
			`
				.replace(/\s+/g, " ")
				.trim()}
		/>
	)
}

export default SuccessButtonTW
