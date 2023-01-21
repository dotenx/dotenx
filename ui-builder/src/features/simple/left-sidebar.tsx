import { Image, Portal } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { useAtom } from 'jotai'
import { ReactElement } from 'react'
import { FaPlus } from 'react-icons/fa'
import { controllers } from '../controllers'
import { DividerCollapsible } from '../controllers/helpers'
import { useElementsStore } from '../elements/elements-store'
import { AddSimpleComponentButton, insertingAtom } from './simple-canvas'

export function SimpleLeftSidebar() {
	const addElement = useElementsStore((store) => store.add)
	const [inserting, setInserting] = useAtom(insertingAtom)

	if (!inserting) return <NotSelectedMessage />

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
										const newElement = controller.transform()
										controller.onCreate(newElement)
										switch (inserting.placement) {
											case 'initial':
												addElement(newElement, {
													id: inserting.where,
													mode: 'in',
												})
												break
											case 'before':
												addElement(newElement, {
													id: inserting.where,
													mode: 'before',
												})
												break
											case 'after':
												addElement(newElement, {
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

function NotSelectedMessage() {
	return (
		<div className="text-xs flex flex-col items-center gap-2">
			Click on
			<AddSimpleComponentButton className="!px-1.5 !py-1 pointer-events-none">
				<FaPlus />
				Section
			</AddSimpleComponentButton>
			to see the component list
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
	const { hovered, ref } = useHover<HTMLButtonElement>()

	return (
		<button
			ref={ref}
			className=" border overflow-hidden flex flex-col items-center w-full gap-1 rounded bg-gray-50 text-slate-600 hover:text-slate-900"
			onClick={onClick}
		>
			{icon}
			<p className="text-xs text-center pb-1 ">{label}</p>
			{hovered && (
				<Portal>
					<img
						className="outline outline-1 outline-slate-200 shadow-md w-[700px] h-[300px] rounded-2xl absolute z-[100]   top-[35%] left-[20%]"
						src={src}
						alt="Preview"
					/>
				</Portal>
			)}
		</button>
	)
}
