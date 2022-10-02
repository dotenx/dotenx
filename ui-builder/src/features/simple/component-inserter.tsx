import { Divider, Image } from '@mantine/core'
import { useAtom } from 'jotai'
import { ReactElement } from 'react'
import { controllers } from '../controllers'
import { useElementsStore } from '../elements/elements-store'
import { insertingAtom } from './simple-canvas'

export function ComponentInserter() {
	const { addAfter, addBefore, add } = useElementsStore((store) => ({
		add: store.add,
		addBefore: store.add,
		addAfter: store.add,
	}))
	const [inserting, setInserting] = useAtom(insertingAtom)

	if (!inserting) return <p className="text-center">...</p>

	return (
		<div className="flex flex-col gap-6">
			{controllers.map((section) => (
				<div key={section.title}>
					<Divider label={section.title} labelPosition="center" mb="xs" />
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
									switch (inserting.placement) {
										case 'initial':
											add(controller.transform(), {
												id: inserting.where,
												mode: 'in',
											})
											break
										case 'before':
											addBefore(controller.transform(), {
												id: inserting.where,
												mode: 'before',
											})
											break
										case 'after':
											addAfter(controller.transform(), {
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
