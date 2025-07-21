export const mxApiMcpUseGuide = `
## If any connected MultiversX API mcp servers (mx-api) are available, ALWAYS follow these rules:
- Make sure to use the built-in "get_mcp_tool_input_schema" tool to get the full input schema for any tool that does not have a defined input schema.
- Each mx-api mcp server has its own get-network and set-network tool.
- If the current network is not known or specified, ALWAYS ask the user to confirm the correct network using an array of options before continuing.
- Use the set-network tool for first time use on each mx-api mcp server, or after a task was interrupted and resumed. Only use again on the same server if a network change is needed.
- By default tools return a sub-set of most relevant data fields.
- The "fields" parameter in tools can be used to explicitly specify which fields to retrieve, if required.
- Using "fields": ["all"] will return all fields, only use if explicitly required to get all field details, otherwise use the default set of fields.
- Some tools also have parameter names starting with "with{FieldName}" for getting additional field data. Specify them only if explicitly requested to get a specific parameter.
- When specifying "with{FieldName}" parameters always use "fields": ["all"] in the request to ensure all fields are returned.
- For tools returning paginated results, the latest data is available using "from=0" and "size=" for the number of items.
- If no connected servers are available, try another method such as first using direct API calls, then by fetching explorer urls.
`
