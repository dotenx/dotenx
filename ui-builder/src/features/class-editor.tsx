import { Button, CloseButton, clsx, MultiSelect, MultiSelectValueProps } from '@mantine/core'
import { openModal } from '@mantine/modals'
import { atom, useAtom } from 'jotai'
import _ from 'lodash'
import { Component, useCanvasStore } from './canvas-store'
import { useClassNamesStore } from './class-names-store'
import { useSelectedComponent } from './use-selected-component'

export const selectedClassAtom = atom<string | null>(null)

function Value({
	value,
	className,
	onRemove,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	classNames,
	...others
}: MultiSelectValueProps & { value: string }) {
	const [selectedClass, setSelectedClass] = useAtom(selectedClassAtom)
	const isSelected = selectedClass === value

	return (
		<div
			{...others}
			className={clsx(
				'rounded flex items-center',
				isSelected ? 'bg-rose-500 text-white' : 'bg-gray-50',
				className
			)}
		>
			<button
				className="pl-1.5"
				onClick={() => {
					if (selectedClass === value) setSelectedClass(null)
					else setSelectedClass(value)
				}}
			>
				{value}
			</button>
			<CloseButton
				size="xs"
				onClick={onRemove}
				variant="transparent"
				className={clsx(isSelected && '!text-white')}
			/>
		</div>
	)
}

export function ClassEditor() {
	const { addClassName, classNames } = useClassNamesStore((store) => ({
		addClassName: store.add,
		classNames: store.classNames,
	}))
	const classNameList = _.keys(classNames)
	const selectedComponent = useSelectedComponent()
	const editComponentClassNames = useCanvasStore((store) => store.editClassNames)
	if (!selectedComponent) return null
	const componentClassNames = selectedComponent.classNames

	return (
		<div>
			<div>
				<MultiSelect
					placeholder="Select class for this component"
					data={classNameList}
					value={componentClassNames}
					onChange={(value) => editComponentClassNames(selectedComponent.id, value)}
					getCreateLabel={(query) => `+ Create new class ${query} `}
					onCreate={(query) => {
						addClassName(query)
						return query
					}}
					valueComponent={Value}
					size="xs"
					searchable
					creatable
				/>
			</div>
			<Button
				size="xs"
				variant="subtle"
				mt="xs"
				fullWidth
				onClick={() => openModal({ title: 'All Classes', children: <AllClasses /> })}
			>
				All Classes
			</Button>
		</div>
	)
}

function AllClasses() {
	const { classNames, removeClassName } = useClassNamesStore((store) => ({
		classNames: store.classNames,
		removeClassName: store.remove,
	}))
	const classList = _.keys(classNames)
	const { components, setComponents } = useCanvasStore((store) => ({
		components: store.components,
		setComponents: store.set,
	}))

	return (
		<div className="flex gap-2 flex-wrap">
			{classList.length === 0 && <p className="text-gray-500">No class added yet</p>}
			{classList.map((className) => (
				<div
					key={className}
					className="flex gap-1 items-center rounded bg-gray-50 pl-2 pr-1"
				>
					<p className="font-mono">{className}</p>
					<CloseButton
						size="xs"
						onClick={() => {
							removeClassName(className)
							setComponents(removeClassNameFromComponents(components, className))
						}}
					/>
				</div>
			))}
		</div>
	)
}

const removeClassNameFromComponents = (components: Component[], className: string): Component[] => {
	return components.map((component) => {
		const children = removeClassNameFromComponents(component.components, className)
		return {
			...component,
			components: children,
			classNames: component.classNames.filter((c) => c !== className),
		}
	})
}
