import path from "path"
import fs from "fs/promises"
import { GlobalFileNames } from "@core/storage/disk"
import { fileExistsAtPath, isDirectory } from "@utils/fs"
import { formatResponse } from "@core/prompts/responses"
import { getWorkspaceState, updateWorkspaceState } from "@core/storage/state"
import {
	synchronizeRuleToggles,
	combineRuleToggles,
	getRuleFilesTotalContent,
	readDirectoryRecursive,
} from "@core/context/instructions/user-instructions/rule-helpers"
import { ClineRulesToggles } from "@shared/cline-rules"
import * as vscode from "vscode"

/**
 * Refreshes the toggles for windsurf and cursor rules
 */
export async function refreshExternalRulesToggles(
	context: vscode.ExtensionContext,
	workingDirectory: string,
): Promise<{
	windsurfLocalToggles: ClineRulesToggles
	cursorLocalToggles: ClineRulesToggles
}> {
	// local windsurf toggles
	const localWindsurfRulesToggles = ((await getWorkspaceState(context, "localWindsurfRulesToggles")) as ClineRulesToggles) || {}

	// windsurf has two valid locations for rules files, so we need to check both and combine
	// synchronizeRuleToggles will drop whichever rules files are not in each given path, but combining the results will result in no data loss
	let localWindsurfRulesDirPath = path.resolve(workingDirectory, GlobalFileNames.windsurfRulesDir)
	const updatedLocalWindsurfToggles1 = await synchronizeRuleToggles(localWindsurfRulesDirPath, localWindsurfRulesToggles)

	const localWindsurfRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.windsurfRulesFile)
	const updatedLocalWindsurfToggles2 = await synchronizeRuleToggles(localWindsurfRulesFilePath, localWindsurfRulesToggles)

	const updatedLocalWindsurfToggles = combineRuleToggles(updatedLocalWindsurfToggles1, updatedLocalWindsurfToggles2)
	await updateWorkspaceState(context, "localWindsurfRulesToggles", updatedLocalWindsurfToggles)

	// local cursor toggles
	const localCursorRulesToggles = ((await getWorkspaceState(context, "localCursorRulesToggles")) as ClineRulesToggles) || {}

	// cursor has two valid locations for rules files, so we need to check both and combine
	// synchronizeRuleToggles will drop whichever rules files are not in each given path, but combining the results will result in no data loss
	let localCursorRulesDirPath = path.resolve(workingDirectory, GlobalFileNames.cursorRulesDir)
	const updatedLocalCursorToggles1 = await synchronizeRuleToggles(localCursorRulesDirPath, localCursorRulesToggles, ".mdc")

	const localCursorRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.cursorRulesFile)
	const updatedLocalCursorToggles2 = await synchronizeRuleToggles(localCursorRulesFilePath, localCursorRulesToggles)

	const updatedLocalCursorToggles = combineRuleToggles(updatedLocalCursorToggles1, updatedLocalCursorToggles2)
	await updateWorkspaceState(context, "localCursorRulesToggles", updatedLocalCursorToggles)

	return {
		windsurfLocalToggles: updatedLocalWindsurfToggles,
		cursorLocalToggles: updatedLocalCursorToggles,
	}
}

/**
 * Gather formatted windsurf rules, which can come from two sources
 */
export const getLocalWindsurfRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const windsurfRulesFilePath = path.resolve(cwd, GlobalFileNames.windsurfRulesFile)

	let windsurfRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(windsurfRulesFilePath)) {
		if (!(await isDirectory(windsurfRulesFilePath))) {
			try {
				if (windsurfRulesFilePath in toggles && toggles[windsurfRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(windsurfRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						windsurfRulesFileInstructions = formatResponse.windsurfRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .windsurfrules file at ${windsurfRulesFilePath}`)
			}
		}
	}

	// we then check for the .windsurf/rules dir
	const windsurfRulesDirPath = path.resolve(cwd, GlobalFileNames.windsurfRulesDir)
	let windsurfRulesDirInstructions: string | undefined

	if (await fileExistsAtPath(windsurfRulesDirPath)) {
		if (await isDirectory(windsurfRulesDirPath)) {
			try {
				const rulesFilePaths = await readDirectoryRecursive(windsurfRulesDirPath, "")
				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					windsurfRulesDirInstructions = formatResponse.windsurfRulesLocalDirectoryInstructions(
						cwd,
						rulesFilesTotalContent,
					)
				}
			} catch {
				console.error(`Failed to read .windsurf/rules directory at ${windsurfRulesDirPath}`)
			}
		}
	}

	return [windsurfRulesFileInstructions, windsurfRulesDirInstructions]
}

/**
 * Gather formatted cursor rules, which can come from two sources
 */
export const getLocalCursorRules = async (cwd: string, toggles: ClineRulesToggles) => {
	// we first check for the .cursorrules file
	const cursorRulesFilePath = path.resolve(cwd, GlobalFileNames.cursorRulesFile)
	let cursorRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(cursorRulesFilePath)) {
		if (!(await isDirectory(cursorRulesFilePath))) {
			try {
				if (cursorRulesFilePath in toggles && toggles[cursorRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(cursorRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						cursorRulesFileInstructions = formatResponse.cursorRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .cursorrules file at ${cursorRulesFilePath}`)
			}
		}
	}

	// we then check for the .cursor/rules dir
	const cursorRulesDirPath = path.resolve(cwd, GlobalFileNames.cursorRulesDir)
	let cursorRulesDirInstructions: string | undefined

	if (await fileExistsAtPath(cursorRulesDirPath)) {
		if (await isDirectory(cursorRulesDirPath)) {
			try {
				const rulesFilePaths = await readDirectoryRecursive(cursorRulesDirPath, ".mdc")
				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					cursorRulesDirInstructions = formatResponse.cursorRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read .cursor/rules directory at ${cursorRulesDirPath}`)
			}
		}
	}

	return [cursorRulesFileInstructions, cursorRulesDirInstructions]
}
