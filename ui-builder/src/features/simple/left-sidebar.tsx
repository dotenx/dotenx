import { Image, Portal } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { useAtom, useAtomValue } from 'jotai'
import { ReactElement } from 'react'
import { FaPlus } from 'react-icons/fa'
import { controllers, ControllerSection } from '../controllers'
import { DividerCollapsible } from '../controllers/helpers'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { AddSimpleComponentButton, insertingAtom } from './simple-canvas'

export function SimpleLeftSidebar() {
	const inserting = useAtomValue(insertingAtom)

	if (!inserting) return <NotSelectedMessage />

	return (
		<div className="flex flex-col ">
			{controllers.map((section) => (
				<SimpleComponentList key={section.title} section={section} />
			))}
		</div>
	)
}

function NotSelectedMessage() {
	return (
		<div className="flex flex-col items-center gap-2 text-xs">
			Click on
			<AddSimpleComponentButton className="!px-1.5 !py-1 pointer-events-none">
				<FaPlus />
				Section
			</AddSimpleComponentButton>
			to see the component list
		</div>
	)
}

function SimpleComponentList({ section: { title, items } }: { section: ControllerSection }) {
	const insertComponent = useInsertComponent()

	return (
		<DividerCollapsible closed title={title}>
			{items.map((Item) => {
				const controller = new Item()
				return (
					<SimpleComponentItem
						src={controller.image}
						key={controller.name}
						image={<Image height={100} src={controller.image} alt={controller.name} />}
						label={controller.name}
						onClick={() => {
							const component = controller.transform()
							controller.onCreate(component)
							insertComponent(component)
						}}
					/>
				)
			})}
		</DividerCollapsible>
	)
}

export function SimpleComponentItem({
	label,
	src,
	image,
	onClick,
}: {
	label: string
	src: string
	image: ReactElement
	onClick: () => void
}) {
	const { hovered, ref } = useHover<HTMLButtonElement>()

	return (
		<button
			ref={ref}
			className="flex flex-col items-center w-full gap-1 overflow-hidden border rounded bg-gray-50 text-slate-600 hover:text-slate-900"
			onClick={onClick}
		>
			{image}
			<p className="pb-1 text-xs text-center ">{label}</p>
			{hovered && (
				<Portal>
					<Image
						className="border shadow rounded absolute z-50 top-[35%] left-[20%] bg-white"
						src={src}
						alt="Preview"
						width={700}
						height={300}
						fit="contain"
					/>
				</Portal>
			)}
		</button>
	)
}

const useInsertComponent = () => {
	const [inserting, setInserting] = useAtom(insertingAtom)
	const addElement = useElementsStore((store) => store.add)

	const insert = (component: Element) => {
		if (!inserting) return
		switch (inserting.placement) {
			case 'initial':
				addElement(component, {
					id: inserting.where,
					mode: 'in',
				})
				break
			case 'before':
				addElement(component, {
					id: inserting.where,
					mode: 'before',
				})
				break
			case 'after':
				addElement(component, {
					id: inserting.where,
					mode: 'after',
				})
				break
		}
		setInserting(null)
	}

	return insert
}
