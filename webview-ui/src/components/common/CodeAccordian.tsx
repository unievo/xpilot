import {
	codeBlockFontSize,
	defaultDuration,
	rowHeaderGap,
	rowIconOpacity,
	rowItemFullFilePath,
	rowItemLeadingPathSeparator,
} from "@components/config"
import { StringRequest } from "@shared/proto/cline/common"
import { memo, useMemo } from "react"
import CodeBlock from "@/components/common/CodeBlock"
import { FileServiceClient } from "@/services/grpc-client"
import { extractFileName, hasValidFileName } from "@/utils/format"
import { getLanguageFromPath } from "@/utils/getLanguageFromPath"

interface CodeAccordianProps {
	code?: string
	diff?: string
	language?: string | undefined
	path?: string
	isFeedback?: boolean
	isConsoleLogs?: boolean
	isExpanded: boolean
	showExpand?: boolean
	onToggleExpand: () => void
	isLoading?: boolean
	maxHeight?: number
	minWidth?: number
	fontSize?: number
}

/*
We need to remove leading non-alphanumeric characters from the path in order for our leading ellipses trick to work.
^: Anchors the match to the start of the string.
[^a-zA-Z0-9]+: Matches one or more characters that are not alphanumeric.
The replace method removes these matched characters, effectively trimming the string up to the first alphanumeric character.
*/
export const cleanPathPrefix = (path: string): string => path.replace(/^[^\u4e00-\u9fa5a-zA-Z0-9]+/, "")

const CodeAccordian = ({
	code,
	diff,
	language,
	path,
	isFeedback,
	isConsoleLogs,
	isExpanded,
	showExpand = true,
	onToggleExpand,
	isLoading,
	maxHeight,
	minWidth,
	fontSize,
}: CodeAccordianProps) => {
	const inferredLanguage = useMemo(
		() => code && (language ?? (path ? getLanguageFromPath(path) : undefined)),
		[path, language, code],
	)

	const numberOfEdits = useMemo(() => {
		if (code) {
			return (code.match(/[-]{3,} SEARCH/g) || []).length || undefined
		}
		return undefined
	}, [code])

	const isValidFileName = hasValidFileName(path ?? "")

	return (
		<div
			style={
				{
					// marginTop: "8px",
					// borderRadius: defaultBorderRadius,
					// backgroundColor: CODE_BLOCK_BG_COLOR,
					// overflow: "hidden", // This ensures the inner scrollable area doesn't overflow the rounded corners
					// border: "1px solid var(--vscode-editorGroup-border)",
				}
			}>
			{(path || isFeedback || isConsoleLogs) && (
				<div
					className={`group`}
					// onClick={isLoading ? undefined : onToggleExpand}
					style={{
						// color: "var(--vscode-descriptionForeground)",
						display: "flex",
						alignItems: "center",
						// padding: "9px 10px",
						cursor: isLoading ? "wait" : "pointer",
						opacity: isLoading ? 0.7 : 1,
						// pointerEvents: isLoading ? "none" : "auto",
						userSelect: "none",
						WebkitUserSelect: "none",
						MozUserSelect: "none",
						msUserSelect: "none",
					}}>
					{isFeedback || isConsoleLogs ? (
						<div
							onClick={isLoading ? undefined : onToggleExpand}
							style={{
								display: "flex",
								alignItems: "center",
								gap: rowHeaderGap,
								cursor: isLoading ? "wait" : "pointer",
							}}>
							<span
								className={`codicon codicon-${isFeedback ? "feedback" : "output"}`}
								style={{ fontSize: "inherit", opacity: rowIconOpacity, marginLeft: "-3px" }}></span>
							<span
								style={{
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
									// marginRight: "8px",
								}}>
								{isFeedback ? "User Edits" : "Console Logs"}
							</span>
							<span
								className={`codicon codicon-chevron-${isExpanded ? "down" : "right"} opacity-${isExpanded ? 100 : 0} group-hover:opacity-100 transition-opacity duration-${defaultDuration}`}
								style={{ fontSize: "inherit" }}></span>
						</div>
					) : (
						<div // path display
							style={{
								cursor: isLoading ? "wait" : "pointer",
								display: "flex",
								alignItems: "center",
								flex: 1,
								minWidth: minWidth ?? 0,
							}}>
							<div
								onClick={
									isValidFileName
										? () =>
												FileServiceClient.openFileRelativePath(
													StringRequest.create({ value: path }),
												).catch((err) => console.error("Failed to open file:", err))
										: onToggleExpand
								}
								style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
								{rowItemFullFilePath && path?.startsWith(".") && <span>.</span>}
								{rowItemLeadingPathSeparator && path &&  !path.startsWith(".") && <span>/</span>}
								<span
									style={{
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
										marginRight: "8px",
										// trick to get ellipsis at beginning of string
										direction: "rtl",
										textAlign: "left",
										minWidth: 0,
										flexShrink: 1,
									}}>
									{!rowItemFullFilePath && extractFileName(cleanPathPrefix(path ?? "")) + "\u200E"}
									{rowItemFullFilePath && cleanPathPrefix(path ?? "") + "\u200E"}
								</span>
								{isValidFileName && (
									<span
										className={`codicon codicon-link-external`}
										style={{
											color: "var(--vscode-descriptionForeground)",
											fontSize: "0.9em",
											marginRight: "6px",
										}}></span>
								)}
							</div>
							{numberOfEdits !== undefined && (
								<div
									onClick={isLoading ? undefined : onToggleExpand}
									style={{ display: "flex", alignItems: "center" }}>
									<span
										style={{
											flexGrow: 1,
											textAlign: "right",
											color: "var(--vscode-descriptionForeground)",
										}}>
										→
									</span>
									<span
										style={{
											display: "flex",
											alignItems: "center",
											marginRight: "6px",
											color: "var(--vscode-charts-green)",
										}}>
										<span
											className="codicon codicon-diff-single"
											style={{
												paddingRight: "4px",
												paddingLeft: "4px",
												fontSize: "inherit",
											}}></span>
										<span>{numberOfEdits}</span>
									</span>
								</div>
							)}
							{showExpand && (
								<div
									onClick={isLoading ? undefined : onToggleExpand}
									style={{ display: "flex", alignItems: "end", flex: 1 }}>
									<div style={{ flex: 1 }} />
									<div
										className={`codicon codicon-chevron-${isExpanded ? "up" : "down"}`}
										style={{
											fontSize: "inherit",
											color: "var(--vscode-descriptionForeground)",
										}}></div>
								</div>
							)}
						</div>
					)}
				</div>
			)}
			{(!(path || isFeedback || isConsoleLogs) || isExpanded) && (
				<div
					//className="code-block-scrollable" this doesn't seem to be necessary anymore, on silicon macs it shows the native mac scrollbar instead of the vscode styled one
					style={{
						// overflowX: "auto",
						// overflowY: "hidden",
						// maxWidth: "100%",
						marginTop: 4,
					}}>
					<CodeBlock
						fontSize={fontSize ?? codeBlockFontSize}
						maxHeight={maxHeight}
						source={`${"```"}${diff !== undefined ? "diff" : inferredLanguage}\n${(
							code ?? diff ?? ""
						).trim()}\n${"```"}`}
					/>
				</div>
			)}
		</div>
	)
}

// memo does shallow comparison of props, so if you need it to re-render when a nested object changes, you need to pass a custom comparison function
export default memo(CodeAccordian)
