import path from "path"
import { ensureGlobalInstructionsDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import { formatResponse } from "@core/prompts/responses"
import fs from "fs/promises"
import { ClineRulesToggles } from "@shared/cline-rules"
import { getGlobalState, getWorkspaceState, updateGlobalState, updateWorkspaceState } from "@core/storage/state"
import * as vscode from "vscode"
import { synchronizeRuleToggles, getRuleFilesTotalContent } from "@core/context/instructions/user-instructions/rule-helpers"
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
	context: vscode.ExtensionContext,
	workingDirectory: string,
): Promise<{
	globalToggles: ClineRulesToggles
	localToggles: ClineRulesToggles
}> {
	// Global toggles
	const globalClineRulesToggles = ((await getGlobalState(context, "globalClineRulesToggles")) as ClineRulesToggles) || {}
	const globalClineRulesFilePath = await ensureGlobalInstructionsDirectoryExists()
	const updatedGlobalToggles = await synchronizeRuleToggles(
		globalClineRulesFilePath,
		globalClineRulesToggles,
		instructionsFilesExtension,
		[],
		instructionsExcludedDirectories,
		instructionsExcludedFiles,
	)
	await updateGlobalState(context, "globalClineRulesToggles", updatedGlobalToggles)

	// Local toggles
	const localClineRulesToggles = ((await getWorkspaceState(context, "localClineRulesToggles")) as ClineRulesToggles) || {}
	const localClineRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.clineRules)
	const updatedLocalToggles = await synchronizeRuleToggles(
		localClineRulesFilePath,
		localClineRulesToggles,
		instructionsFilesExtension,
		[],
		instructionsExcludedDirectories,
		instructionsExcludedFiles,
	)
	await updateWorkspaceState(context, "localClineRulesToggles", updatedLocalToggles)

	return {
		globalToggles: updatedGlobalToggles,
		localToggles: updatedLocalToggles,
	}
}
