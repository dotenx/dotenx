import { ActionIcon, Menu } from '@mantine/core'
import _ from 'lodash'
import { TbPlus } from 'react-icons/tb'
import componentImage from '../../../assets/components/navbar/navbar-9.png'
import { gridCols } from '../../../utils/style-utils'
import { box, flex, grid, link, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement, useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import componentScript from '../../scripts/navbars.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'
import { cmn } from './common/navbar'

const tags = {
	list: 'list',
	bottom: {
		text: 'bottom.text',
		link: 'bottom.link',
		linkText: 'bottom.linkText',
	},
}

export class Navbar9 extends Component {
	name = 'Navbar 9'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function Options() {
	return (
		<ComponentWrapper>
			<cmn.logo.Options />
			<cmn.buttons.Options />
			<LinkListOptions />
		</ComponentWrapper>
	)
}

function LinkListOptions() {
	const set = useSetElement()
	const component = useSelectedElement() as BoxElement
	const container = component.find(cmn.tags.linkList.container) as BoxElement
	return (
		<OptionsWrapper>
			<DndTabs
				containerElement={container}
				rightSection={
					<Menu position="left">
						<Menu.Target>
							<ActionIcon variant="transparent">
								<TbPlus
									size={16}
									className="text-red-500 rounded-full border-red-500 border"
								/>
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								onClick={() =>
									set(container, (draft) =>
										draft.children.push(cmn.linkItem.el('Link'))
									)
								}
							>
								Text Link
							</Menu.Item>
							<Menu.Item
								onClick={() =>
									set(container, (draft) => draft.children.push(createMenuItem()))
								}
							>
								Menu Link
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				}
				renderItemOptions={(item) => <LinkListItemOptions item={item as BoxElement} />}
			/>
		</OptionsWrapper>
	)
}

function LinkListItemOptions({ item }: { item: BoxElement }) {
	return (
		<OptionsWrapper>
			<cmn.linkItem.Options root={item} />
			<LinkMenuOptions item={item} />
		</OptionsWrapper>
	)
}

function LinkMenuOptions({ item }: { item: BoxElement }) {
	const list = item.find(tags.list) as BoxElement
	if (!list) return null
	return (
		<OptionsWrapper>
			<DndTabs
				containerElement={list}
				renderItemOptions={(item) => <cmn.menuItem.Options item={item as BoxElement} />}
				insertElement={() => cmn.menuItem.el('Page')}
			/>
			<BottomOptions item={item} />
		</OptionsWrapper>
	)
}

function BottomOptions({ item }: { item: BoxElement }) {
	const text = item.find(tags.bottom.text) as TextElement
	const link = item.find(tags.bottom.link) as LinkElement
	const linkText = item.find(tags.bottom.linkText) as TextElement
	return (
		<OptionsWrapper>
			<TextStyler label="Text" element={text} />
			<LinkStyler label="Link" element={link} />
			<TextStyler label="Link text" element={linkText} />
		</OptionsWrapper>
	)
}

const component = () =>
	cmn.container.el([
		box([
			flex([cmn.logo.el(), menu()]).css({
				gap: '1.5rem',
				alignItems: 'center',
			}),
			cmn.buttons.el().cssTablet({
				display: 'none',
			}),
			cmn.menuBtn.el(),
		]).css({
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',
		}),
	])

const menu = () =>
	cmn.menu.el([
		linkList(),
		cmn.buttons
			.el()
			.css({
				display: 'none',
			})
			.cssTablet({
				display: 'flex',
			}),
	])

const linkList = () =>
	flex([
		cmn.linkItem.el('Link One'),
		cmn.linkItem.el('Link Two'),
		cmn.linkItem.el('Link Three'),
		createMenuItem(),
	])
		.cssTablet({
			flexDirection: 'column',
		})
		.tag(cmn.tags.linkList.container)

const createMenuItem = () =>
	cmn.linkMenu
		.el(
			'Link Four',
			[
				cmn.linkSubmenu
					.el([
						grid(4)
							.populate([
								cmn.menuItem.el('Page one'),
								cmn.menuItem.el('Page two'),
								cmn.menuItem.el('Page three'),
								cmn.menuItem.el('Page four'),
							])
							.tag(tags.list)
							.css({
								padding: '2rem 5%',
							})
							.cssTablet({
								gridTemplateColumns: gridCols(1),
							}),
						flex([
							flex([
								txt('Ready to get started?').tag(tags.bottom.text),
								link()
									.populate([
										txt(' Sign up for free')
											.css({
												textDecoration: 'underline',
											})
											.tag(tags.bottom.linkText),
									])
									.tag(tags.bottom.link),
							]).css({
								gap: '1ch',
								textAlign: 'center',
							}),
						])
							.css({
								backgroundColor: '#F4F4F4',
								padding: '1rem 5%',
								justifyContent: 'center',
							})
							.cssTablet({
								flexDirection: 'column',
								gap: '1rem',
							}),
					])
					.css({
						top: '100%',
						right: '0',
						left: '0',
						width: 'auto',
						border: 'none',
						borderBottom: '1px solid #000',
						padding: '0',
					}),
			],
			false
		)
		.css({
			position: 'unset',
		})
