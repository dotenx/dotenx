import { Collapse } from '@mantine/core'
import { useState } from 'react'
import { BsChevronUp } from 'react-icons/bs'
import { ElementOptions } from './component'

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

export function extractUrl(url: string): string {
	// extract the string inside ulr()
	if (!url) return ''
	return url.match(/^url\(([^)]*)\)$/)?.[1] ?? ''
}

export const Divider = ({ title }: { title: string }) => {
	return (
		<div className={`mt-6 mb-2 flex items-center `}>
			<span className="mr-1 whitespace-nowrap">{title}</span> <hr className="w-full " />
		</div>
	)
}

export const DividerCollapsible = ({
	closed,
	title,
	children,
}: {
	closed?: boolean
	title: string
	children: React.ReactNode
}) => {
	const [opened, setOpened] = useState(closed ? !closed : true)

	return (
		<div className="p-2 my-2 bg-slate-50 bg-opacity-40 ">
			<div
				className="flex items-center p-1 px-2 transition-colors rounded shadow-sm cursor-pointer select-none hover:bg-slate-100 active:opacity-70 active:text-violet-500"
				onClick={() => setOpened((o) => !o)}
			>
				<span className="w-full mr-1 whitespace-nowrap">{title}</span>
				<BsChevronUp className={`w-4 ${opened ? ' ' : 'rotate-180'}`} />
			</div>
			<Collapse in={opened}>
				<div className="pt-4 space-y-4">{children}</div>
			</Collapse>
		</div>
	)
}

export const ComponentName = ({ name }: { name: string }) => (
	<div className="p-2 my-1 font-medium rounded-md bg-slate-50">{name}</div>
)
