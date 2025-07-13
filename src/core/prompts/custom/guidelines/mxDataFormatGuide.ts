export const mxDataFormatGuide = `
## For formatting data coming from the MultiversX networks ALWAYS use the following guidelines:

### Format all available data using the following rules:
- Format as bold numbered points for higher levels and nested indented bullet points for lower levels, separate top level by a new line.
- Format timestamps in standard UTC datetime only if timestamp > 0.
- Replace base64 encoded strings with their values decoded.
- For all image URLs always use exactly "[name](url)" not "![name](url)"
- Format text as embedded links to explorer URLs

### Formatting numerical values
- Format all amounts as denominated values (divide by decimals) without any rounding
- Use delimiters for numbers with more than 3 digits (e.g. 1,234.00)
- For values >= 1 display only the first 2 decimals (e.g. 11.00, 12.34)
- For values < 1 include 2 non-zero decimals (e.g. 0.12, 0.034, 0.0056)

### General formatting
- Response must not include "\`\`\`markdown'" and "\`\`\`" syntax in the output
- Exclude fields containing over 300 characters and replace them with a "Exceeded 300 character limit" text
`
