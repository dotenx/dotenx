import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/team-square-grid.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { box, img, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { BoxStyler, BoxStylerSimple } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import ColorOptions from './basic-components/color-options'
import { Component, ElementOptions } from './component'
import { ComponentName, DividerCollapsible, SimpleComponentOptionsProps } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class TeamSquareGrid extends Component {
	name = 'Team square grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <TeamSquareGridOptions options={options} />
	}
}

const tagIds = {
	title: 'title',
	tilesWrapper: 'tilesWrapper',
}

// =============  renderOptions =============

function TeamSquareGridOptions({ options }: SimpleComponentOptionsProps) {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find<TextElement>(tagIds.title)!
	const tilesWrapper = component.find<BoxElement>(tagIds.tilesWrapper)!

	return (
		<ComponentWrapper name="Team grid" stylers={['backgrounds', 'spacing', 'background-image']}>
			<TextStyler label="Title" element={title} />
			<DndTabs
				containerElement={tilesWrapper}
				insertElement={() =>
					newTile(
						'https://files.dotenx.com/assets/profile-large-349.jpeg',
						'John Doe',
						'Chief Executive Officer'
					)
				}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				autoAdjustGridTemplateColumns={false}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const image = item.children?.[0] as ImageElement
	const name = item.children?.[1] as TextElement
	const position = item.children?.[2] as TextElement
	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			<TextStyler label="Name" element={name} />
			<TextStyler label="Position" element={position} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const frame = box([])
	.css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		paddingLeft: '15%',
		paddingRight: '15%',
		paddingTop: '5%',
		paddingBottom: '5%',
		rowGap: '30px',
	})
	.cssTablet({
		paddingLeft: '10%',
		paddingRight: '10%',
		rowGap: '20px',
	})
	.cssMobile({
		paddingLeft: '5%',
		paddingRight: '5%',
		rowGap: '10px',
	})
	.serialize()

const title = txt('Meet our team')
	.tag(tagIds.title)
	.css({
		fontSize: fontSizes.h2.desktop,
		fontWeight: 'bold',
		color: color('primary'),
	})
	.cssTablet({
		fontSize: fontSizes.h2.tablet,
	})
	.cssMobile({
		fontSize: fontSizes.h2.mobile,
	})
	.serialize()

const newTile = (src: string, name: string, position: string) =>
	box([
		img(src)
			.css({
				width: '100%',
				borderRadius: '5px',
				marginBottom: '15px',
			})
			.cssTablet({
				marginBottom: '10px',
			})
			.cssMobile({
				marginBottom: '5px',
			}),
		txt(name)
			.css({
				color: color('primary'),
				fontSize: fontSizes.h4.desktop,
				fontWeight: 'bold',
			})
			.cssTablet({
				fontSize: fontSizes.h4.tablet,
			})
			.cssMobile({
				fontSize: fontSizes.h4.mobile,
			}),
		txt(position)
			.css({
				color: color('text'),
				fontSize: fontSizes.normal.desktop,
			})
			.cssTablet({
				fontSize: fontSizes.normal.tablet,
			})
			.cssMobile({
				fontSize: fontSizes.normal.mobile,
			}),
	]).css({
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
	})

const tilesWrapper = box([
	newTile(
		'https://files.dotenx.com/assets/profile-large-349.jpeg',
		'John Doe',
		'Chief Executive Officer'
	),
	newTile(
		'https://files.dotenx.com/assets/profile-large-o123.jpeg',
		'James Doe',
		'Chief Financial Officer'
	),
	newTile(
		'https://files.dotenx.com/assets/profile-large-xc92.jpeg',
		'Linda Doe',
		'Marketing Manager'
	),
	newTile(
		'https://files.dotenx.com/assets/profile-large-xz3.jpeg',
		'Sara Doe',
		'Chief Technology Officer'
	),
	newTile(
		'https://files.dotenx.com/assets/profile-large-349.jpeg',
		'John Doe',
		'Chief Executive Officer'
	),
	newTile(
		'https://files.dotenx.com/assets/profile-large-o123.jpeg',
		'James Doe',
		'Chief Financial Officer'
	),
	newTile(
		'https://files.dotenx.com/assets/profile-large-xc92.jpeg',
		'Linda Doe',
		'Marketing Manager'
	),
	newTile(
		'https://files.dotenx.com/assets/profile-large-xz3.jpeg',
		'Sara Doe',
		'Chief Technology Officer'
	),
])
	.css({
		display: 'grid',
		gridTemplateColumns: '1fr 1fr 1fr 1fr',
		gridGap: '20px',
	})
	.cssTablet({
		gridTemplateColumns: '1fr 1fr 1fr',
	})
	.cssMobile({
		gridTemplateColumns: '1fr 1fr',
	})
	.tag(tagIds.tilesWrapper)
	.serialize()

const defaultData = {
	...frame,
	components: [title, tilesWrapper],
}
