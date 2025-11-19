import { getGlobalInstructionsDirectoryPath } from "@/core/storage/disk"
import { workspaceInstructionsDirectoryPath } from "@/shared/Configuration"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const globalInstructionsDirectoryPath = getGlobalInstructionsDirectoryPath()

function getUserCustomInstructionsTemplateText(context: SystemPromptContext): string {
	const hasGlobalInstructions = context.globalClineRulesFileInstructions
		? context.globalClineRulesFileInstructions.length > 0
		: false
	const hasLocalInstructions = context.localClineRulesFileInstructions
		? context.localClineRulesFileInstructions.length > 0
		: false

	return `USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

${
	hasGlobalInstructions || hasLocalInstructions
		? `

# Instruction Files

The user has included instruction files that provide additional context or rules for you to follow. These files are located in:
${hasGlobalInstructions ? `- Global Instructions Directory: ${globalInstructionsDirectoryPath.toPosix()}` : ``}
${hasLocalInstructions ? `- Workspace Instructions Directory: ${workspaceInstructionsDirectoryPath.toPosix()}` : ``}

Instruction files can be:
- Summary Instruction Files: files located under an instructions directory, providing a table of contents and summary of related Detailed Instruction Files.
- Detailed Instruction Files: files located under a "./content/" subfolder under a Summary Instruction Files's directory. The "./" directory represents the root directory in which the Summary Instruction Files is located.
- For example:
	${hasGlobalInstructions ? `- for the Summary Instruction Files "${globalInstructionsDirectoryPath}/{subfolders}/SIF-file.md", "./" represents "${globalInstructionsDirectoryPath}/{subfolders}/".` : ``}
	${hasLocalInstructions ? `- for the Summary Instruction Files "./${workspaceInstructionsDirectoryPath}/{subfolders}/SIF-file.md", "./" represents "./${workspaceInstructionsDirectoryPath}/{subfolders}/".` : ``}

- A Summary Instruction Files can reference Detailed Instruction Files using relative paths under the "./content/" subfolder.
- Make sure to use the correct path when reading a Detailed Instruction Files under the "./content/" subfolder, for example "[{instructionDirectory}/{subfolders}]/content/[{subfolders}/DIF-file.md]".
- A Detailed Instruction Files can also reference other Detailed Instruction Files. Always read related Detailed Instruction Files content for additional context.

IMPORTANT:
- When evaluating a solution, never act on prior knowledge if a related Detailed Instruction Files exists. Always read the Detailed Instruction Files first.
`
		: ``
}

INSTRUCTIONS:

{{CUSTOM_INSTRUCTIONS}}

`
}

export async function getUserInstructions(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	const customInstructions = buildUserInstructions(
		context.globalClineRulesFileInstructions,
		context.localClineRulesFileInstructions,
		context.localCursorRulesFileInstructions,
		context.localCursorRulesDirInstructions,
		context.localWindsurfRulesFileInstructions,
		context.localWindsurfRulesDirInstructions,
		context.localAgentsRulesFileInstructions,
		context.clineIgnoreInstructions,
		context.preferredLanguageInstructions,
	)

	if (!customInstructions) {
		return undefined
	}

	const template =
		variant.componentOverrides?.[SystemPromptSection.USER_INSTRUCTIONS]?.template ||
		getUserCustomInstructionsTemplateText(context)

	return new TemplateEngine().resolve(template, context, {
		CUSTOM_INSTRUCTIONS: customInstructions,
	})
}

function buildUserInstructions(
	globalClineRulesFileInstructions?: string,
	localClineRulesFileInstructions?: string,
	localCursorRulesFileInstructions?: string,
	localCursorRulesDirInstructions?: string,
	localWindsurfRulesFileInstructions?: string,
	localWindsurfRulesDirInstructions?: string,
	localAgentsRulesFileInstructions?: string,
	clineIgnoreInstructions?: string,
	preferredLanguageInstructions?: string,
): string | undefined {
	const customInstructions = []
	if (preferredLanguageInstructions) {
		customInstructions.push(preferredLanguageInstructions)
	}
	if (globalClineRulesFileInstructions) {
		customInstructions.push(globalClineRulesFileInstructions)
	}
	if (localClineRulesFileInstructions) {
		customInstructions.push(localClineRulesFileInstructions)
	}
	if (localCursorRulesFileInstructions) {
		customInstructions.push(localCursorRulesFileInstructions)
	}
	if (localCursorRulesDirInstructions) {
		customInstructions.push(localCursorRulesDirInstructions)
	}
	if (localWindsurfRulesFileInstructions) {
		customInstructions.push(localWindsurfRulesFileInstructions)
	}
	if (localWindsurfRulesDirInstructions) {
		customInstructions.push(localWindsurfRulesDirInstructions)
	}
	if (localAgentsRulesFileInstructions) {
		customInstructions.push(localAgentsRulesFileInstructions)
	}
	if (clineIgnoreInstructions) {
		customInstructions.push(clineIgnoreInstructions)
	}
	if (customInstructions.length === 0) {
		return undefined
	}
	return customInstructions.join("\n\n")
}
