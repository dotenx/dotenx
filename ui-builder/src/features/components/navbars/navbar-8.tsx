import { ActionIcon, Menu } from '@mantine/core'
import { TbPlus } from 'react-icons/tb'
import componentImage from '../../../assets/components/navbar/navbar-8.png'
import { gridCols } from '../../../utils/style-utils'
import { box, column, flex, grid, link, txt } from '../../elements/constructor'
import { useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'
import { cmn } from './common/navbar'

const tags = {
	pageGroups: 'pageGroups',
	textGroups: {
		title: 'textGroups.title',
		list: 'textGroups.list',
		text: 'textGroups.item.text',
		link: 'textGroups.item.link',
	},
}

export class Navbar8 extends Component {
	name = 'Navbar 8'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
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
	const pageGroups = item.find(tags.pageGroups) as BoxElement
	if (!pageGroups) return null
	return (
		<OptionsWrapper>
			<DndTabs
				containerElement={pageGroups}
				renderItemOptions={(item) => <cmn.pageGroup.Options item={item as BoxElement} />}
				insertElement={() =>
					cmn.pageGroup.el('Page group ', ['Page', 'Page', 'Page', 'Page'])
				}
				maxLength={2}
			/>
			<TextGroupOptions item={item} />
		</OptionsWrapper>
	)
}

function TextGroupOptions({ item }: { item: BoxElement }) {
	const title = item.find(tags.textGroups.title) as TextElement
	const list = item.find(tags.textGroups.list) as BoxElement
	if (!list) return null
	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<DndTabs
				containerElement={list}
				renderItemOptions={(item) => <TextLinkOptions item={item as BoxElement} />}
				insertElement={() => textLink('Link')}
			/>
		</OptionsWrapper>
	)
}

function TextLinkOptions({ item }: { item: BoxElement }) {
	const link = item.find(tags.textGroups.link) as LinkElement
	const text = item.find(tags.textGroups.text) as TextElement
	return (
		<OptionsWrapper>
			<TextStyler label="Text" element={text} />
			<LinkStyler label="Link" element={link} />
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

const createMenuItem = () =>
	cmn.linkMenu
		.el(
			'Link Four',
			[
				cmn.linkSubmenu
					.el([
						flex([
							grid(2)
								.populate([
									grid(3)
										.populate([
											cmn.pageGroup
												.el('Page group one', [
													'Page One',
													'Page Two',
													'Page Three',
													'Page Four',
												])
												.css({
													padding: '2rem 0',
												}),
											cmn.pageGroup
												.el('Page group two', [
													'Page Five',
													'Page Six',
													'Page Seven',
													'Page Eight',
												])
												.css({
													padding: '2rem 0',
												}),
											cmn.pageGroup
												.el('Page group two', [
													'Page Nine',
													'Page Ten',
													'Page Eleven',
													'Page Twelve',
												])
												.css({
													padding: '2rem 0',
												}),
										])
										.cssTablet({
											gridTemplateColumns: gridCols(1),
										})
										.tag(tags.pageGroups),
									column([
										txt('Page group four')
											.css({
												fontWeight: '600',
											})
											.tag(tags.textGroups.title),
										textLink('Link one'),
										textLink('Link two'),
										textLink('Link three'),
										textLink('Link four'),
										textLink('Link five'),
									])
										.tag(tags.textGroups.list)
										.css({
											gap: '1rem',
											fontSize: '0.875rem',
											backgroundColor: '#f4f4f4',
											padding: '2rem 5% 2rem 2rem',
										}),
								])
								.css({
									flex: '1',
									gridTemplateColumns: '3fr 1fr',
									padding: '0 0 0 5%',
								})
								.cssTablet({
									gridTemplateColumns: gridCols(1),
								}),
						]).cssTablet({
							flexDirection: 'column',
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

const textLink = (text: string) =>
	link()
		.populate([txt(text).tag(tags.textGroups.text)])
		.tag(tags.textGroups.link)

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
