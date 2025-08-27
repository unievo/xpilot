import { getRuleFilesTotalContent, synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers"
import { formatResponse } from "@core/prompts/responses"
import { ensureGlobalInstructionsDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { ClineRulesToggles } from "@shared/cline-rules"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import fs from "fs/promises"
import path from "path"
import { Controller } from "@/core/controller"
import { instructionsExcludedDirectories, instructionsExcludedFiles, instructionsFilesExtension } from "@/shared/Configuration"

export const getGlobalClineRules = async (globalClineRulesFilePath: string, toggles: ClineRulesToggles) => {
	if (await fileExistsAtPath(globalClineRulesFilePath)) {
		if (await isDirectory(globalClineRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(
					globalClineRulesFilePath,
					[],
					instructionsExcludedDirectories,
					instructionsExcludedFiles,
				)
				// Filter files by the allowed extension (include all files if no extension is set)
				const filteredRulesFilePaths = rulesFilePaths.filter((filePath) => {
					if (!instructionsFilesExtension) {
						return true // Include all files if no extension is specified
					}
					const fileExtension = path.extname(filePath)
					return fileExtension === instructionsFilesExtension
				})
				const rulesFilesTotalContent = await getRuleFilesTotalContent(
					filteredRulesFilePaths,
					globalClineRulesFilePath,
					toggles,
				)
				if (rulesFilesTotalContent) {
					const clineRulesFileInstructions = formatResponse.clineRulesGlobalDirectoryInstructions(
						globalClineRulesFilePath,
						rulesFilesTotalContent,
					)
					return clineRulesFileInstructions
				}
			} catch {
				console.error(`Failed to read instructions directory at ${globalClineRulesFilePath}`)
			}
		} else {
			console.error(`${globalClineRulesFilePath} is not a directory`)
			return undefined
		}
	}

	return undefined
}

export const getLocalClineRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const clineRulesFilePath = path.resolve(cwd, GlobalFileNames.clineRules)

	let clineRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(clineRulesFilePath)) {
		if (await isDirectory(clineRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(
					clineRulesFilePath,
					[],
					instructionsExcludedDirectories,
					instructionsExcludedFiles,
				)
				// Filter files by the allowed extension (include all files if no extension is set)
				const filteredRulesFilePaths = rulesFilePaths.filter((filePath) => {
					if (!instructionsFilesExtension) {
						return true // Include all files if no extension is specified
					}
					const fileExtension = path.extname(filePath)
					return fileExtension === instructionsFilesExtension
				})

				const rulesFilesTotalContent = await getRuleFilesTotalContent(filteredRulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					clineRulesFileInstructions = formatResponse.clineRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read instructions directory at ${clineRulesFilePath}`)
			}
		} else {
			try {
				if (clineRulesFilePath in toggles && toggles[clineRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(clineRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						clineRulesFileInstructions = formatResponse.clineRulesFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read instructions file at ${clineRulesFilePath}`)
			}
		}
	}

	return clineRulesFileInstructions
}

export async function refreshClineRulesToggles(
	controller: Controller,
	workingDirectory: string,
): Promise<{
	globalToggles: ClineRulesToggles
	localToggles: ClineRulesToggles
}> {
	// Global toggles
	const globalClineRulesToggles = controller.cacheService.getGlobalStateKey("globalClineRulesToggles")
	const globalClineRulesFilePath = await ensureGlobalInstructionsDirectoryExists()
	const updatedGlobalToggles = await synchronizeRuleToggles(
		globalClineRulesFilePath,
		globalClineRulesToggles,
		instructionsFilesExtension,
		[],
		instructionsExcludedDirectories,
		instructionsExcludedFiles,
	)
	controller.cacheService.setGlobalState("globalClineRulesToggles", updatedGlobalToggles)

	// Local toggles
	const localClineRulesToggles = controller.cacheService.getWorkspaceStateKey("localClineRulesToggles")
	const localClineRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.clineRules)
	const updatedLocalToggles = await synchronizeRuleToggles(
		localClineRulesFilePath,
		localClineRulesToggles,
		instructionsFilesExtension,
		[],
		instructionsExcludedDirectories,
		instructionsExcludedFiles,
	)
	controller.cacheService.setWorkspaceState("localClineRulesToggles", updatedLocalToggles)

	return {
		globalToggles: updatedGlobalToggles,
		localToggles: updatedLocalToggles,
	}
}
