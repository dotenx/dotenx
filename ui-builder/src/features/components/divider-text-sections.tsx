import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/divider-text-sections.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, txt } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class DividerTextSections extends Component {
	name = 'Text sections divider'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <DividerTextSectionsOptions />
	}
}

// =============  renderOptions =============

function DividerTextSectionsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const sectionsDiv = component.find(tagIds.sectionsDiv) as BoxElement

	return (
		<ComponentWrapper name="Simple title divider">
			<DndTabs
				containerElement={sectionsDiv}
				renderItemOptions={(element) => (
					<TextStyler label="Text" element={element.children![0] as TextElement} />
				)}
				insertElement={() => createSection()}
			/>
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	sectionsDiv: 'sectionsDiv',
}

const wrapperDiv = box()
	.css({
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		fontSize: '24px',
		paddingTop: '5%',
		paddingBottom: '5%',
		paddingLeft: '0%',
		paddingRight: '0%',
		width: '100%',
	})
	.cssTablet({
		fontSize: '16px',
	})
	.cssMobile({
		fontSize: '12px',
	})
	.serialize()

const sectionsDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flex: '1',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',
		},
	}

	draft.style.tablet = {
		default: {
			rowGap: '15px',
		},
	}

	draft.style.mobile = {
		default: {
			rowGap: '10px',
			flexDirection: 'column',
			flexWrap: 'wrap',
			alignItems: 'stretch',
		},
	}

	draft.customStyle.desktop = {
		'div:not(:last-child)': {
			borderRightWidth: '1px',
			borderRightStyle: 'solid',
			borderRightColor: '#303030',
		},
	}
	draft.customStyle.mobile = {
		'div:not(:last-child)': {
			border: 'none',
		},
	}
	draft.tagId = tagIds.sectionsDiv
}).serialize()

const createSection = () =>
	box([
		txt('Text Section').css({
			textAlign: 'center',
		}),
	]).css({
		width: '100%',
	})

const sections = [
	createSection(),
	createSection(),
	createSection(),
	createSection(),
	createSection(),
	createSection(),
	createSection(),
]

const defaultData = {
	...wrapperDiv,
	components: [
		{
			...sectionsDiv,
			components: sections.map((section) => section.serialize()),
		},
	],
}
