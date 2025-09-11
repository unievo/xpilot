import * as vscode from "vscode"
import { sideBarId } from "@/shared/Configuration"
import { OpenClineSidebarPanelRequest, OpenClineSidebarPanelResponse } from "@/shared/proto/index.host"

export async function openClineSidebarPanel(_: OpenClineSidebarPanelRequest): Promise<OpenClineSidebarPanelResponse> {
	await vscode.commands.executeCommand(`${sideBarId}.focus`)
	return {}
}
