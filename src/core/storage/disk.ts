import { Anthropic } from "@anthropic-ai/sdk"
import { TaskMetadata } from "@core/context/context-tracking/ContextTrackerTypes"
import { execa } from "@packages/execa"
import {
	apiConversationHistoryFile,
	contextHistoryFile,
	groqModelsFile,
	instructionsDirectory,
	mcpDirectory,
	mcpServersDirectory,
	mcpSettingsFile,
	openRouterModelsFile,
	productName,
	publisherName,
	settingsDirectory,
	taskMetadataFile,
	uiMessagesFile,
	workflowsDirectory,
	workspaceInstructionsDirectoryPath,
	workspaceWorkflowsDirectoryPath,
} from "@shared/Configuration"
import { ClineMessage } from "@shared/ExtensionMessage"
import { fileExistsAtPath } from "@utils/fs"
import fs from "fs/promises"
import os from "os"
import * as path from "path"
import * as vscode from "vscode"

export const GlobalFileNames = {
	apiConversationHistory: apiConversationHistoryFile,
	contextHistory: contextHistoryFile,
	uiMessages: uiMessagesFile,
	openRouterModels: openRouterModelsFile,
	vercelAiGatewayModels: "vercel_ai_gateway_models.json",
	groqModels: groqModelsFile,
	basetenModels: "baseten_models.json",
	mcpSettings: mcpSettingsFile,
	clineRules: workspaceInstructionsDirectoryPath,
	workflows: workspaceWorkflowsDirectoryPath,
	cursorRulesDir: ".cursor/rules",
	cursorRulesFile: ".cursorrules",
	windsurfRulesDir: ".windsurf/rules",
	windsurfRulesFile: ".windsurfrules",
	taskMetadata: taskMetadataFile,
}

export async function getDocumentsPath(): Promise<string> {
	if (process.platform === "win32") {
		try {
			const { stdout: docsPath } = await execa("powershell", [
				"-NoProfile", // Ignore user's PowerShell profile(s)
				"-Command",
				"[System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)",
			])
			const trimmedPath = docsPath.trim()
			if (trimmedPath) {
				return trimmedPath
			}
		} catch (_err) {
			console.error("Failed to retrieve Windows Documents path. Falling back to homedir/Documents.")
		}
	} else if (process.platform === "linux") {
		try {
			// First check if xdg-user-dir exists
			await execa("which", ["xdg-user-dir"])

			// If it exists, try to get XDG documents path
			const { stdout } = await execa("xdg-user-dir", ["DOCUMENTS"])
			const trimmedPath = stdout.trim()
			if (trimmedPath) {
				return trimmedPath
			}
		} catch {
			// Log error but continue to fallback
			console.error("Failed to retrieve XDG Documents path. Falling back to homedir/Documents.")
		}
	}

	// Default fallback for all platforms
	return path.join(os.homedir(), "Documents")
}

export async function getUserProductDirectoryPath(): Promise<string> {
	const userProductPath = path.join(os.homedir(), `.${publisherName}`, productName)
	return userProductPath
}

export async function getUserMcpDirectoryPath(): Promise<string> {
	const mcpDir = path.join(await getUserProductDirectoryPath(), mcpDirectory)
	return mcpDir
}

export async function getUserMcpServersPath(): Promise<string> {
	const mcpServersDir = path.join(await getUserMcpDirectoryPath(), mcpServersDirectory)
	return mcpServersDir
}

export async function ensureTaskDirectoryExists(context: vscode.ExtensionContext, taskId: string): Promise<string> {
	const globalStoragePath = context.globalStorageUri.fsPath
	const taskDir = path.join(globalStoragePath, "tasks", taskId)
	await fs.mkdir(taskDir, { recursive: true })
	return taskDir
}

export async function getGlobalInstructionsDirectoryPath(): Promise<string> {
	return path.join(await getUserProductDirectoryPath(), instructionsDirectory)
}

export async function ensureGlobalInstructionsDirectoryExists(): Promise<string> {
	const clineRulesDir = await getGlobalInstructionsDirectoryPath()
	try {
		await fs.mkdir(clineRulesDir, { recursive: true })
	} catch (_error) {
		return path.join(os.homedir(), `.${publisherName}`, productName, instructionsDirectory)
	}
	return clineRulesDir
}

