import { produce } from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/information-section.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, txt } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class DividerInfo extends Component {
	name = 'Information section'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <DividerInfoOptions />
	}
}

// =============  renderOptions =============

function DividerInfoOptions() {
	const component = useSelectedElement<BoxElement>()!
	const sectionsDiv = component.find(tagIds.sectionsDiv) as ColumnsElement

	return (
		<ComponentWrapper name="Information section">
			<ColumnsStyler element={sectionsDiv} maxColumns={8} />
			<DndTabs
				containerElement={sectionsDiv}
				renderItemOptions={(element) => (
					<div className="space-y-4">
						<TextStyler label="Text" element={element.children![0] as TextElement} />
						<TextStyler label="Stat" element={element.children![1] as TextElement} />
					</div>
				)}
				insertElement={() => createSection('Title', 'Value')}
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
		paddingLeft: '15%',
		paddingRight: '15%',
		width: '100%',
	})
	.cssTablet({
		fontSize: '16px',
	})
	.cssMobile({
		fontSize: '12px',
	})
	.serialize()

const sectionsDiv = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr ',
			justifyContent: 'space-between',
			alignItems: 'start',
			width: '100%',
			gap: '10px',
			rowGap: '25px',
		},
	}

	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr',
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

	draft.tagId = tagIds.sectionsDiv
}).serialize()

const createSection = (label: string, value: string) =>
	box([
		txt(label)
			.css({
				textAlign: 'left',
				fontSize: fontSizes.normal.desktop,
				textDecoration: 'underline',
				fontWeight: 'bold',
			})
			.cssTablet({
				fontSize: fontSizes.normal.tablet,
			})
			.cssMobile({
				fontSize: fontSizes.normal.mobile,
			}),
		txt(value)
			.css({
				marginTop: '10px',
				textAlign: 'left',
				fontSize: '0.875rem',
				fontWeight: 'lighter',
			})
			.cssTablet({
				marginTop: '0px',
				fontSize: '0.875rem',
			})
			.cssMobile({
				fontSize: '0.75rem',
			}),
	])
		.css({
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'stretch',
			width: '100%',
		})
		.class(['section']) // This is not necessary in the rendered code but I've added it as we add extra divs in the ui-builder

const sections = [
	createSection('Address', 'This is a placeholder for address'),
	createSection('Email', 'example@email.com'),
	createSection('Phone', '0123456789'),
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
