import { Divider, Image } from '@mantine/core'
import { useAtom, useAtomValue } from 'jotai'
import { ReactElement } from 'react'
import { controllers } from '../controllers'
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

	if (!inserting) return <p className="text-center">...</p>

	return (
		<div className="flex flex-col gap-6">
			{controllers.map((section) => (
				<div key={section.title} className="space-y-4">
					<Divider label={section.title} labelPosition="center" />
					{section.items.map((Item) => {
						const controller = new Item()
						return (
							<InsertionItem
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
				</div>
			))}
		</div>
	)
}

export function InsertionItem({
	label,
	icon,
	onClick,
}: {
	label: string
	icon: ReactElement
	onClick: () => void
}) {
	return (
		<button
			className="border overflow-hidden flex flex-col items-center w-full gap-1 rounded bg-gray-50 text-slate-600 hover:text-slate-900"
			onClick={onClick}
		>
			{icon}
			<p className="text-xs text-center pb-1">{label}</p>
		</button>
	)
}
