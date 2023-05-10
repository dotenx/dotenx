import { ActionIcon, Menu } from '@mantine/core'
import { ReactNode } from 'react'
import { TbPlus } from 'react-icons/tb'
import { box, column, flex, icn, img, link, txt } from '../../../elements/constructor'
import { Element } from '../../../elements/element'
import { useSetElement } from '../../../elements/elements-store'
import { BoxElement } from '../../../elements/extensions/box'
import { IconElement } from '../../../elements/extensions/icon'
import { ImageElement } from '../../../elements/extensions/image'
import { LinkElement } from '../../../elements/extensions/link'
import { TextElement } from '../../../elements/extensions/text'
import { useSelectedElement } from '../../../selection/use-selected-component'
import { IconStyler } from '../../../simple/stylers/icon-styler'
import { ImageStyler } from '../../../simple/stylers/image-styler'
import { LinkStyler } from '../../../simple/stylers/link-styler'
import { TextStyler } from '../../../simple/stylers/text-styler'
import { DndTabs } from '../../helpers/dnd-tabs'
import { OptionsWrapper } from '../../helpers/options-wrapper'

const tags = {
	logo: {
		image: 'logo.image',
		link: 'logo.link',
	},
	outlineButton: {
		text: 'outlineButton.text',
		link: 'outlineButton.link',
	},
	filledButton: {
		text: 'filledButton.text',
		link: 'filledButton.link',
	},
	linkList: {
		container: 'linkList.container',
	},
	linkItem: {
		text: 'linkItem.text',
		link: 'linkItem.link',
	},
	linkMenu: {
		text: 'linkMenu.text',
		listContainer: 'linkMenu.listContainer',
	},
	submenuLink: {
		text: 'submenuLink.text',
		link: 'submenuLink.link',
	},
	pageGroup: {
		title: 'pageGroup.title',
		list: 'pageGroup.list',
	},
	menuItem: {
		title: 'menuItem.title',
		text: 'menuItem.text',
		link: 'menuItem.link',
		icon: 'menuItem.icon',
	},
}

const container = (children: Element[]) =>
	box([
		box(children).css({
			paddingLeft: '5%',
			paddingRight: '5%',
			minHeight: '4.5rem',
			borderBottom: '1px solid #000',
			display: 'flex',
			alignItems: 'center',
			position: 'relative',
		}),
	])
		.customCssTablet('> div:hover .menu', {
			visibility: 'visible',
			maxHeight: '100vh',
		})
		.customCssTablet('> div:hover .menu-btn-bars', {
			display: 'none',
		})
		.customCssTablet('> div:hover .menu-btn-times', {
			display: 'block',
		})

const logo = () =>
	link()
		.populate([img('https://files.dotenx.com/assets/Logo10-nmi1.png').tag(tags.logo.image)])
		.href('/')
		.css({
			display: 'flex',
			alignItems: 'center',
		})
		.tag(tags.logo.link)

function LogoOptions() {
	const component = useSelectedElement() as BoxElement
	const image = component.find(tags.logo.image) as ImageElement
	const link = component.find(tags.logo.link) as LinkElement
	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			<LinkStyler label="Logo link" element={link} />
		</OptionsWrapper>
	)
}

const buttons = () =>
	flex([outlineBtn(), fillBtn()])
		.css({
			gap: '1rem',
		})
		.cssTablet({
			flexDirection: 'column',
		})
		.cssTablet({
			margin: '0 1rem',
		})

function ButtonsOptions() {
	return (
		<OptionsWrapper>
			<OutlineBtnOptions />
			<FilledBtnOptions />
		</OptionsWrapper>
	)
}

const outlineBtn = () =>
	link()
		.populate([txt('Button').tag(tags.outlineButton.text)])
		.css({
			border: '1px solid #000',
			padding: '0.5rem 1.25rem',
			display: 'inline-flex',
			justifyContent: 'center',
		})
		.tag(tags.outlineButton.link)

function OutlineBtnOptions() {
	const component = useSelectedElement() as BoxElement
	const text = component.find(tags.outlineButton.text) as TextElement
	const link = component.find(tags.outlineButton.link) as LinkElement
	return (
		<OptionsWrapper>
			<TextStyler label="Outline button text" element={text} />
			<LinkStyler label="Outline button link" element={link} />
		</OptionsWrapper>
	)
}

const fillBtn = () =>
	link()
		.populate([
			txt('Button')
				.css({
					color: 'white',
				})
				.tag(tags.filledButton.text),
		])
		.css({
			border: '1px solid #000',
			padding: '0.5rem 1.25rem',
			display: 'inline-flex',
			backgroundColor: '#000',
			justifyContent: 'center',
		})
		.tag(tags.filledButton.link)

