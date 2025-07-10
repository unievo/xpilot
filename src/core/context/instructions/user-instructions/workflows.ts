import path from "path"
import { GlobalFileNames, ensureGlobalWorkflowsDirectoryExists } from "@core/storage/disk"
import { ClineRulesToggles } from "@shared/cline-rules"
import { getWorkspaceState, updateWorkspaceState, getGlobalState, updateGlobalState } from "@core/storage/state"
import * as vscode from "vscode"
import { synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers"
import { instructionsExcludedDirectories, instructionsExcludedFiles, instructionsFilesExtension } from "@/shared/Configuration"

/**
 * Refresh the workflow toggles
 */
export async function refreshWorkflowToggles(
	context: vscode.ExtensionContext,
	workingDirectory: string,
): Promise<{
	globalWorkflowToggles: ClineRulesToggles
	localWorkflowToggles: ClineRulesToggles
}> {
	// Global workflows
	const globalWorkflowToggles = ((await getGlobalState(context, "globalWorkflowToggles")) as ClineRulesToggles) || {}
	const globalClineWorkflowsFilePath = await ensureGlobalWorkflowsDirectoryExists()
	const updatedGlobalWorkflowToggles = await synchronizeRuleToggles(
		globalClineWorkflowsFilePath,
		globalWorkflowToggles,
		instructionsFilesExtension,
		[],
		instructionsExcludedDirectories,
		instructionsExcludedFiles,
	)
	await updateGlobalState(context, "globalWorkflowToggles", updatedGlobalWorkflowToggles)

	const workflowRulesToggles = ((await getWorkspaceState(context, "workflowToggles")) as ClineRulesToggles) || {}
	const workflowsDirPath = path.resolve(workingDirectory, GlobalFileNames.workflows)
	const updatedWorkflowToggles = await synchronizeRuleToggles(
		workflowsDirPath,
		workflowRulesToggles,
		instructionsFilesExtension,
		[],
		instructionsExcludedDirectories,
		instructionsExcludedFiles,
	)
	await updateWorkspaceState(context, "workflowToggles", updatedWorkflowToggles)

	return {
		globalWorkflowToggles: updatedGlobalWorkflowToggles,
		localWorkflowToggles: updatedWorkflowToggles,
	}
}
