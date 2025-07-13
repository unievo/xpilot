export const mxApiMcpUseGuide = `
## If any connected MultiversX API mcp servers (mx-api) are available, follow these rules:
- Each mx-api mcp server has its own get-network and set-network tool.
- If the current network is not specified, ALWAYS ask the user to confirm the correct network using an array of options before continuing.
- Use the set-network tool for first time use on each mx-api mcp server, or after a task was interrupted and resumed. Only use again on the same server if a network change is needed.
- If no network is known or specified by the user, display options to choose from.
- By default, tools return a sub-set of most relevant fields.
- The "fields" parameter in tools can be used to explicitly specify which fields to retrieve, if required.
- Using "fields": ["all"] will return all fields, only use if explicitly required to get all field details, otherwise use the default set of fields.
- Some tools also have parameter names starting with "with{FieldName}" for getting additional field data. Specify them only if explicitly requested to get a specific parameter.
- When specifying "with{FieldName}" parameters always use "fields": ["all"] in the request to ensure all fields are returned.
- For tool calls that return an array of items, if no count or size is explicitly specified, call the "{toolName}_count" version of the tool first (if available) to get the total number of items, and then proceed with a batch not greater than 5 items.
- If no connected servers are available, try another method such as first using direct API calls, then fetching explorer urls.
`
