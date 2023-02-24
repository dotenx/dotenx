import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/basic-text.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { TextStyler } from '../simple/stylers/text-styler'
import { inteliText } from '../ui/intelinput'
import { Controller, ElementOptions } from './controller'
import { ComponentWrapper } from './helpers/component-wrapper'

export class BasicText extends Controller {
	name = 'Text'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <BasicTextOptions />
	}
}

// =============  renderOptions =============

function BasicTextOptions() {
	const component = useSelectedElement<BoxElement>()!
	const text = component.children[0] as TextElement

	return (
		<ComponentWrapper name="Text">
			<TextStyler label="Text" element={text} />
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const defaultData = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
		},
	}
	const element = produce(new TextElement(), (draft) => {
		draft.data.text = inteliText('Add Your Custom Text')
	})

	draft.children = [element]
}).serialize()
