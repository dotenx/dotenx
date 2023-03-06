import { Image } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import { closeAllModals, openModal } from '@mantine/modals'
import { useAtom, useAtomValue } from 'jotai'
import _ from 'lodash'
import { ReactNode, useMemo, useState } from 'react'
import { TbBox } from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { Components, ComponentSection } from '../components'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { projectTagAtom } from '../page/top-bar'
import { insertingAtom } from './simple-canvas'

export function SimpleLeftSidebar({ components }: { components: Components }) {
	const [selectedTag, setSelectedTag] = useState<null | string>(null)
	const [searched, setSearched] = useInputState('')

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

	const filteredBySearch = useMemo(
		() =>
			filtered
				.map((section) => ({
					...section,
					items: section.items.filter((Item) => {
						const item = new (Item as any)()
						return item.name.toLowerCase().includes(searched.toLowerCase())
					}),
				}))
				.filter((component) => component.items.length !== 0),

		[filtered, searched]
	)

	return (
		<div>
			{/* TODO: add this back when more tags are added */}
			{/* <Select
				data={tags}
				value={selectedTag}
				onChange={setSelectedTag}
				clearable
				placeholder="Filter"
			/> */}
			{/* <TextInput
				size="xs"
				icon={<TbSearch />}
				value={searched}
				onChange={setSearched}
				placeholder="Search"
			/> */}
			<div className="grid grid-cols-2 gap-3">
				{filteredBySearch.map((section) => (
					<ComponentCard
						key={section.title}
						label={section.title}
						icon={section?.icon ?? <TbBox />}
						onClick={() => {
							closeAllModals()
							openModal({
								title: section.title,
								children: <SimpleComponentList section={section} />,
								size: 'xl',
							})
						}}
					/>
				))}
			</div>
		</div>
	)
}

function SimpleComponentList({ section: { items } }: { section: ComponentSection }) {
	const insertComponent = useInsertComponent()
	const projectTag = useAtomValue(projectTagAtom)
	const { pageName = '' } = useParams()

	return (
		<div className="grid grid-cols-2 gap-4">
			{items.map((Item) => {
				const newComponent = new (Item as any)()
				return (
					<div
						key={newComponent.name}
						onClick={() => {
							const component = newComponent.transform()
							insertComponent(component)
							newComponent.onCreate(component, { projectTag, pageName })
							closeAllModals()
						}}
						className="rounded-lg border text-center cursor-pointer hover:bg-gray-50 overflow-clip flex flex-col"
					>
						<Image src={newComponent.image} height={200} />
						<p>{newComponent.name}</p>
					</div>
				)
			})}
		</div>
	)
}

function ComponentCard({
	label,
	icon,
	onClick,
}: {
	label: string
	icon: ReactNode
	onClick?: () => void
}) {
	return (
		<div
			onClick={onClick}
			className="flex flex-col items-center gap-2 p-2 rounded bg-gray-50 cursor-pointer text-slate-600 hover:text-slate-900"
		>
			<div className="pt-1 text-2xl">{icon}</div>
			<p className="text-xs text-center">{label}</p>
		</div>
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
