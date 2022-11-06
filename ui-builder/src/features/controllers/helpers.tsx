import { Collapse } from '@mantine/core'
import { useState } from 'react'
import { BsChevronUp } from 'react-icons/bs'
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

export function extractUrl(url: string): string {
	// extract the string inside ulr()
	return url.match(/^url\(([^)]*)\)$/)?.[1] ?? ''
}

export const Divider = ({ title }: { title: string }) => {
	return (
		<div className={`mt-6 mb-2 flex items-center `}>
			<span className="whitespace-nowrap mr-1">{title}</span> <hr className=" w-full" />
		</div>
	)
}
export const DividerCollapsible = ({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) => {
	const [opened, setOpened] = useState(true)

	return (
		<div className="mt-4 mb-2 space-y-4">
			<div
				className=" flex items-center cursor-pointer active:opacity-70 active:text-violet-500"
				onClick={() => setOpened((o) => !o)}
			>
				<span className="whitespace-nowrap mr-1">{title}</span> <hr className=" w-full" />
				<BsChevronUp className={`${opened ? ' ' : 'rotate-180'}`} />
			</div>
			<Collapse in={opened}>
				<div className="space-y-4">{children}</div>
			</Collapse>
		</div>
	)
}

export const ComponentName = ({ name }: { name: string }) => (
	<div className="p-2 my-1 rounded-md bg-slate-50 font-medium">{name}</div>
)
