import { ElementOptions } from './controller'

export function repeatObject<T>(source: T, times: number): T[] {
	const result = []
	for (let i = 0; i < times; i++) {
		result.push(source)
	}
	return result
}

export type SimpleComponentOptionsProps = {
	options: ElementOptions
}

export function extractUrl(url: string) : string {
	// extract the string inside ulr()
	return url.match(/^url\(([^)]*)\)$/)?.[1] ?? ""
}
