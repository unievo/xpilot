import { EmptyRequest, String } from "@shared/proto/cline/common"
import * as vscode from "vscode"
import { publishedName, publisherName } from "@/shared/Configuration"

export async function getIdeRedirectUri(_: EmptyRequest): Promise<String> {
	const uriScheme = vscode.env.uriScheme || "vscode"
	const url = `${uriScheme}://${publisherName}.${publishedName}`
	return { value: url }
}
