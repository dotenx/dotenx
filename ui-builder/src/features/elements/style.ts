import { CSSProperties } from 'react'

export interface Style {
	desktop?: SelectorStyle
	tablet?: SelectorStyle
	mobile?: SelectorStyle
}

export type SelectorStyle = Partial<Record<CssSelector, CSSProperties>>

export enum CssSelector {
	Default = 'default',
	Hover = 'hover',
	Focus = 'focus',
	Disabled = 'disabled',
	Active = 'active',
	Visited = 'visited',
}

export const cssSelectors = [
	CssSelector.Default,
	CssSelector.Hover,
	CssSelector.Focus,
	CssSelector.Disabled,
	CssSelector.Active,
	CssSelector.Visited,
]
