import '@emotion/react'

declare module '@emotion/react' {
	export interface Theme {
		color: {
			primary: string
			positive: string
			negative: string
			text: string
			background: string
		}
	}
}