function FilledBtnOptions() {
	const component = useSelectedElement() as BoxElement
	const text = component.find(tags.filledButton.text) as TextElement
	const link = component.find(tags.filledButton.link) as LinkElement
	return (
		<OptionsWrapper>
			<TextStyler label="Filled button text" element={text} />
			<LinkStyler label="Filled button link" element={link} />
		</OptionsWrapper>
	)
}

const linkList = () =>
	flex([
		linkItem('Link One'),
		linkItem('Link Two'),
		linkItem('Link Three'),
		linkMenu('Link Four', [
			linkSubmenu(['Link Five', 'Link Six', 'Link Seven'].map(submenuLink)),
		]),
	])
		.cssTablet({
			flexDirection: 'column',
		})
		.tag(tags.linkList.container)

function LinkListOptions() {
	const set = useSetElement()
	const component = useSelectedElement() as BoxElement
	const container = component.find(tags.linkList.container) as BoxElement
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
									set(container, (draft) => draft.children.push(linkItem('Link')))
								}
							>
								Text Link
							</Menu.Item>
							<Menu.Item
								onClick={() =>
									set(container, (draft) =>
										draft.children.push(
											linkMenu('Link', [
												linkSubmenu(
													['Link', 'Link', 'Link'].map(submenuLink)
												),
											])
										)
									)
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
			<LinkItemOptions root={item} />
			<LinkMenuOptions
				root={item}
				insertElement={() => submenuLink('Link')}
				renderItemOptions={(item) => <SubmenuLinkOptions root={item as BoxElement} />}
			/>
		</OptionsWrapper>
	)
}

const linkItem = (text: string) =>
	link()
		.populate([txt(text).tag(tags.linkItem.text)])
		.href('/')
		.css({
			padding: '1.5rem 1rem',
			color: '#222',
		})
		.cssTablet({
			padding: '0.5rem 1rem',
		})
		.tag(tags.linkItem.link)

function LinkItemOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement() as BoxElement
	const parent = root ?? component
	const text = parent.find(tags.linkItem.text) as TextElement
	const link = parent.find(tags.linkItem.link) as LinkElement
	if (!text || !link) return null
	return (
		<OptionsWrapper>
			<TextStyler label="Text" element={text} />
			<LinkStyler label="Link" element={link} />
		</OptionsWrapper>
	)
}

const linkMenu = (text: string, children: Element[], transitionTop = true) =>
	box([
		box([
			flex([
				txt(text).tag(tags.linkMenu.text),
				icn('chevron-down').size('14px').class('chevron-down').css({
					rotate: '0deg',
					transition: 'all 150ms ease-in-out',
				}),
			])
				.css({
					alignItems: 'center',
					padding: '1.5rem 1rem',
					gap: '0.5rem',
					justifyContent: 'space-between',
				})
				.cssTablet({
					padding: '0.5rem 1rem',
				}),
			box(children).tag(tags.linkMenu.listContainer),
		]).class('submenu-link'),
	])
		.css({
			position: 'relative',
		})
		.customCss('> .submenu-link:hover .chevron-down', {
			rotate: '180deg',
		})
		.customCss('> .submenu-link:hover .submenu', {
			visibility: 'visible',
			opacity: '1',
			top: transitionTop ? 'calc(100% - 1rem)' : undefined,
		})
		.customCssTablet('> .submenu-link:hover .submenu', {
			display: 'block',
			opacity: '1',
		})

function LinkMenuOptions({
	root,
	renderItemOptions,
	insertElement,
}: {
	root?: BoxElement
	renderItemOptions: (item: Element) => ReactNode
	insertElement: () => Element
}) {
	const component = useSelectedElement() as BoxElement
	const parent = root ?? component
	const text = parent.find(tags.linkMenu.text) as TextElement
	const listContainer = parent.find(tags.linkMenu.listContainer)?.children?.[0] as BoxElement
	if (!text) return null
	return (
		<OptionsWrapper>
			<TextStyler label="Text" element={text} />
			<DndTabs
				containerElement={listContainer}
				renderItemOptions={renderItemOptions}
				insertElement={insertElement}
			/>
		</OptionsWrapper>
	)
}

const linkSubmenu = (children: Element[]) =>
	box(children)
		.css({
			visibility: 'hidden',
			position: 'absolute',
			border: '1px solid #000',
			padding: '0.5rem',
			zIndex: '1',
			top: 'calc(100% + 1rem)',
			backgroundColor: 'white',
			width: 'max-content',
			opacity: '0',
			transition: 'all 150ms ease-in-out',
		})
		.cssTablet({
			display: 'none',
			position: 'static',
			border: 'none',
			padding: '0.5rem 1rem',
			opacity: '0',
		})
		.class('submenu')

