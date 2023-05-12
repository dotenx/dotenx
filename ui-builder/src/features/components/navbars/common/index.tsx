import { ActionIcon, Menu } from '@mantine/core'
import { TbPlus } from 'react-icons/tb'
import { box, icn, img, link, paper, txt } from '../../../elements/constructor'
import { Element } from '../../../elements/element'
import { useSetElement } from '../../../elements/elements-store'
import { BoxElement } from '../../../elements/extensions/box'
import { ImageElement } from '../../../elements/extensions/image'
import { LinkElement } from '../../../elements/extensions/link'
import { TextElement } from '../../../elements/extensions/text'
import { useSelectedElement } from '../../../selection/use-selected-component'
import { color } from '../../../simple/palette'
import { ImageStyler } from '../../../simple/stylers/image-styler'
import { LinkStyler } from '../../../simple/stylers/link-styler'
import { TextStyler } from '../../../simple/stylers/text-styler'
import { repeatObject } from '../../helpers'
import { DndTabs } from '../../helpers/dnd-tabs'
import { OptionsWrapper } from '../../helpers/options-wrapper'

const tags = {
	cta1: 'cta1',
	cta1Text: 'cta1Text',
	cta2: 'cta2',
	cta2Text: 'cta2Text',
	links: 'links',
	link: 'link',
	linkText: 'linkText',
	submenu: 'submenu',
	logoImage: 'logoImage',
	logoLink: 'logoLink',
}

// #region buttons
const cta1 = link()
	.href('#')
	.css({
		backgroundColor: 'hsla(0, 0%, 0%, 1)',
		border: 'none',
		borderRadius: '10px',
		textAlign: 'center',
		textDecoration: 'none',
		cursor: 'pointer',
		whiteSpace: 'nowrap',
		display: 'block',
		order: '2',
		color: 'hsla(0, 0%, 100%, 1)',
		fontSize: '1rem',
		paddingTop: '8px',
		paddingBottom: '8px',
		paddingLeft: '24px',
		paddingRight: '24px',
	})
	.cssTablet({
		justifySelf: 'center',
		paddingLeft: '15px',
		paddingRight: '15px',
	})
	.cssMobile({
		borderRadius: '0px',
	})
	.populate([txt('Button1').tag(tags.cta1Text)])
	.tag(tags.cta1)

const cta2 = link()
	.href('#')
	.css({
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: 'hsla(0, 0%, 0%, 1)',
		borderRadius: '10px',
		textAlign: 'center',
		textDecoration: 'none',
		cursor: 'pointer',
		whiteSpace: 'nowrap',
		display: 'block',
		order: '2',
		color: 'hsla(0, 0%, 0%, 1)',
		fontSize: '1rem',
		paddingTop: '8px',
		paddingBottom: '8px',
		paddingLeft: '24px',
		paddingRight: '24px',
	})
	.cssTablet({
		justifySelf: 'center',
		paddingLeft: '15px',
		paddingRight: '15px',
	})
	.cssMobile({
		borderRadius: '0px',
	})
	.populate([txt('Button2').css({}).tag(tags.cta2Text)])
	.tag(tags.cta2)

const buttons = box([cta1, cta2])
	.css({
		display: 'flex',
		order: '2',
		justifyContent: 'flex-end',
		columnGap: '10px',
		alignItems: 'center',
	})
	.cssTablet({
		order: '1',
		marginLeft: 'auto',
		marginRight: 'auto',
	})
	.cssMobile({
		order: '2',
		display: 'none',
		alignItems: 'stretch',
		rowGap: '10px',
	})
	.class('buttons')

function ButtonsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const cta1 = component.find<LinkElement>(tags.cta1)!
	const cta1Text = component.find<TextElement>(tags.cta1Text)!
	const cta2 = component.find<LinkElement>(tags.cta2)!
	const cta2Text = component.find<TextElement>(tags.cta2Text)!
	return (
		<>
			<TextStyler textOnly label="CTA-1" element={cta1Text} />
			<LinkStyler label="CTA-1 Link" element={cta1} />
			<TextStyler textOnly label="CTA-2" element={cta2Text} />
			<LinkStyler label="CTA-2 Link" element={cta2} />
		</>
	)
}

// #endregion

// #region links

const submenuLink = () =>
	link()
		.tag(tags.link)
		.href('#')
		.css({
			padding: '15px',
			textDecoration: 'none',
		})
		.populate([txt('Submenu').tag(tags.linkText)])

