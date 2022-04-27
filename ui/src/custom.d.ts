declare module '*.png' {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const value: any
	export = value
}

declare module '*.svg' {
	import * as React from 'react'

	export const ReactComponent: React.FunctionComponent<
		React.SVGProps<SVGSVGElement> & { title?: string }
	>

	const src: string
	export default src
}
