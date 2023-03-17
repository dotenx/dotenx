import _ from 'lodash'
import image from '../../assets/components/faq-collapsible.png'
import { shared } from '../ecommerce/shared'
import { box, flex, icn, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import rawScript from '../scripts/faq-collapsible.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStyler } from '../simple/stylers/box-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FaqCollapsible extends Component {
	name = 'FAQ Collapsible'
	image = image
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(rawScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function Options() {
	const wrapper = useSelectedElement<BoxElement>()!
	const items = wrapper.find<BoxElement>(tags.items)!

	return (
		<ComponentWrapper name="FAQ Collapsible">
			<DndTabs
				containerElement={items}
				insertElement={() =>
					item({
						title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
						description:
							'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
					})
				}
				renderItemOptions={(item) => <ItemOptions wrapper={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ wrapper }: { wrapper: BoxElement }) {
	const title = wrapper.find<TextElement>(tags.title)!
	const description = wrapper.find<TextElement>(tags.description)!

	return (
		<OptionsWrapper>
			<BoxStyler element={wrapper} label="Item" />
			<TextStyler element={title} label="Title" />
			<TextStyler element={description} label="Description" />
		</OptionsWrapper>
	)
}

const tags = {
	items: 'items',
	title: 'title',
	description: 'description',
}

const component = () =>
	box([
		shared
			.container()
			.tag(tags.items)
			.populate([
				item({
					title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
					description:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
				}),
				item({
					title: 'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?',
					description:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
				}),
			])
			.css({
				display: 'flex',
				flexDirection: 'column',
				gap: '10px',
			}),
	]).css({
		backgroundColor: '#E2E2E2',
		padding: '20px',
	})

const item = ({ title, description }: { title: string; description: string }) =>
	box([
		flex([
			txt(title).tag(tags.title).css({
				fontSize: '24px',
				fontWeight: '700',
			}),
			icn('plus').size('20px'),
		]).css({
			justifyContent: 'space-between',
			alignItems: 'center',
		}),
		txt(description)
			.tag(tags.description)
			.css({
				marginTop: '64px',
				display: 'none',
			})
			.class('description'),
	])
		.css({
			backgroundColor: '#FFFFFF',
			borderRadius: '30px',
			padding: '70px',
			cursor: 'pointer',
		})
		.class('item')