const submenuLink = (text: string) =>
	link()
		.populate([
			txt(text)
				.css({
					padding: '0.5rem 1rem',
				})
				.tag(tags.submenuLink.text),
		])
		.href('/')
		.tag(tags.submenuLink.link)

function SubmenuLinkOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement() as BoxElement
	const parent = root ?? component
	const text = parent.find(tags.submenuLink.text) as TextElement
	const link = parent.find(tags.submenuLink.link) as LinkElement
	if (!text || !link) return null
	return (
		<OptionsWrapper>
			<TextStyler label="Text" element={text} />
			<LinkStyler label="Link" element={link} />
		</OptionsWrapper>
	)
}

const menuItem = (text: string) =>
	link()
		.populate([
			flex([
				icn('cube').size('20px').tag(tags.menuItem.icon),
				box([
					txt(text)
						.css({
							fontWeight: '600',
						})
						.tag(tags.menuItem.title),
					txt('Lorem ipsum dolor sit amet consectetur adipisicing elit')
						.css({
							fontSize: '0.875rem',
						})
						.tag(tags.menuItem.text),
				]),
			]).css({
				gap: '0.75rem',
			}),
		])
		.href('/')
		.css({
			padding: '0.5rem',
		})
		.tag(tags.menuItem.link)

function MenuItemOptions({ item }: { item: BoxElement }) {
	const title = item.find(tags.menuItem.title) as TextElement
	const text = item.find(tags.menuItem.text) as TextElement
	const link = item.find(tags.menuItem.link) as LinkElement
	const icon = item.find(tags.menuItem.icon) as IconElement
	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Text" element={text} />
			<LinkStyler label="Link" element={link} />
			<IconStyler label="Icon" element={icon} />
		</OptionsWrapper>
	)
}

const pageGroup = (title: string, items: string[]) =>
	column([
		txt(title)
			.css({
				fontWeight: '600',
				fontSize: '0.875rem',
			})
			.tag(tags.pageGroup.title),
		column(items.map(menuItem))
			.css({
				gap: '1rem',
			})
			.tag(tags.pageGroup.list),
	]).css({
		gap: '1rem',
	})

function PageGroupOptions({ item }: { item: BoxElement }) {
	const title = item.find(tags.pageGroup.title) as TextElement
	const list = item.find(tags.pageGroup.list) as BoxElement
	return (
		<OptionsWrapper>
			<TextStyler element={title} label="Title" />
			<DndTabs
				containerElement={list}
				renderItemOptions={(item) => <MenuItemOptions item={item as BoxElement} />}
				insertElement={() => menuItem('Page')}
			/>
		</OptionsWrapper>
	)
}

const menu = (children: Element[]) =>
	flex(children)
		.css({
			gap: '1.5rem',
			alignItems: 'center',
		})
		.cssTablet({
			visibility: 'hidden',
			position: 'absolute',
			left: '0',
			right: '0',
			top: '100%',
			height: 'calc(100vh - 5rem)',
			maxHeight: '0',
			backgroundColor: 'white',
			flexDirection: 'column',
			alignItems: 'stretch',
			zIndex: '1',
			transition: 'all 0.3s ease-in-out',
			borderBottom: '1px solid #000',
			overflowY: 'auto',
		})
		.class('menu')

const menuBtn = () =>
	box([
		icn('bars').size('20px').class('menu-btn-bars'),
		icn('times').size('20px').class('menu-btn-times').css({
			display: 'none',
		}),
	])
		.css({
			display: 'none',
			padding: '0.5rem',
		})
		.cssTablet({
			display: 'block',
		})

export const cmn = {
	container: {
		el: container,
	},
	logo: {
		el: logo,
		Options: LogoOptions,
	},
	buttons: {
		el: buttons,
		Options: ButtonsOptions,
	},
	outlineBtn: {
		el: outlineBtn,
		Options: OutlineBtnOptions,
	},
	fillBtn: {
		el: fillBtn,
		Options: FilledBtnOptions,
	},
	linkList: {
		el: linkList,
		Options: LinkListOptions,
	},
	linkItem: {
		el: linkItem,
		Options: LinkItemOptions,
	},
	linkMenu: {
		el: linkMenu,
		Options: LinkMenuOptions,
	},
	linkSubmenu: {
		el: linkSubmenu,
	},
	submenuLink: {
		el: submenuLink,
		Options: SubmenuLinkOptions,
	},
	menuItem: {
		el: menuItem,
		Options: MenuItemOptions,
	},
	pageGroup: {
		el: pageGroup,
		Options: PageGroupOptions,
	},
	menu: {
		el: menu,
	},
	menuBtn: {
		el: menuBtn,
	},
	tags,
}
