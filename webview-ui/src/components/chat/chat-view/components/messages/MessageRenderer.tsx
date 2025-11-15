import { ClineMessage } from "@shared/ExtensionMessage"
import React from "react"
import BrowserSessionRow from "@/components/chat/BrowserSessionRow"
import ChatRow from "@/components/chat/ChatRow"
import { defaultExpandedMessageTypes } from "@/components/config"
import { MessageHandlers } from "../../types/chatTypes"

interface MessageRendererProps {
	index: number
	messageOrGroup: ClineMessage | ClineMessage[]
	groupedMessages: (ClineMessage | ClineMessage[])[]
	modifiedMessages: ClineMessage[]
	expandedRows: Record<number, boolean>
	onToggleExpand: (ts: number) => void
	onHeightChange: (isTaller: boolean) => void
	onSetQuote: (quote: string | null) => void
	inputValue: string
	messageHandlers: MessageHandlers
}

/**
 * Helper function to extract message type and set default expansion state
 */
const setDefaultExpandedMessages = (message: ClineMessage, expandedRows: Record<number, boolean>): void => {
	const messageType = message.type === "ask" ? message.ask : message.say
	const shouldDefaultExpand = messageType !== undefined && defaultExpandedMessageTypes.includes(messageType)
	if (expandedRows[message.ts] === undefined && shouldDefaultExpand) {
		expandedRows[message.ts] = true
	}
}

/**
 * Specialized component for rendering different message types
 * Handles browser sessions, regular messages, and checkpoint logic
 */
export const MessageRenderer: React.FC<MessageRendererProps> = ({
	index,
	messageOrGroup,
	groupedMessages,
	modifiedMessages,
	expandedRows,
	onToggleExpand,
	onHeightChange,
	onSetQuote,
	inputValue,
	messageHandlers,
}) => {
	// Determine if this is the last message for status display purposes
	const nextMessage = index < groupedMessages.length - 1 && groupedMessages[index + 1]
	const isNextCheckpoint = !Array.isArray(nextMessage) && nextMessage && nextMessage?.say === "checkpoint_created"
	const isLastMessageGroup = isNextCheckpoint && index === groupedMessages.length - 2
	const isLast = index === groupedMessages.length - 1 || isLastMessageGroup

	// Determine if the message should be expanded by default based on message type
	if (Array.isArray(messageOrGroup)) {
		messageOrGroup.forEach((message) => {
			setDefaultExpandedMessages(message, expandedRows)
		})
	} else {
		setDefaultExpandedMessages(messageOrGroup, expandedRows)
	}

	// Browser session group
	if (Array.isArray(messageOrGroup)) {
		return (
			<BrowserSessionRow
				expandedRows={expandedRows}
				isLast={index === groupedMessages.length - 1}
				key={messageOrGroup[0]?.ts}
				lastModifiedMessage={modifiedMessages.at(-1)}
				messages={messageOrGroup}
				onHeightChange={onHeightChange}
				onSetQuote={onSetQuote}
				onToggleExpand={onToggleExpand}
			/>
		)
	}

	// Regular message
	if (!Array.isArray(messageOrGroup)) {
		return (
			<ChatRow
				inputValue={inputValue}
				isExpanded={expandedRows[messageOrGroup.ts]}
				isLast={isLast}
				key={messageOrGroup.ts}
				lastModifiedMessage={modifiedMessages.at(-1)}
				message={messageOrGroup}
				onHeightChange={onHeightChange}
				onSetQuote={onSetQuote}
				onToggleExpand={onToggleExpand}
				sendMessageFromChatRow={messageHandlers.handleSendMessage}
			/>
		)
	}
}

/**
 * Factory function to create the itemContent callback for Virtuoso
 * This allows us to encapsulate the rendering logic while maintaining performance
 */
export const createMessageRenderer = (
	groupedMessages: (ClineMessage | ClineMessage[])[],
	modifiedMessages: ClineMessage[],
	expandedRows: Record<number, boolean>,
	onToggleExpand: (ts: number) => void,
	onHeightChange: (isTaller: boolean) => void,
	onSetQuote: (quote: string | null) => void,
	inputValue: string,
	messageHandlers: MessageHandlers,
) => {
	return (index: number, messageOrGroup: ClineMessage | ClineMessage[]) => (
		<MessageRenderer
			expandedRows={expandedRows}
			groupedMessages={groupedMessages}
			index={index}
			inputValue={inputValue}
			messageHandlers={messageHandlers}
			messageOrGroup={messageOrGroup}
			modifiedMessages={modifiedMessages}
			onHeightChange={onHeightChange}
			onSetQuote={onSetQuote}
			onToggleExpand={onToggleExpand}
		/>
	)
}
