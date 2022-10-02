import { ActionIcon, clsx } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { openModal } from '@mantine/modals'
import { useSetAtom } from 'jotai'
import { TbChevronDown, TbChevronUp, TbPackgeExport } from 'react-icons/tb'
import { Element } from '../elements/element'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { selectedClassAtom } from '../style/class-editor'
import { ComponentForm } from './component-form'

export function Layers({ elements }: { elements: Element[] }) {
	return (
		<div className="text-sm">
			{elements.map((component) => (
				<Layer key={component.id} element={component} />
			))}
		</div>
	)
}

function Layer({ element: element }: { element: Element }) {
	const { setHovered, unsetHovered, select, selectedIds } = useSelectionStore((store) => ({
		setHovered: store.setHovered,
		unsetHovered: store.unsetHovered,
		select: store.select,
		selectedIds: store.selectedIds,
	}))
	const setSelectedClass = useSetAtom(selectedClassAtom)
	const [opened, disclosure] = useDisclosure(true)
	const { isSelected } = useIsHighlighted(element.id)

	const disclosureButton = element.isContainer() && (
		<ActionIcon
			size="xs"
			className="opacity-0 group-hover:opacity-100"
			onClick={disclosure.toggle}
		>
			{opened ? <TbChevronUp /> : <TbChevronDown />}
		</ActionIcon>
	)

	const childrenLayers = element.children && (
		<div className="pl-4" hidden={!opened}>
			<Layers elements={element.children} />
		</div>
	)

	return (
		<div className={clsx(isSelected && 'bg-gray-200 rounded')}>
			<div
				className="flex items-center py-1 border-b group"
				onMouseOver={() => setHovered(element.id)}
				onMouseOut={() => unsetHovered()}
				onClick={(event) => {
					if (event.ctrlKey && !isSelected) select([...selectedIds, element.id])
					else select([element.id])
					if (!isSelected) setSelectedClass(null)
					document.getElementById(element.id)?.scrollIntoView()
				}}
			>
				<div>{disclosureButton}</div>
				<span className={clsx('pl-1', !element.hasChildren() && 'pl-[22px]')}>
					{element.icon}
				</span>
				<p className="pl-2 cursor-default">{element.name}</p>
				<div className="ml-auto opacity-0 group-hover:opacity-100">
					<ExtractButton element={element} />
				</div>
			</div>
			{childrenLayers}
		</div>
	)
}

function ExtractButton({ element }: { element: Element }) {
	return (
		<ActionIcon
			title="Create custom component"
			size="sm"
			onClick={() =>
				openModal({
					title: 'Create Component',
					children: <ComponentForm element={element} />,
				})
			}
		>
			<TbPackgeExport />
		</ActionIcon>
	)
}