const defaultSubmenu = box(repeatObject(submenuLink(), 4))
	.as('ul')
	.tag(tags.submenu)
	.class('submenu')
	.css({
		height: '0',
		width: '0',
		visibility: 'hidden',
		overflow: 'hidden',
		transform: 'translateY(20px)',
		display: 'block', // If we set this to none the transition effect won't work. Stupid HTML!
		padding: '0px 10px',
		margin: '0px',
	})

const tagHeadingDetails = () =>
	link()
		.css({
			display: 'flex',
			gap: '0.75rem',
		})
		.populate([
			icn('circle').size('16px'),
			box([
				txt('Link')
					.tag(tags.linkText)
					.css({ fontSize: '1rem', fontWeight: 'bold', lineHeight: '1.5' }),
				txt('Lorem ipsum dolor sit amet, consectetur adipiscing elit.').css({
					fontSize: '1rem',
					lineHeight: '1.5',
				}),
			]).css({
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'stretch',
				width: '100%',
				flex: '1',
			}),
		])

const tagHeadingDetailsColumn = () =>
	box([
		txt('Heading').css({
			fontSize: '1rem',
		}),
		...repeatObject(tagHeadingDetails(), 4),
	])
		.css({
			minWidth: '20rem',
			rowGap: '0.5rem',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'stretch',
		})
		.cssMobile({
			minWidth: 'auto',
		})

const multiColumnSubmenu1 = box(repeatObject(tagHeadingDetailsColumn(), 2))
	.as('ul')
	.tag(tags.submenu)
	.class('submenu')
	.css({
		height: '0',
		width: '0',
		visibility: 'hidden',
		overflow: 'hidden',
		transform: 'translateY(20px)',
		display: 'grid', // If we set this to none the transition effect won't work. Stupid HTML!
		gridTemplateColumns: '1fr 1fr',
		gap: '1rem',
		padding: '0px 10px',
		margin: '0px',
	})

const defaultSubmenuOptions = ({ submenu }: { submenu: BoxElement }) => {
	return (
		<>
			<div className="w-full mt-4">Submenu</div>
			<DndTabs
				containerElement={submenu}
				insertElement={submenuLink}
				renderItemOptions={(item) => <SubmenuItemOptions item={item as LinkElement} />}
			/>
		</>
	)
}

const item = (text: string, submenu: BoxElement, hasSubmenu = false) => {
	const children: Element[] = [
		link()
			.href('#')
			.tag(tags.link)
			.css({
				textDecoration: 'none',
				padding: '15px 5px',
				display: 'block',
			})
			.populate([
				txt(text).tag(tags.linkText).as('span').css({
					display: 'inline',
				}),
			]),
	]
	if (hasSubmenu) {
		children.push(submenu)
	}

	const itemClasses = ['item']
	if (hasSubmenu) {
		itemClasses.push('has-submenu')
	}

	return box(children)
		.as('li')
		.class(itemClasses)
		.css({
			position: 'relative',
			display: 'block',
			padding: '10px',
		})
		.cssTablet({
			width: '100%',
			textAlign: 'center',
			display: 'none',
		})
}

const navbarItems = (submenu: BoxElement) =>
	box([
		item('Link', submenu),
		item('Link', submenu),
		item('Link', submenu),
		item('Link', submenu, true),
	])
		.class('navbar_items')
		.css({
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			height: '100%',
			marginLeft: 'auto',
			marginRight: 'auto',
			order: '1',
		})
		.cssTablet({
			order: '4',
			width: '100%',
			display: 'none',
		})
		.tag(tags.links)

function LinksOptions({
	submenu,
	submenuOptions,
}: {
	submenu: BoxElement
	submenuOptions: ({ submenu }: { submenu: BoxElement }) => JSX.Element
}) {
	const component = useSelectedElement<BoxElement>()!
	const set = useSetElement()
	const links = component.find<BoxElement>(tags.links)!

	return (
		<DndTabs
			containerElement={links}
			insertElement={() => item('Link', submenu)}
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
								set(links, (draft) => draft.children.push(item('Link', submenu)))
							}
						>
							Link
						</Menu.Item>
						<Menu.Item
							onClick={() =>
								set(links, (draft) =>
									draft.children.push(item('Link', submenu, true))
								)
							}
						>
							Link & Submenu
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			}
			renderItemOptions={(item) => (
				<ItemOptions item={item as BoxElement} SubmenuOptions={submenuOptions} />
			)}
		/>
	)
}

