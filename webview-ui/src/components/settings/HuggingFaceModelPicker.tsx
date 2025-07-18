import { EmptyRequest } from "@shared/proto/common"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse, { FuseResult } from "fuse.js"
import React, { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { useMount } from "react-use"
import { huggingFaceDefaultModelId, huggingFaceModels } from "@shared/api"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { ModelsServiceClient } from "../../services/grpc-client"
import { ModelInfoView } from "./common/ModelInfoView"
import { normalizeApiConfiguration } from "./utils/providerUtils"
import { useApiConfigurationHandlers } from "./utils/useApiConfigurationHandlers"

export interface HuggingFaceModelPickerProps {
	isPopup?: boolean
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
		if (regions.length === 0) return regions

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

const HuggingFaceModelPicker: React.FC<HuggingFaceModelPickerProps> = ({ isPopup }) => {
	const { apiConfiguration, huggingFaceModels: dynamicModels, setHuggingFaceModels } = useExtensionState()
	const { handleFieldsChange } = useApiConfigurationHandlers()
	const [searchTerm, setSearchTerm] = useState(apiConfiguration?.huggingFaceModelId || huggingFaceDefaultModelId)
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<(HTMLDivElement | null)[]>([])
	const dropdownListRef = useRef<HTMLDivElement>(null)

	const handleModelChange = (newModelId: string) => {
		const allModels = { ...huggingFaceModels, ...dynamicModels }
		handleFieldsChange({
			huggingFaceModelId: newModelId,
			huggingFaceModelInfo: allModels[newModelId as keyof typeof allModels],
		})
		setSearchTerm(newModelId)
	}

	const { selectedModelId, selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])

	useMount(() => {
		ModelsServiceClient.refreshHuggingFaceModels(EmptyRequest.create({}))
			.then((response) => {
				setHuggingFaceModels({
					[huggingFaceDefaultModelId]: huggingFaceModels[huggingFaceDefaultModelId],
					...response.models,
				})
			})
			.catch((err) => {
				console.error("Failed to refresh Hugging Face models:", err)
			})
	})

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

	const allModels = useMemo(() => {
		return { ...huggingFaceModels, ...dynamicModels }
	}, [dynamicModels])

	const modelIds = useMemo(() => {
		return Object.keys(allModels).sort((a, b) => a.localeCompare(b))
	}, [allModels])

	const searchableItems = useMemo(() => {
		return modelIds.map((id) => ({
			id,
			html: id,
		}))
	}, [modelIds])

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
		let results: { id: string; html: string }[] = searchTerm
			? highlight(fuse.search(searchTerm), "model-item-highlight")
			: searchableItems
		return results
	}, [searchTerm, fuse, searchableItems])

	const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
		if (!isDropdownVisible) return

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault()
				setSelectedIndex((prev) => (prev < modelSearchResults.length - 1 ? prev + 1 : 0))
				break
			case "ArrowUp":
				e.preventDefault()
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : modelSearchResults.length - 1))
				break
			case "Enter":
				e.preventDefault()
				if (selectedIndex >= 0 && selectedIndex < modelSearchResults.length) {
					const selectedModelId = modelSearchResults[selectedIndex].id
					handleModelChange(selectedModelId)
					setIsDropdownVisible(false)
				}
				break
			case "Escape":
				e.preventDefault()
				setIsDropdownVisible(false)
				break
		}
	}

	useEffect(() => {
		if (selectedIndex >= 0 && itemRefs.current[selectedIndex] && dropdownListRef.current) {
			const selectedItem = itemRefs.current[selectedIndex]
			const dropdown = dropdownListRef.current
			const itemOffsetTop = selectedItem.offsetTop
			const itemHeight = selectedItem.offsetHeight
			const dropdownScrollTop = dropdown.scrollTop
			const dropdownHeight = dropdown.offsetHeight

			if (itemOffsetTop < dropdownScrollTop) {
				dropdown.scrollTop = itemOffsetTop
			} else if (itemOffsetTop + itemHeight > dropdownScrollTop + dropdownHeight) {
				dropdown.scrollTop = itemOffsetTop + itemHeight - dropdownHeight
			}
		}
	}, [selectedIndex])

	return (
		<div className="w-full">
			<div className="flex flex-col">
				<label htmlFor="hf-model-search">
					<span className="font-medium">Model</span>
				</label>

				<div ref={dropdownRef} className="relative w-full">
					<VSCodeTextField
						id="hf-model-search"
						placeholder="Search models..."
						value={searchTerm}
						onInput={(e: any) => {
							setSearchTerm(e.target.value)
							setIsDropdownVisible(true)
							setSelectedIndex(-1)
						}}
						onFocus={() => setIsDropdownVisible(true)}
						onKeyDown={handleKeyDown}
						className="w-full relative z-[1000]"
					/>
					{isDropdownVisible && (
						<div
							ref={dropdownListRef}
							className={`absolute top-[calc(100%-3px)] left-0 w-[calc(100%-2px)] ${
								isPopup ? "max-h-[90px]" : "max-h-[200px]"
							} overflow-y-auto bg-[var(--vscode-dropdown-background)] border border-[var(--vscode-list-activeSelectionBackground)] z-[999] rounded-b-[3px]`}>
							{modelSearchResults.map((result, index) => (
								<div
									key={result.id}
									ref={(el: HTMLDivElement | null) => (itemRefs.current[index] = el)}
									className={`p-[5px_10px] cursor-pointer break-all whitespace-normal ${
										index === selectedIndex ? "bg-[var(--vscode-list-activeSelectionBackground)]" : ""
									} hover:bg-[var(--vscode-list-activeSelectionBackground)]`}
									onMouseEnter={() => setSelectedIndex(index)}
									onClick={() => {
										handleModelChange(result.id)
										setIsDropdownVisible(false)
									}}>
									<div
										dangerouslySetInnerHTML={{ __html: result.html }}
										className="[&_.model-item-highlight]:bg-[var(--vscode-editor-findMatchHighlightBackground)] [&_.model-item-highlight]:text-inherit"
									/>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
		</div>
	)
}

export { HuggingFaceModelPicker }
