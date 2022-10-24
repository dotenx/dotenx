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

export const Divider = ({ title }: { title: string }) => {
	return (
		<div className="mt-6 mb-2 flex items-center">
			<span className="whitespace-nowrap mr-1">{title}</span> <hr className=" w-full" />
		</div>
	)
}