function ItemOptions({
	item,
	SubmenuOptions,
}: {
	item: BoxElement
	SubmenuOptions: ({ submenu }: { submenu: BoxElement }) => JSX.Element
}) {
	const link = item.find<LinkElement>(tags.link)!
	const text = link.find<TextElement>(tags.linkText)!
	const submenu = item.find<BoxElement>(tags.submenu)

	return (
		<OptionsWrapper>
			<LinkStyler linkOnly element={link} label="Link address" />
			<TextStyler textOnly element={text} label="Link text" />
			{submenu && <SubmenuOptions submenu={submenu} />}
		</OptionsWrapper>
	)
}

function SubmenuItemOptions({ item }: { item: LinkElement }) {
	const text = item.find<TextElement>(tags.linkText)!

	return (
		<OptionsWrapper>
			<LinkStyler linkOnly element={item} label="Link address" />
			<TextStyler textOnly element={text} label="Link text" />
		</OptionsWrapper>
	)
}
// #endregion

// #region logo
const logo = box([
	link()
		.href('/index.html')
		.tag(tags.logoLink)
		.populate([img('https://files.dotenx.com/assets/logo1-fwe14we.png').tag(tags.logoImage)]),
])
	.as('li')
	.css({
		padding: '7.5px 0px',
		textDecoration: 'none',
		whiteSpace: 'nowrap',
		order: '0',
	})

function LogoOptions() {
	const component = useSelectedElement<BoxElement>()!
	const logoLink = component.find<LinkElement>(tags.logoLink)!
	const logoImage = component.find<ImageElement>(tags.logoImage)!
	return (
		<>
			<LinkStyler linkOnly element={logoLink} label="Logo's link" />
			<ImageStyler element={logoImage} />
		</>
	)
}

// #endregion

// #region nav

const nav = (elements: Element[]) =>
	paper([
		box(elements)
			.as('ul')
			.class('menu')
			.css({
				padding: '0px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				flexWrap: 'nowrap',
				listStyleType: 'none',
			})
			.cssTablet({
				flexWrap: 'wrap',
				alignItems: 'center',
				justifyContent: 'center',
			})
			.cssMobile({
				justifyContent: 'space-between',
				alignItems: 'center',
			}),
	])
		.as('nav')
		.css({
			paddingTop: '10px',
			paddingBottom: '10px',
			paddingLeft: '5%',
			paddingRight: '5%',
			width: '100%',
			fontSize: '1rem',
			color: color('text'),
		})
		.cssTablet({
			fontSize: '1.125rem',
		})
		.customCss('.submenu-active .submenu', {
			height: 'auto',
			width: 'auto',
			visibility: 'visible',
			transform: 'translateY(0px)',
			transition: 'transform 0.2s cubic-bezier(0.35, -0.9, 0.13, 1.59)',
			display: 'block',
			position: 'absolute',
			left: '0',
			top: '68px',
		})
		.customCss('.has-submenu > a::after', {
			fontFamily: "'Font Awesome 5 Free'",
			fontSize: '12px',
			lineHeight: '16px',
			fontWeight: '900',
			content: "'\\f078'",
			display: 'inline-block',
			color: 'black',
			paddingLeft: '2px',
			paddingRight: '2px',
		})
		.customCss('.has-submenu.submenu-active > a::after', {
			transform: 'rotate(-180deg) !important',
			transition: 'transform 0.2s ease-in-out',
		})
		.customCssTablet('.submenu-active .submenu', {
			position: 'static',
		})
		.customCssTablet('.active .item', {
			display: 'block',
		})
		.customCssTablet('.active .navbar_items', {
			display: 'block',
		})
		.customCssMobile('.active .buttons', {
			width: '100%',
			textAlign: 'center',
			display: 'flex',
			flexDirection: 'column',
			rowGap: '10px',
			paddingTop: '20px',
		})

// #endregion

// #region toggle

const toggle = box([
	link()
		.href('#')
		.class('toggle')
		.populate([icn('bars').size('20px')])
		.css({
			textDecoration: 'none',
		}),
])
	.css({
		display: 'none',
	})
	.cssTablet({
		display: 'block',
		textAlign: 'right',
		order: '3',
	})
	.cssMobile({
		order: '1',
	})

// #endregion

export const cmn = {
	buttons: {
		el: buttons,
		Options: ButtonsOptions,
	},
	links: {
		el: navbarItems,
		Options: LinksOptions,
	},
	logo: {
		el: logo,
		Options: LogoOptions,
	},
	nav: {
		el: nav,
	},
	toggle: {
		el: toggle,
	},
	submenus: {
		default: {
			el: defaultSubmenu,
			Options: defaultSubmenuOptions,
		},
		multiColumnSubmenu1: {
			el: multiColumnSubmenu1,
			Options: defaultSubmenuOptions,
		},
	},
}
