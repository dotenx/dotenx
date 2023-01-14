import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/navbar-with-cta.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ButtonElement } from '../elements/extensions/button'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { NavMenuElement } from '../elements/extensions/nav/nav-menu'
import { NavbarElement } from '../elements/extensions/nav/navbar'
import { TextElement } from '../elements/extensions/text'
import { navLink } from '../elements/utils'
import { useSelectedElement } from '../selection/use-selected-component'
import { Expression } from '../states/expression'
import { ImageElementInput } from '../ui/image-element-input'
import { LinkElementInput } from '../ui/link-element-input'
import { TextElementInput } from '../ui/text-element-input'
import { Controller } from './controller'
import { ComponentName } from './helpers'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class NavbarWithCTA extends Controller {
	name = 'Navbar with CTA'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <NavbarWithCTAOptions />
	}
}

function NavbarWithCTAOptions() {
	const root = useSelectedElement<NavbarElement>()!
	const logo = root.children[0].children?.[0] as ImageElement
	const navMenu = root.children[1] as NavMenuElement

	return (
		<OptionsWrapper>
			<ComponentName name="Navbar with CTA" />
			<ImageElementInput element={logo} />
			<DndTabs
				containerElement={navMenu}
				insertElement={navLink}
				renderItemOptions={(item) => <ItemOptions item={item} />}
			/>
		</OptionsWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const link = item as LinkElement
	console.log(link)
	const text = link.children[0] as TextElement

	return (
		<OptionsWrapper>
			<LinkElementInput label="Link URL" element={link} />
			<TextElementInput label="Text" element={text} />
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
						src: 'https://files.dotenx.com/d924aaa8-245a-425b-bffa-f7d34023dcaf.png',
						style: {
							desktop: {
								default: {
									width: '200px',
									height: '80px',
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
						default: { 'min-width': '100px', 'min-height': '60px' },
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
				produce(new BoxElement(), (draft) => {
					const btn = new ButtonElement()
					btn.data.text = 'Get Started'
					btn.style.desktop = {
						default: {
							backgroundColor: ' rgb(14 165 233)',
							color: 'white',
							paddingTop: '10px',
							paddingBottom: '10px',
							paddingLeft: '20px',
							paddingRight: '20px',
							display: 'inline-block',
							textAlign: 'center',
							fontWeight: 600,
							cursor: 'pointer',
							borderRadius: '10px',
						},
					}
					draft.children = [btn]
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
							'row-gap': '20px',
							'column-gap': '20px',
							'align-items': 'center',
							'margin-right': '0px',
						},
					},
					tablet: {
						default: {
							top: '100%',
							left: 0,
							right: 0,
							display: 'none',
							'z-index': 100,
							position: 'absolute',
							'padding-top': '20px',
							'flex-direction': 'column',
							'padding-bottom': '20px',
							'background-color': '#eeeeee',
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
							'padding-top': '20px',
							'padding-left': '20px',
							'padding-right': '20px',
							'padding-bottom': '20px',
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
					'box-shadow':
						'0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
					'align-items': 'center',
					'justify-content': 'space-between',
					'padding-left': '30px',
					'padding-right': '30px',
				},
			},
		},
	},
}
