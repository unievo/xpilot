import { synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers"
import { ensureGlobalWorkflowsDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { ClineRulesToggles } from "@shared/cline-rules"
import path from "path"
import { Controller } from "@/core/controller"
import { instructionsExcludedDirectories, instructionsExcludedFiles, instructionsFilesExtension } from "@/shared/Configuration"

/**
 * Refresh the workflow toggles
 */
export async function refreshWorkflowToggles(
	controller: Controller,
	workingDirectory: string,
): Promise<{
	globalWorkflowToggles: ClineRulesToggles
	localWorkflowToggles: ClineRulesToggles
}> {
	// Global workflows
	const globalWorkflowToggles = controller.stateManager.getGlobalStateKey("globalWorkflowToggles")
	const globalClineWorkflowsFilePath = await ensureGlobalWorkflowsDirectoryExists()
	const updatedGlobalWorkflowToggles = await synchronizeRuleToggles(
		globalClineWorkflowsFilePath,
		globalWorkflowToggles,
		instructionsFilesExtension,
		[],
		instructionsExcludedDirectories,
		instructionsExcludedFiles,
	)
	controller.stateManager.setGlobalState("globalWorkflowToggles", updatedGlobalWorkflowToggles)

	const workflowRulesToggles = controller.stateManager.getWorkspaceStateKey("workflowToggles")
	const workflowsDirPath = path.resolve(workingDirectory, GlobalFileNames.workflows)
	const updatedWorkflowToggles = await synchronizeRuleToggles(
		workflowsDirPath,
		workflowRulesToggles,
		instructionsFilesExtension,
		[],
		instructionsExcludedDirectories,
		instructionsExcludedFiles,
	)
	controller.stateManager.setWorkspaceState("workflowToggles", updatedWorkflowToggles)

	return {
		globalWorkflowToggles: updatedGlobalWorkflowToggles,
		localWorkflowToggles: updatedWorkflowToggles,
	}
}
