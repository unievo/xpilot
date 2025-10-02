import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse, { FuseResult } from "fuse.js"
import React, { KeyboardEvent, memo, useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"

export const OLLAMA_MODEL_PICKER_Z_INDEX = 1_000

export interface OllamaModelPickerProps {
	ollamaModels: string[]
	selectedModelId: string
	onModelChange: (modelId: string) => void
	placeholder?: string
}

const highlight = (fuseSearchResult: FuseResult<any>[], highlightClassName: string = "history-item-highlight") => {
	const set = (obj: Record<string, any>, path: string, value: any) => {
		const pathValue = path.split(".")
		let i: number

		for (i = 0; i < pathValue.length - 1; i++) {
			obj = obj[pathValue[i]] as Record<string, any>
		}

		obj[pathValue[i]] = value
	}

	// Function to merge overlapping regions
	const mergeRegions = (regions: [number, number][]): [number, number][] => {
		if (regions.length === 0) {
			return regions
		}

		// Sort regions by start index
		regions.sort((a, b) => a[0] - b[0])

		const merged: [number, number][] = [regions[0]]

		for (let i = 1; i < regions.length; i++) {
			const last = merged[merged.length - 1]
			const current = regions[i]

			if (current[0] <= last[1] + 1) {
				// Overlapping or adjacent regions
				last[1] = Math.max(last[1], current[1])
			} else {
				merged.push(current)
			}
		}

		return merged
	}

	const generateHighlightedText = (inputText: string, regions: [number, number][] = []) => {
		if (regions.length === 0) {
			return inputText
		}

		// Sort and merge overlapping regions
		const mergedRegions = mergeRegions(regions)

		let content = ""
		let nextUnhighlightedRegionStartingIndex = 0

		mergedRegions.forEach((region) => {
			const start = region[0]
			const end = region[1]
			const lastRegionNextIndex = end + 1

			content += [
				inputText.substring(nextUnhighlightedRegionStartingIndex, start),
				`<span class="${highlightClassName}">`,
				inputText.substring(start, lastRegionNextIndex),
				"</span>",
			].join("")

			nextUnhighlightedRegionStartingIndex = lastRegionNextIndex
		})

		content += inputText.substring(nextUnhighlightedRegionStartingIndex)

		return content
	}

	return fuseSearchResult
		.filter(({ matches }) => matches && matches.length)
		.map(({ item, matches }) => {
			const highlightedItem = { ...item }

			matches?.forEach((match) => {
				if (match.key && typeof match.value === "string" && match.indices) {
					// Merge overlapping regions before generating highlighted text
					const mergedIndices = mergeRegions([...match.indices])
					set(highlightedItem, match.key, generateHighlightedText(match.value, mergedIndices))
				}
			})

			return highlightedItem
		})
}

const OllamaModelPicker: React.FC<OllamaModelPickerProps> = ({
	ollamaModels,
	selectedModelId,
	onModelChange,
	placeholder = "Search and select a model...",
}) => {
	const [searchTerm, setSearchTerm] = useState(selectedModelId || "")
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<(HTMLDivElement | null)[]>([])
	const dropdownListRef = useRef<HTMLDivElement>(null)

	const handleModelChange = (newModelId: string) => {
		onModelChange(newModelId)
		setSearchTerm(newModelId)
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownVisible(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	const searchableItems = useMemo(() => {
		return ollamaModels.map((id) => ({
			id,
			html: id,
		}))
	}, [ollamaModels])

	const fuse = useMemo(() => {
		return new Fuse(searchableItems, {
			keys: ["html"],
			threshold: 0.6,
			shouldSort: true,
			isCaseSensitive: false,
			ignoreLocation: false,
			includeMatches: true,
			minMatchCharLength: 1,
		})
	}, [searchableItems])

	const modelSearchResults = useMemo(() => {
		return searchTerm ? highlight(fuse.search(searchTerm), "ollama-model-item-highlight") : searchableItems
	}, [searchableItems, searchTerm, fuse])

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!isDropdownVisible) {
			return
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault()
				setSelectedIndex((prev) => (prev < modelSearchResults.length - 1 ? prev + 1 : prev))
				break
			case "ArrowUp":
				event.preventDefault()
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
				break
			case "Enter":
				event.preventDefault()
				if (selectedIndex >= 0 && selectedIndex < modelSearchResults.length) {
					handleModelChange(modelSearchResults[selectedIndex].id)
					setIsDropdownVisible(false)
				}
				break
			case "Escape":
				setIsDropdownVisible(false)
				setSelectedIndex(-1)
				break
		}
	}

	useEffect(() => {
		setSelectedIndex(-1)
		if (dropdownListRef.current) {
			dropdownListRef.current.scrollTop = 0
		}
	}, [searchTerm])

	useEffect(() => {
		if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
			itemRefs.current[selectedIndex]?.scrollIntoView({
				block: "nearest",
				behavior: "smooth",
			})
		}
	}, [selectedIndex])

	// Update search term when selectedModelId changes externally
	useEffect(() => {
		if (selectedModelId !== searchTerm) {
			setSearchTerm(selectedModelId || "")
		}
	}, [selectedModelId])

	return (
		<div style={{ width: "100%" }}>
			<style>
				{`
				.ollama-model-item-highlight {
					background-color: var(--vscode-editor-findMatchHighlightBackground);
					color: inherit;
				}
				`}
			</style>
			<DropdownWrapper ref={dropdownRef}>
				<VSCodeTextField
					id="ollama-model-search"
					onFocus={() => setIsDropdownVisible(true)}
					onInput={(e) => {
						const value = (e.target as HTMLInputElement)?.value || ""
						handleModelChange(value)
						setIsDropdownVisible(true)
					}}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					style={{
						width: "100%",
						zIndex: OLLAMA_MODEL_PICKER_Z_INDEX,
						position: "relative",
					}}
					value={searchTerm}>
					{searchTerm && (
						<div
							aria-label="Clear search"
							className="input-icon-button codicon codicon-close"
							onClick={() => {
								handleModelChange("")
								setIsDropdownVisible(true)
							}}
							slot="end"
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: "100%",
							}}
						/>
					)}
				</VSCodeTextField>
				{isDropdownVisible && modelSearchResults.length > 0 && (
					<DropdownList ref={dropdownListRef}>
						{modelSearchResults.map((item, index) => (
							<DropdownItem
								isSelected={index === selectedIndex}
								key={item.id}
								onClick={() => {
									handleModelChange(item.id)
									setIsDropdownVisible(false)
								}}
								onMouseEnter={() => setSelectedIndex(index)}
								ref={(el) => (itemRefs.current[index] = el)}>
								<span dangerouslySetInnerHTML={{ __html: item.html }} />
							</DropdownItem>
						))}
					</DropdownList>
				)}
			</DropdownWrapper>
		</div>
	)
}

export default memo(OllamaModelPicker)

// Dropdown styling

const DropdownWrapper = styled.div`
	position: relative;
	width: 100%;
`

const DropdownList = styled.div`
	position: absolute;
	top: calc(100% - 3px);
	left: 0;
	width: calc(100% - 2px);
	max-height: 200px;
	overflow-y: auto;
	background-color: var(--vscode-dropdown-background);
	border: 1px solid var(--vscode-list-activeSelectionBackground);
	z-index: ${OLLAMA_MODEL_PICKER_Z_INDEX - 1};
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
`

const DropdownItem = styled.div<{ isSelected: boolean }>`
	padding: 5px 10px;
	cursor: pointer;
	word-break: break-all;
	white-space: normal;

	background-color: ${({ isSelected }) => (isSelected ? "var(--vscode-list-activeSelectionBackground)" : "inherit")};

	&:hover {
		background-color: var(--vscode-list-activeSelectionBackground);
	}
`
