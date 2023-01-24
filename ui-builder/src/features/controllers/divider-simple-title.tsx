import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/divider-simple-title.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxElementInputSimple } from '../ui/box-element-input'
import { inteliText } from '../ui/intelinput'
import { TextElementInput } from '../ui/text-element-input'
import { Controller, ElementOptions } from './controller'
import { ComponentName } from './helpers'
import { OptionsWrapper } from './helpers/options-wrapper'

export class DividerSimpleTitle extends Controller {
	name = 'Divider simple title'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <DividerSimpleTitleOptions />
	}
}

// =============  renderOptions =============

function DividerSimpleTitleOptions() {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find(tagIds.title) as TextElement
	const subtitle = component.find(tagIds.subtitle) as TextElement

	return (
		<OptionsWrapper>
			<ComponentName name="Divider simple title" />
			<TextElementInput label="Title" element={title} />
			<TextElementInput label="Subtitle" element={subtitle} />
			<BoxElementInputSimple label="Background color" element={component} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	title: 'title',
	subtitle: 'subtitle',
}

const wrapperDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			paddingTop: '40px',
			paddingBottom: '40px',
			backgroundColor: 'hsla(0, 0%, 100%, 1)',
		},
	}
}).serialize()

const topDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			textAlign: 'center',
		},
	}
}).serialize()

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '32px',
			marginBottom: '8px',
			color: 'hsla(0, 0%, 4%, 1)',
		},
	}
	draft.data.text = inteliText('Trusted by the world’s best')
	draft.tagId = tagIds.title
}).serialize()

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontWeight: '300',
			fontSize: '24px',
			marginBottom: '12px',
			color: 'hsla(0, 0%, 4%, 1)',
		},
	}
	draft.data.text = inteliText('We’re proud to work with the world’s best brands')
	draft.tagId = tagIds.subtitle
}).serialize()

const defaultData = {
	...wrapperDiv,
	components: [
		{
			...topDiv,
			components: [title, subTitle],
		},
	],
}
