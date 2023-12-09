import {
	Button,
	CloseButton,
	clsx,
	MultiSelect,
	MultiSelectValueProps,
	Select,
	TextInput,
} from '@mantine/core'
import { openModal } from '@mantine/modals'
import { produce } from 'immer'
import { atom, useAtom, useSetAtom } from 'jotai'
import _ from 'lodash'
import { useEffect } from 'react'
import { Element } from '../elements/element'
import { useElementsStore, useSetElement } from '../elements/elements-store'
import { CssSelector, cssSelectors } from '../elements/style'
import { useSelectedElements } from '../selection/use-selected-component'
import { CollapseLine } from '../ui/collapse-line'
import { useClassesStore } from './classes-store'

export const selectedClassAtom = atom<string | null>(null)
export const selectedSelectorAtom = atom<CssSelector>(CssSelector.Default)

export function ClassEditor() {
	const { addClassName, classNames } = useClassesStore((store) => ({
		addClassName: store.add,
		classNames: store.classes,
	}))
	const set = useSetElement()
	const classNameList = _.keys(classNames)
	const setElement = useElementsStore((store) => store.set)
	const [selector, setSelector] = useAtom(selectedSelectorAtom)
	const selectedElements = useSelectedElements()
	const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null
	const setSelectedClass = useSetAtom(selectedClassAtom)

	useEffect(() => {
		if (selectedElement?.id) {
			setSelector(CssSelector.Default)
			setSelectedClass(null)
		}
	}, [selectedElement?.id, setSelectedClass, setSelector])

	if (!selectedElement) return null
	const elementClasses = selectedElement.classes

	return (
		<CollapseLine label="Class" defaultClosed>
			<div>
				<MultiSelect
					placeholder="Select class for this component"
					data={classNameList}
					value={elementClasses}
					onChange={(value) =>
						setElement(
							produce(selectedElement, (draft) => {
								draft.classes = value
							})
						)
					}
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
				<Button
					size="xs"
					variant="subtle"
					mt="xs"
					fullWidth
					onClick={() => openModal({ title: 'All Classes', children: <AllClasses /> })}
				>
					All Classes
				</Button>
				<Select
					data={cssSelectors}
					size="xs"
					mt="xs"
					value={selector}
					onChange={(value: CssSelector) => setSelector(value)}
				/>
				<TextInput
					placeholder="Element ID"
					size="xs"
					mt="xs"
					value={selectedElement.elementId ?? ''}
					onChange={(event) =>
						set(selectedElement, (draft) => (draft.elementId = event.target.value))
					}
				/>
			</div>
		</CollapseLine>
	)
}

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

function AllClasses() {
	const { classNames, removeClassName } = useClassesStore((store) => ({
		classNames: store.classes,
		removeClassName: store.remove,
	}))
	const classList = _.keys(classNames)
	const { elements, reset } = useElementsStore((store) => ({
		elements: store.elements,
		reset: store.reset,
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
							reset(removeClassesFromElements(elements, className))
						}}
					/>
				</div>
			))}
		</div>
	)
}

const removeClassesFromElements = (elements: Element[], className: string): Element[] => {
	return elements.map((element) =>
		produce(element, (draft) => {
			const children = removeClassesFromElements(element.children ?? [], className)
			draft.children = children
			draft.classes = draft.classes.filter((c) => c !== className)
		})
	)
}
