import { ActionIcon, Menu } from '@mantine/core'
import { times } from 'lodash'
import { TbPlus } from 'react-icons/tb'
import componentImage from '../../../assets/components/navbar/navbar-10.png'
import { gridCols } from '../../../utils/style-utils'
import { box, column, flex, grid, img, link, txt } from '../../elements/constructor'
import { useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ImageElement } from '../../elements/extensions/image'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'
import { cmn } from './common/navbar'

const tags = {
	article: {
		list: 'article.list',
		image: 'article.image',
		title: 'article.title',
		text: 'article.text',
		link: 'article.link',
	},
	textGroups: {
		title: 'textGroups.title',
		list: 'textGroups.list',
		link: 'textGroups.link',
		text: 'textGroups.text',
	},
}

export class Navbar10 extends Component {
	name = 'Navbar 10'
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
	const textGroup = item.find(tags.textGroups.list) as BoxElement
	if (!textGroup) return null
	return (
		<OptionsWrapper>
			<TextGroupOptions item={item} />
			<ArticlesOptions item={item} />
		</OptionsWrapper>
	)
}

function ArticlesOptions({ item }: { item: BoxElement }) {
	const articles = item.find(tags.article.list) as BoxElement
	return (
		<OptionsWrapper>
			<DndTabs
				containerElement={articles}
				renderItemOptions={(item) => <ArticleOptions item={item as BoxElement} />}
				insertElement={() => article()}
			/>
		</OptionsWrapper>
	)
}

function ArticleOptions({ item }: { item: BoxElement }) {
	const image = item.find(tags.article.image) as ImageElement
	const title = item.find(tags.article.title) as TextElement
	const text = item.find(tags.article.text) as TextElement
	const link = item.find(tags.article.link) as LinkElement
	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Text" element={text} />
			<LinkStyler label="Link URL" element={link} />
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
	console.log(item)
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
							column([
								txt('Blog categories')
									.css({
										fontWeight: '600',
										fontSize: '0.875rem',
									})
									.tag(tags.textGroups.title),
								column([
									textLink('Category one'),
									textLink('Category two'),
									textLink('Category three'),
									textLink('Category four'),
									textLink('Category five'),
								])
									.css({
										gap: '1rem',
									})
									.tag(tags.textGroups.list),
							]).css({
								maxWidth: '15rem',
								flex: '1',
								gap: '1rem',
								paddingTop: '2rem',
							}),
							featured(),
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
						paddingLeft: '5%',
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

const featured = () =>
	column([articles()]).css({
		flex: '1',
		padding: '2rem 5% 2rem 2rem',
		gap: '1.5rem',
		alignSelf: 'stretch',
	})

const articles = () =>
	grid(2)
		.populate(times(6, article))
		.css({
			gap: '1rem',
		})
		.cssTablet({
			gridTemplateColumns: gridCols(1),
		})
		.tag(tags.article.list)

const article = () =>
	grid(2)
		.populate([
			img('https://files.dotenx.com/assets/hero-bg-wva.jpeg').tag(tags.article.image),
			box([
				txt('Article Title')
					.css({
						fontWeight: '600',
						lineHeight: '1.5',
						paddingTop: '0.5rem',
					})
					.tag(tags.article.title),
				txt('Lorem ipsum dolor sit amet, consectetur adipiscing elit')
					.css({
						fontSize: '0.875rem',
						lineHeight: '1.5',
						paddingTop: '0.5rem',
					})
					.tag(tags.article.text),
				link()
					.populate([
						txt('Read more').css({
							fontSize: '0.875rem',
							textDecoration: 'underline',
							lineHeight: '1.5',
							paddingTop: '0.5rem',
						}),
					])
					.tag(tags.article.link),
			]),
		])
		.css({
			gridTemplateColumns: '1fr 2fr',
			gap: '1.5rem',
		})
		.cssTablet({
			gridTemplateColumns: gridCols(1),
		})
