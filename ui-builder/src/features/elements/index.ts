import { BoxElement } from './extensions/box'
import { ButtonElement } from './extensions/button'
import { ColumnsElement } from './extensions/columns'
import { DividerElement } from './extensions/divider'
import { FormElement } from './extensions/form'
import { ImageElement } from './extensions/image'
import { InputElement } from './extensions/input'
import { LinkElement } from './extensions/link'
import { MenuButtonElement } from './extensions/nav/menu-button'
import { NavLinkElement } from './extensions/nav/nav-link'
import { NavMenuElement } from './extensions/nav/nav-menu'
import { NavbarElement } from './extensions/nav/navbar'
import { SelectElement } from './extensions/select'
import { StackElement } from './extensions/stack'
import { SubmitElement } from './extensions/submit'
import { TextElement } from './extensions/text'
import { TextareaElement } from './extensions/textarea'

export const ElementSections = [
	{
		title: 'Basic',
		items: [
			TextElement,
			BoxElement,
			ButtonElement,
			ImageElement,
			ColumnsElement,
			StackElement,
			LinkElement,
			DividerElement,
			NavbarElement,
		],
	},
	{
		title: 'Form',
		items: [FormElement, InputElement, SelectElement, TextareaElement, SubmitElement],
	},
] as const

export const ELEMENTS = ElementSections.flatMap((element) => element.items).concat([
	MenuButtonElement,
	NavLinkElement,
	NavMenuElement,
])
