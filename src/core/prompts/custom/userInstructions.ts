import { GlobalFileNames, getGlobalInstructionsDirectoryPath } from "../../storage/disk"

export async function addUserInstructions(
	settingsCustomInstructions?: string,
	globalClineRulesFileInstructions?: string,
	localClineRulesFileInstructions?: string,
	localCursorRulesFileInstructions?: string,
	localCursorRulesDirInstructions?: string,
	localWindsurfRulesFileInstructions?: string,
	localWindsurfRulesDirInstructions?: string,
	clineIgnoreInstructions?: string,
	preferredLanguageInstructions?: string,
) {
	let customInstructions = ""
	if (preferredLanguageInstructions) {
		customInstructions += preferredLanguageInstructions + "\n\n"
	}
	if (settingsCustomInstructions) {
		customInstructions += settingsCustomInstructions + "\n\n"
	}
	if (globalClineRulesFileInstructions) {
		customInstructions += globalClineRulesFileInstructions + "\n\n"
	}
	if (localClineRulesFileInstructions) {
		customInstructions += localClineRulesFileInstructions + "\n\n"
	}
	if (localCursorRulesFileInstructions) {
		customInstructions += localCursorRulesFileInstructions + "\n\n"
	}
	if (localCursorRulesDirInstructions) {
		customInstructions += localCursorRulesDirInstructions + "\n\n"
	}
	if (localWindsurfRulesFileInstructions) {
		customInstructions += localWindsurfRulesFileInstructions + "\n\n"
	}
	if (localWindsurfRulesDirInstructions) {
		customInstructions += localWindsurfRulesDirInstructions + "\n\n"
	}
	if (clineIgnoreInstructions) {
		customInstructions += clineIgnoreInstructions
	}

	// Return empty string if no custom instructions are provided
	if (!customInstructions.trim()) {
		return ""
	}

	const globalInstructionsDirectoryPath = await getGlobalInstructionsDirectoryPath()

	return `
====

CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be always followed without interfering with the TOOL USE guidelines.

${customInstructions.trim()}

# Using Instruction Files

- Instruction files can reference other instruction detail files in a "./content/" subfolder.
- The "./" part represents the root directory in which the main instruction file is located.
- For example:
	- for the file "./${GlobalFileNames.clineRules}/{library}/{topic}/instruction-file.md", "./" represents "./${GlobalFileNames.clineRules}/{library}/{topic}/".
	- for the file "${globalInstructionsDirectoryPath}/{library}/{topic}/instruction-file.md", "./" represents "${globalInstructionsDirectoryPath}/{library}/{topic}/".
- Make sure to use the correct path when referencing files in the "./content/" subfolder, for example "{instructionDirectory}/{library}/{topic}/content/{subtopic}/related-instruction-file.md".
- Instruction detail files can also reference other instruction detail files. Always read their content as needed.
- Never act on prior knowledge if a related instructions details file exists. Read the related instructions details file first.
- Before thinking about a solution, always read first the related instructions files using the read_file tool.
`
}
