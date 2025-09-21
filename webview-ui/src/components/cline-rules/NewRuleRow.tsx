import { RuleFileRequest } from "@shared/proto/index.cline"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useRef, useState } from "react"
import { useClickAway } from "react-use"
import { FileServiceClient } from "@/services/grpc-client"
import { rowBackground } from "../theme"

interface NewRuleRowProps {
	isGlobal: boolean
	ruleType?: string
}

const NewRuleRow: React.FC<NewRuleRowProps> = ({ isGlobal, ruleType }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [filename, setFilename] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)
	const [error, setError] = useState<string | null>(null)

	const componentRef = useRef<HTMLDivElement>(null)

	// Focus the input when expanded
	useEffect(() => {
		if (isExpanded && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isExpanded])

	useClickAway(componentRef, () => {
		if (isExpanded) {
			setIsExpanded(false)
			setFilename("")
			setError(null)
		}
	})

	const getExtension = (filename: string): string => {
		if (filename.startsWith(".") && !filename.includes(".", 1)) {
			return ""
		}
		const match = filename.match(/\.[^.]+$/)
		return match ? match[0].toLowerCase() : ""
	}

	const isValidExtension = (ext: string): boolean => {
		return ext === "" || ext === ".md" // || ext === ".txt"
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (filename.trim()) {
			const trimmedFilename = filename.trim()
			const extension = getExtension(trimmedFilename)

			if (!isValidExtension(extension)) {
				setError("Only .md or no file extension allowed")
				return
			}

			let finalFilename = trimmedFilename
			if (extension === "") {
				finalFilename = `${trimmedFilename}.md`
			}

			try {
				await FileServiceClient.createRuleFile(
					RuleFileRequest.create({
						isGlobal,
						filename: finalFilename,
						type: ruleType || "cline",
					}),
				)
			} catch (err) {
				console.error("Error creating file:", err)
			}

			setFilename("")
			setError(null)
			setIsExpanded(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setIsExpanded(false)
			setFilename("")
		}
	}

	return (
		<div
			className={`mb-0 overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
			onClick={() => !isExpanded && setIsExpanded(true)}
			ref={componentRef}>
			<div
				className={`flex items-center p-0 rounded transition-all duration-300 ease-in-out min-h-[12px] ${
					isExpanded ? "shadow-sm" : ""
				}`}
				style={{
					border: `0.5px solid overflow-ellipsis ${rowBackground}`,
					marginTop: "3px",
					paddingLeft: "2px",
					overflow: "hidden",
				}}>
				<span
					className="codicon codicon-markdown"
					style={{ fontSize: "14px", marginRight: "0px", opacity: 0.5, verticalAlign: "middle" }}></span>
				{isExpanded ? (
					<form className="flex flex-1 items-center" onSubmit={handleSubmit}>
						<input
							className="flex-1 bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border-0 outline-0 rounded focus:outline-none focus:ring-0 focus:border-transparent"
							onChange={(e) => setFilename(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={"filename(.md)"}
							ref={inputRef}
							style={{
								outline: "none",
								fontSize: "12px",
							}}
							type="text"
							value={filename}
						/>

						<div className="flex items-center ml-2 space-x-2">
							<VSCodeButton
								appearance="icon"
								aria-label="Add file"
								//style={{ padding: "0px" }}
								title="Add file"
								type="submit">
								<span className="codicon codicon-add" />
							</VSCodeButton>
						</div>
					</form>
				) : (
					<>
						<div className="ml-0.5 overflow-ellipsis overflow-hidden flex-1 text-[var(--vscode-descriptionForeground)] bg-[var(--vscode-input-background)]">
							{ruleType === "workflow" ? "New workflow file..." : "New instructions file..."}
						</div>
						<div className="flex overflow-hidden items-center ml-2 space-x-2">
							<VSCodeButton
								appearance="icon"
								aria-label="Add file..."
								onClick={(e) => {
									e.stopPropagation()
									setIsExpanded(true)
								}}
								style={{ opacity: 0.7, padding: "0px" }}
								title="Add file">
								<span className="codicon codicon-add" />
							</VSCodeButton>
						</div>
					</>
				)}
			</div>
			{isExpanded && error && <div className="text-[var(--vscode-errorForeground)] mt-1 ml-2">{error}</div>}
		</div>
	)
}

export default NewRuleRow
