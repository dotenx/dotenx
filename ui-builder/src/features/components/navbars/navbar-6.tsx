import { ActionIcon, Menu } from '@mantine/core'
import _ from 'lodash'
import { TbPlus } from 'react-icons/tb'
import componentImage from '../../../assets/components/navbar/navbar-6.png'
import { gridCols } from '../../../utils/style-utils'
import { box, column, flex, grid, icn, img, link, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement, useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ImageElement } from '../../elements/extensions/image'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import componentScript from '../../scripts/navbars.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'
import { cmn } from './common/navbar'

export class Navbar6 extends Component {
	name = 'Navbar 6'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

const tags = {
	pageGroups: 'pageGroups',
	featured: {
		title: 'featured.title',
		arrowLink: 'featured.arrowLink',
		arrowLinkText: 'featured.arrowLinkText',
		article: {
			image: 'featured.article.image',
			title: 'featured.article.title',
			text: 'featured.article.text',
			link: 'featured.article.link',
		},
	},
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
			<FeaturedOptions item={item} />
		</OptionsWrapper>
	)
}

function FeaturedOptions({ item }: { item: BoxElement }) {
	const title = item.find(tags.featured.title) as TextElement
	const link = item.find(tags.featured.arrowLink) as LinkElement
	const text = item.find(tags.featured.arrowLinkText) as TextElement
	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<LinkStyler label="Link URL" element={link} />
			<TextStyler label="Link text" element={text} />
			<ArticleOptions item={item as BoxElement} />
		</OptionsWrapper>
	)
}

function ArticleOptions({ item }: { item: BoxElement }) {
	const image = item.find(tags.featured.article.image) as ImageElement
	const title = item.find(tags.featured.article.title) as TextElement
	const text = item.find(tags.featured.article.text) as TextElement
	const link = item.find(tags.featured.article.link) as LinkElement
	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Text" element={text} />
			<LinkStyler label="Link URL" element={link} />
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
							grid(3)
								.populate([
									cmn.pageGroup.el('Page group one', [
										'Page One',
										'Page Two',
										'Page Three',
										'Page Four',
									]),
									cmn.pageGroup.el('Page group two', [
										'Page Five',
										'Page Six',
										'Page Seven',
										'Page Eight',
									]),
									cmn.pageGroup.el('Page group two', [
										'Page Nine',
										'Page Ten',
										'Page Eleven',
										'Page Twelve',
									]),
								])
								.css({
									padding: '2rem 2rem 2rem 0',
									flex: '1',
								})
								.cssTablet({
									gridTemplateColumns: gridCols(1),
								})
								.tag(tags.pageGroups),
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
	column([
		txt('Featured from Blog')
			.css({
				fontSize: '0.875rem',
				fontWeight: '600',
			})
			.tag(tags.featured.title),
		article(),
		arrowLink(),
	]).css({
		backgroundColor: '#f4f4f4',
		maxWidth: '25rem',
		flex: '1',
		padding: '2rem 5% 2rem 2rem',
		gap: '1.5rem',
		alignSelf: 'stretch',
	})

const article = () =>
	box([
		img('https://files.dotenx.com/assets/hero-bg-wva.jpeg').tag(tags.featured.article.image),
		box([
			txt('Article Title')
				.css({
					fontWeight: '600',
					lineHeight: '1.5',
					paddingTop: '0.5rem',
				})
				.tag(tags.featured.article.title),
			txt('Lorem ipsum dolor sit amet, consectetur adipiscing elit')
				.css({
					fontSize: '0.875rem',
					lineHeight: '1.5',
					paddingTop: '0.5rem',
				})
				.tag(tags.featured.article.text),
			link()
				.populate([
					txt('Read more').css({
						fontSize: '0.875rem',
						textDecoration: 'underline',
						lineHeight: '1.5',
						paddingTop: '0.5rem',
					}),
				])
				.tag(tags.featured.article.link),
		]),
	])
		.css({
			gridTemplateColumns: '1fr 2fr',
			gap: '1.5rem',
		})
		.cssTablet({
			gridTemplateColumns: gridCols(1),
		})

const arrowLink = () =>
	link()
		.populate([
			flex([
				txt('See all articles').tag(tags.featured.arrowLinkText),
				icn('chevron-right').size('14px'),
			]).css({
				alignItems: 'center',
				gap: '8px',
			}),
		])
		.tag(tags.featured.arrowLink)
