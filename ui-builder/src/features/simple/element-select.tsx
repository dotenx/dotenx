import { Image } from '@mantine/core'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ReactElement } from 'react'
import { elementHoverAtom } from '../advanced/element-dragger-layer'
import { controllers } from '../controllers'
import { DividerCollapsible } from '../controllers/helpers'
import { useDataSourceStore } from '../data-source/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { projectTagAtom } from '../page/top-bar'
import { insertingAtom } from './simple-canvas'

export function SimpleElementSelect() {
	const { addDataSource } = useDataSourceStore((store) => ({
		addDataSource: store.add,
	}))
	const { addAfter, addBefore, add } = useElementsStore((store) => ({
		add: store.add,
		addBefore: store.add,
		addAfter: store.add,
	}))
	const [inserting, setInserting] = useAtom(insertingAtom)
	const projectTag = useAtomValue(projectTagAtom)
	const setElementHover = useSetAtom(elementHoverAtom)

	if (!inserting) return <p className="text-center">...</p>

	return (
		<div className="flex flex-col ">
			{controllers.map((section) => (
				<div key={section.title} className="">
					<DividerCollapsible closed title={section.title}>
						{section.items.map((Item) => {
							const controller = new Item()
							return (
								<InsertionItem
									src={controller.image}
									key={controller.name}
									icon={
										<Image
											height={100}
											src={controller.image}
											alt={controller.name}
										/>
									}
									label={controller.name}
									onClick={() => {
										setElementHover('')
										const newElement = controller.transform()
										controller.onCreate(newElement)
										switch (inserting.placement) {
											case 'initial':
												add(newElement, {
													id: inserting.where,
													mode: 'in',
												})
												break
											case 'before':
												addBefore(newElement, {
													id: inserting.where,
													mode: 'before',
												})
												break
											case 'after':
												addAfter(newElement, {
													id: inserting.where,
													mode: 'after',
												})
												break
										}
										setInserting(null)
									}}
								/>
							)
						})}
					</DividerCollapsible>
				</div>
			))}
		</div>
	)
}

export function InsertionItem({
	label,
	src,
	icon,
	onClick,
}: {
	label: string
	src: string
	icon: ReactElement
	onClick: () => void
}) {
	const setElementHover = useSetAtom(elementHoverAtom)

	return (
		// WIP
		<button
			onMouseEnter={() => setElementHover(src)}
			onMouseLeave={() => setElementHover('')}
			className="group border overflow-hidden flex flex-col items-center w-full gap-1 rounded bg-gray-50 text-slate-600 hover:text-slate-900"
			onClick={onClick}
		>
			{icon}
			<p className="text-xs text-center pb-1 ">{label}</p>
			<div className="hidden group-hover:block w-52 h-52 bg-red-300 absolute z-[100000] left-40">
				here
			</div>
		</button>
	)
}
