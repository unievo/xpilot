import { webDataProcessing } from "../../custom/guidelines/webDataProcessing"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const AGENT_CUSTOM_INSTRUCTIONS_TEMPLATE_TEXT = `
GUIDELINES

${webDataProcessing}
`

export async function getAgentCustomInstructionsSection(
	variant: PromptVariant,
	context: SystemPromptContext,
): Promise<string | undefined> {
	if (!context.focusChainSettings?.enabled) {
		return undefined
	}

	const template =
		variant.componentOverrides?.[SystemPromptSection.AGENT_CUSTOM_INSTRUCTIONS]?.template ||
		AGENT_CUSTOM_INSTRUCTIONS_TEMPLATE_TEXT

	return new TemplateEngine().resolve(template, context, {})
}
