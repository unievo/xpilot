// Theme
import { useEffect, useState } from "react"

// One high contrast mode color
const highContrastModeColor = "var(--vscode-settings-checkboxBorder)"
// Regular theme colors
const actModeColor = "var(--vscode-button-background)"
const planModeColor = "var(--vscode-button-secondaryBackground)"

// Theme colors
export const actModeTextColor = "var(--vscode-button-foreground)"
export const planModeTextColor = "var(--vscode-button-secondaryForeground)"
export const inactiveModeTextColor = "var(--vscode-foreground)"
export const chatTextAreaBackground = "color-mix(in srgb, var(--vscode-editor-background) 92%, var(--vscode-editor-foreground))"
export const toolsBackground = `color-mix(in srgb, ${chatTextAreaBackground} 90%, var(--vscode-editor-background))`
export const itemIconColor = "color-mix(in srgb, var(--vscode-focusBorder) 60%, var(--vscode-editor-foreground))"
export const menuBackground = `color-mix(in srgb, ${chatTextAreaBackground} 97%, var(--vscode-editor-foreground))`
export const dropdownBackground = "color-mix(in srgb, var(--vscode-dropdown-background) 100%, var(--vscode-editor-background))"
export const rowBackground = `color-mix(in srgb, ${chatTextAreaBackground} 80%, var(--vscode-editor-foreground))`
export const rowBackgroundDetails = `color-mix(in srgb, ${rowBackground} 65%, var(--vscode-editor-background))`
export const rowBackgroundDisabled = `color-mix(in srgb, ${rowBackground} 70%, var(--vscode-editor-background))`
export const chatTextAreaQuoteBackground = `color-mix(in srgb, ${chatTextAreaBackground} 93%, var(--vscode-editor-foreground))`
export const taskHeaderBackground = chatTextAreaBackground

// Reactive theme detection
export function isHighContrastTheme(): boolean {
	return (
		document.body.classList.contains("vscode-high-contrast") ||
		document.body.classList.contains("vscode-high-contrast-light") ||
		window.matchMedia("(forced-colors: active)").matches
	)
}

// Dynamic color getters that re-evaluate on access
export const getActModeColor = (): string => {
	return isHighContrastTheme() ? highContrastModeColor : actModeColor
}

export const getPlanModeColor = (): string => {
	return isHighContrastTheme() ? highContrastModeColor : planModeColor
}

// React hook for theme changes
export function useTheme() {
	const [, forceUpdate] = useState({})
	
	useEffect(() => {
		const cleanup = onThemeChange(() => {
			forceUpdate({}) // Force re-render on theme change
		})
		return cleanup
	}, [])
	
	return {
		isHighContrast: isHighContrastTheme(),
		actModeColor: getActModeColor(),
		planModeColor: getPlanModeColor(),
	}
}

// Listen to theme changes
export function onThemeChange(callback: () => void): () => void {
	// Watch for class changes on body (VSCode adds theme classes)
	const bodyObserver = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.attributeName === "class") {
				callback()
			}
		}
	})

	bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] })

	// Watch for forced-colors media query changes
	const mediaQuery = window.matchMedia("(forced-colors: active)")
	const mediaQueryHandler = () => callback()
	
	// Modern browsers
	if (mediaQuery.addEventListener) {
		mediaQuery.addEventListener("change", mediaQueryHandler)
	} else {
		// Legacy browsers
		mediaQuery.addListener(mediaQueryHandler)
	}

	// Return cleanup function
	return () => {
		bodyObserver.disconnect()
		if (mediaQuery.removeEventListener) {
			mediaQuery.removeEventListener("change", mediaQueryHandler)
		} else {
			mediaQuery.removeListener(mediaQueryHandler)
		}
	}
}