export async function getGlobalWorkflowsDirectoryPath(): Promise<string> {
	return path.join(await getUserProductDirectoryPath(), workflowsDirectory)
}

export async function ensureGlobalWorkflowsDirectoryExists(): Promise<string> {
	const clineWorkflowsDir = await getGlobalWorkflowsDirectoryPath()
	try {
		await fs.mkdir(clineWorkflowsDir, { recursive: true })
	} catch (_error) {
		return path.join(os.homedir(), `.${publisherName}`, productName, workflowsDirectory)
	}
	return clineWorkflowsDir
}

export async function ensureMcpServersDirectoryExists(): Promise<string> {
	const mcpServersDir = await getUserMcpServersPath()
	try {
		await fs.mkdir(mcpServersDir, { recursive: true })
	} catch (_error) {
		return path.join(os.homedir(), `.${publisherName}`, productName, mcpDirectory, mcpServersDirectory)
	}
	return mcpServersDir
}

export async function ensureSettingsDirectoryExists(): Promise<string> {
	const settingsDir = path.join(await getUserProductDirectoryPath(), settingsDirectory)
	await fs.mkdir(settingsDir, { recursive: true })
	return settingsDir
}

export async function getSavedApiConversationHistory(
	context: vscode.ExtensionContext,
	taskId: string,
): Promise<Anthropic.MessageParam[]> {
	const filePath = path.join(await ensureTaskDirectoryExists(context, taskId), GlobalFileNames.apiConversationHistory)
	const fileExists = await fileExistsAtPath(filePath)
	if (fileExists) {
		return JSON.parse(await fs.readFile(filePath, "utf8"))
	}
	return []
}

export async function saveApiConversationHistory(
	context: vscode.ExtensionContext,
	taskId: string,
	apiConversationHistory: Anthropic.MessageParam[],
) {
	try {
		const filePath = path.join(await ensureTaskDirectoryExists(context, taskId), GlobalFileNames.apiConversationHistory)
		await fs.writeFile(filePath, JSON.stringify(apiConversationHistory))
	} catch (error) {
		// in the off chance this fails, we don't want to stop the task
		console.error("Failed to save API conversation history:", error)
	}
}

export async function getSavedClineMessages(context: vscode.ExtensionContext, taskId: string): Promise<ClineMessage[]> {
	const filePath = path.join(await ensureTaskDirectoryExists(context, taskId), GlobalFileNames.uiMessages)
	if (await fileExistsAtPath(filePath)) {
		return JSON.parse(await fs.readFile(filePath, "utf8"))
	} else {
		// check old location
		const oldPath = path.join(await ensureTaskDirectoryExists(context, taskId), "claude_messages.json")
		if (await fileExistsAtPath(oldPath)) {
			const data = JSON.parse(await fs.readFile(oldPath, "utf8"))
			await fs.unlink(oldPath) // remove old file
			return data
		}
	}
	return []
}

export async function saveClineMessages(context: vscode.ExtensionContext, taskId: string, uiMessages: ClineMessage[]) {
	try {
		const taskDir = await ensureTaskDirectoryExists(context, taskId)
		const filePath = path.join(taskDir, GlobalFileNames.uiMessages)
		await fs.writeFile(filePath, JSON.stringify(uiMessages))
	} catch (error) {
		console.error("Failed to save ui messages:", error)
	}
}

export async function getTaskMetadata(context: vscode.ExtensionContext, taskId: string): Promise<TaskMetadata> {
	const filePath = path.join(await ensureTaskDirectoryExists(context, taskId), GlobalFileNames.taskMetadata)
	try {
		if (await fileExistsAtPath(filePath)) {
			return JSON.parse(await fs.readFile(filePath, "utf8"))
		}
	} catch (error) {
		console.error("Failed to read task metadata:", error)
	}
	return { files_in_context: [], model_usage: [] }
}

export async function saveTaskMetadata(context: vscode.ExtensionContext, taskId: string, metadata: TaskMetadata) {
	try {
		const taskDir = await ensureTaskDirectoryExists(context, taskId)
		const filePath = path.join(taskDir, GlobalFileNames.taskMetadata)
		await fs.writeFile(filePath, JSON.stringify(metadata, null, 2))
	} catch (error) {
		console.error("Failed to save task metadata:", error)
	}
}
