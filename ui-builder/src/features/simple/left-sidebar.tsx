import { Image, Portal, Select } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { useAtom, useAtomValue } from 'jotai'
import _ from 'lodash'
import { ReactElement, useMemo, useState } from 'react'
import { Components, ComponentSection } from '../components'
import { DividerCollapsible } from '../components/helpers'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { projectTagAtom } from '../page/top-bar'
import { insertingAtom } from './simple-canvas'

export function SimpleLeftSidebar({ components }: { components: Components }) {
	const [selectedTag, setSelectedTag] = useState<null | string>(null)

	const tags = useMemo(
		() =>
			_.uniq(
				components.flatMap((component) =>
					component.items.flatMap((Item) => {
						const item = new (Item as any)()
						const tags: string[] = item.tags
						return tags
					})
				)
			),
		[components]
	)

	const filtered = useMemo(
		() =>
			components
				.map((component) => ({
					...component,
					items: component.items.filter((Item) => {
						const item = new (Item as any)()
						const tags: string[] = item.tags
						if (selectedTag) return tags.includes(selectedTag)
						return true
					}),
				}))
				.filter((component) => component.items.length !== 0),
		[components, selectedTag]
	)

	return (
		<div>
			<Select data={tags} value={selectedTag} onChange={setSelectedTag} clearable />
			<div className="flex flex-col">
				{filtered.map((section) => (
					<SimpleComponentList key={section.title} section={section} />
				))}
			</div>
		</div>
	)
}

function SimpleComponentList({ section: { title, items } }: { section: ComponentSection }) {
	const insertComponent = useInsertComponent()
	const projectTag = useAtomValue(projectTagAtom)

	return (
		<DividerCollapsible closed title={title}>
			{items.map((Item) => {
				const newComponent = new (Item as any)()
				return (
					<SimpleComponentItem
						src={newComponent.image}
						key={newComponent.name}
						image={
							<Image height={100} src={newComponent.image} alt={newComponent.name} />
						}
						label={newComponent.name}
						onClick={() => {
							const component = newComponent.transform()
							insertComponent(component)
							newComponent.onCreate(component, { projectTag })
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
						className="border border rounded-r absolute z-[999999] top-[35%] left-[310px] bg-white"
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
