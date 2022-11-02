import { uuid } from '../../utils'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { MenuButtonElement } from '../elements/extensions/nav/menu-button'
import { NavMenuElement } from '../elements/extensions/nav/nav-menu'
import { NavbarElement } from '../elements/extensions/nav/navbar'
import { useSelectedElement, useSelectedElements } from '../selection/use-selected-component'
import { useClipboardStore } from './clipboard'

export const useCopyPaste = () => {
	const clipboard = useClipboardStore()
	const selectedElements = useSelectedElements()
	const selectedElement = useSelectedElement()
	const addElement = useElementsStore((store) => store.add)

	const copy = () => {
		if (selectedElements.length > 0) clipboard.copy(selectedElements)
	}

	const paste = () => {
		if (clipboard.copiedItems.length === 0) return
		const newElements = regenElements(clipboard.copiedItems)
		if (selectedElement) addElement(newElements, { id: selectedElement.id, mode: 'after' })
	}

	return { copy, paste }
}

export const regenElement = (element: Element) => {
	const newElement = deserializeElement(element.serialize())
	newElement.id = uuid()
	newElement.children = newElement.children?.map((element) => regenElement(element)) ?? null
	if (newElement instanceof NavbarElement) {
		const navMenu = newElement.children.find((element) => element instanceof NavMenuElement)
		const menuButton = newElement.children.find(
			(element): element is MenuButtonElement => element instanceof MenuButtonElement
		)
		if (navMenu && menuButton) {
			menuButton.data.menuId = navMenu.id
		}
	}
	return newElement
}

export const regenElements = (elements: Element[]) => {
	return elements.map((element) => regenElement(element))
}
