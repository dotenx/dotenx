import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/navbar-with-cta.png'
import { deserializeElement } from '../../utils/deserialize'
import { useSetElement } from '../elements/elements-store'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { NavMenuElement } from '../elements/extensions/nav/nav-menu'
import { NavbarElement } from '../elements/extensions/nav/navbar'
import { TextElement } from '../elements/extensions/text'
import { navLink } from '../elements/utils'
import { useSelectedElement } from '../selection/use-selected-component'
import { Expression } from '../states/expression'
import { ImageDrop } from '../ui/image-drop'
import { Intelinput } from '../ui/intelinput'
import { Controller } from './controller'
import { ComponentName } from './helpers'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'

export class NavbarWithCTA extends Controller {
	name = 'Navbar with CTA'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <NavbarWithCTAOptions />
	}
}

function NavbarWithCTAOptions() {
	const set = useSetElement()
	const root = useSelectedElement<NavbarElement>()
	const logo = root.children[0].children?.[0] as ImageElement
	const navMenu = root.children[1] as NavMenuElement
	const navMenuItems = navMenu.children as LinkElement[]
	const navCTA = navMenu.children?.[3] as TextElement
	console.log(navCTA)
	const linksTabs: DraggableTab[] = navMenuItems
		.filter((item): item is LinkElement => item instanceof LinkElement)
		.map((link, index) => {
			const text = link.children[0] as TextElement
			return {
				id: link.id,
				content: (
					<div key={index} className="space-y-6">
						<Intelinput
							label="Link URL"
							name="url"
							size="xs"
							value={link.data.href}
							onChange={(value) => set(link, (draft) => (draft.data.href = value))}
						/>
						<Intelinput
							label="Text"
							name="text"
							size="xs"
							value={text.data.text}
							onChange={(value) => set(text, (draft) => (draft.data.text = value))}
						/>
					</div>
				),
				onTabDelete: () => set(navMenu, (draft) => draft.children.splice(index, 1)),
			}
		})

	return (
		<div className="space-y-6">
			<ComponentName name="Navbar with CTA" />

			<ImageDrop
				src={logo.data.src.toString()}
				onChange={(value) =>
					set(logo, (draft) => (draft.data.src = Expression.fromString(value)))
				}
			/>
			{/* <Intelinput
				label="nav"
				name="nav"
				size="xs"
				value={navCTA.data.text}
				onChange={(value) => set(navCTA, (draft) => (draft.data.text = value))}
			/>
			 */}
			<DraggableTabs
				tabs={linksTabs}
				onDragEnd={(event) => {
					const { active, over } = event
					if (active.id !== over?.id) {
						const oldIndex = linksTabs.findIndex((tab) => tab.id === active?.id)
						const newIndex = linksTabs.findIndex((tab) => tab.id === over?.id)
						set(navMenu, (draft) => {
							const temp = draft.children![oldIndex]
							draft.children![oldIndex] = draft.children![newIndex]
							draft.children![newIndex] = temp
						})
					}
				}}
				onAddNewTab={() => {
					set(navMenu, (draft) => {
						draft.children.push(navLink())
					})
				}}
			/>
		</div>
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
				{
					kind: 'Button',
					id: 'BvvQgLHTyvMNXcyt',
					classNames: [],
					repeatFrom: null,
					events: [],
					bindings: {},
					data: {
						text: 'Get Started',
						style: {
							desktop: {
								default: {
									'background-color': ' rgb(14 165 233)',
									color: 'white',
									'padding-top': '10px',
									'padding-bottom': '10px',
									'padding-left': '20px',
									'padding-right': '20px',
									display: 'inline-block',
									'text-align': 'center',
									'font-weight': 600,
									cursor: 'pointer',
									'border-radius': '10px',
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
