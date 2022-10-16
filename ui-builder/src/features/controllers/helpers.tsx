import { ElementOptions } from "./controller"

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