import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/navbar.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { NavMenuElement } from '../elements/extensions/nav/nav-menu'
import { NavbarElement } from '../elements/extensions/nav/navbar'
import { TextElement } from '../elements/extensions/text'
import { navLink } from '../elements/utils'
import { useSelectedElement } from '../selection/use-selected-component'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class Navbar extends Component {
	name = 'Navbar'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <NavbarOptions />
	}
}

function NavbarOptions() {
	const root = useSelectedElement<NavbarElement>()!
	const logo = root.children[0].children?.[0] as ImageElement
	const navMenu = root.children[1] as NavMenuElement

	return (
		<ComponentWrapper name="Navbar">
			<ImageStyler element={logo} />
			<DndTabs
				containerElement={navMenu}
				insertElement={navLink}
				renderItemOptions={(item) => <ItemOptions item={item} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const link = item as LinkElement
	const text = link.children[0] as TextElement

	return (
		<OptionsWrapper>
			<LinkStyler label="Link URL" element={link} />
			<TextStyler label="Text" element={text} />
		</OptionsWrapper>
	)
}

export const createNavLink = (options: { href: string; text: string }) => {
	return produce(navLink(), (draft) => {
		draft.data.href = Expression.fromString(options.href)
		const text = draft.children[0] as TextElement
		text.data.text = Expression.fromString(options.text)
	}).serialize()
}

const defaultData = {
	kind: 'Navbar',
	id: 'TpQTeDDSRkskXWOT',
	components: [
		{
			kind: 'Box',
			id: 'XijwyiSkiZfpsXHt',
			components: [
				{
					kind: 'Image',
					id: 'lUsJS_MgHSMESrWt',
					classNames: [],
					repeatFrom: null,
					events: [],
					bindings: {},
					data: {
						alt: '',
						src: 'https://files.dotenx.com/assets/logo1-fwe14we.png',
						style: {
							desktop: {
								default: {
									maxWidth: '200px',
									height: 'auto',
								},
							},
						},
					},
				},
			],
			classNames: [],
			repeatFrom: null,
			events: [],
			bindings: {},
			data: {
				style: {
					desktop: {
						default: {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						},
					},
				},
			},
		},
		{
			kind: 'NavMenu',
			id: 'uFYBRRddGliPPqcN',
			components: [
				produce(navLink(), (draft) => {
					draft.data.href = Expression.fromString('/home')
					const text = draft.children[0] as TextElement
					text.data.text = Expression.fromString('Home')
				}).serialize(),
				produce(navLink(), (draft) => {
					draft.data.href = Expression.fromString('/about')
					const text = draft.children[0] as TextElement
					text.data.text = Expression.fromString('About')
				}).serialize(),
				produce(navLink(), (draft) => {
					draft.data.href = Expression.fromString('/blog')
					const text = draft.children[0] as TextElement
					text.data.text = Expression.fromString('Blog')
				}).serialize(),
			],
			classNames: [],
			repeatFrom: null,
			events: [],
			bindings: {},
			data: {
				style: {
					desktop: {
						default: {
							display: 'flex',
							rowGap: '20px',
							columnGap: '20px',
							alignItems: 'center',
							marginRight: '0px',
						},
					},
					tablet: {
						default: {
							top: '100%',
							left: 0,
							right: 0,
							display: 'none',
							zIndex: 100,
							position: 'absolute',
							paddingTop: '20px',
							flexDirection: 'column',
							paddingBottom: '20px',
							backgroundColor: '#eeeeee',
						},
					},
				},
			},
		},
		{
			kind: 'MenuButton',
			id: 'bsEBEgTjGkzmONtu',
			components: [
				{
					kind: 'Icon',
					id: 'qEWHtYshuRUPABuv',
					components: [],
					classNames: [],
					repeatFrom: null,
					events: [],
					bindings: {},
					data: {
						name: 'bars',
						type: 'fas',
						style: {
							desktop: {
								default: {
									color: '#333333',
									width: '20px',
									height: '20px',
								},
							},
						},
					},
				},
			],
			classNames: [],
			repeatFrom: null,
			events: [],
			bindings: {},
			data: {
				style: {
					desktop: {
						default: {
							display: 'none',
							paddingTop: '20px',
							paddingLeft: '20px',
							paddingRight: '20px',
							paddingBottom: '20px',
						},
					},
					tablet: { default: { display: 'flex' } },
				},
				menuId: 'uFYBRRddGliPPqcN',
			},
		},
	],
	classNames: [],
	repeatFrom: null,
	events: [],
	bindings: {},
	data: {
		style: {
			desktop: {
				default: {
					display: 'flex',
					position: 'relative',
					boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingLeft: '30px',
					paddingRight: '30px',
					minHeight: '80px',
				},
			},
			tablet: {
				default: {
					paddingLeft: '20px',
					paddingRight: '20px',
					minHeight: '60px',
				},
			},
			mobile: {
				default: {
					paddingLeft: '15px',
					paddingRight: '15px',
					minHeight: '50px',
				},
			},
		},
	},
}
