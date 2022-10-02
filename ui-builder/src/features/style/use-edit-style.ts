import produce from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { CSSProperties } from 'react'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { useSelectedElement } from '../selection/use-selected-component'
import { viewportAtom } from '../viewport/viewport-store'
import { selectedClassAtom, selectedSelectorAtom } from './class-editor'
import { useClassesStore } from './classes-store'

export type EditStyle = (style: keyof CSSProperties, value: string) => void

export const useEditStyle = () => {
	const element = useSelectedElement()
	const viewport = useAtomValue(viewportAtom)
	const editSingleStyle = useEditElementStyle(element)
	const selectedClassName = useAtomValue(selectedClassAtom)
	const { classNames, editClassName } = useClassesStore((store) => ({
		classNames: store.classes,
		editClassName: store.edit,
	}))
	const selector = useAtomValue(selectedSelectorAtom)
	const style =
		(selectedClassName
			? classNames[selectedClassName][viewport]?.[selector]
			: element?.style[viewport]?.[selector]) ?? {}
	const editClassStyle = (styles: CSSProperties) => {
		if (selectedClassName) editClassName(selectedClassName, viewport, selector, styles)
		else console.error("Can't edit class style without selected class name")
	}
	const editClassOrComponentStyle = selectedClassName ? editClassStyle : editSingleStyle
	const editStyle: EditStyle = (oneStyle, value) => {
		editClassOrComponentStyle({ ...style, [oneStyle]: value })
	}

	return { editStyle, style }
}

const useEditElementStyle = (element: Element | null) => {
	const selector = useAtomValue(selectedSelectorAtom)
	const viewport = useAtomValue(viewportAtom)
	const editElement = useElementsStore((store) => store.set)
	const editStyle = (style: CSSProperties) => {
		if (!element) return
		editElement(
			produce(element, (draft) => {
				_.set(draft, `style.${viewport}.${selector}`, style)
			})
		)
	}
	return editStyle
}
