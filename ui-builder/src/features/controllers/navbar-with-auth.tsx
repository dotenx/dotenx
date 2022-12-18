import { deserializeElement } from '../../utils/deserialize'
import { createNavLink, Navbar } from './navbar'

export class NavbarWithAuth extends Navbar {
	name = 'Navbar with auth'
	defaultData = deserializeElement(defaultData)
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
				createNavLink({ href: '/home', text: 'Home' }),
				createNavLink({ href: '/about', text: 'About' }),
				createNavLink({ href: '/blog', text: 'Blog' }),
				{
					kind: 'Button',
					id: 'BvvQgLHTyvMNXcyt',
					classNames: [],
					repeatFrom: null,
					events: [],
					bindings: {},
					data: {
						text: 'SIGN UP',
						style: {
							desktop: {
								default: {
									'background-color': 'hsla(0, 0%, 25%, 1)',
									color: 'white',
									border: '0',
									'padding-top': '10px',
									'padding-bottom': '10px',
									'padding-left': '20px',
									'padding-right': '20px',
									display: 'inline-block',
									'text-align': 'center',
									'font-weight': 600,
									cursor: 'pointer',
									'border-radius': '10px',
									'border-style': 'solid',
									'border-width': '2px',
									'border-color': 'hsla(0, 0%, 25%, 1)',
								},
							},
						},
					},
				},
				{
					kind: 'Button',
					id: 'BvvQgLHTyvMNXcyt',
					classNames: [],
					repeatFrom: null,
					events: [],
					bindings: {},
					data: {
						text: 'SIGN IN',
						style: {
							desktop: {
								default: {
									'background-color': 'hsla(0, 0%, 100%, 1)',
									color: 'hsla(0, 0%, 25%, 1)',
									border: '0',
									'padding-top': '10px',
									'padding-bottom': '10px',
									'padding-left': '20px',
									'padding-right': '20px',
									display: 'inline-block',
									'text-align': 'center',
									'font-weight': 600,
									cursor: 'pointer',
									'border-radius': '10px',
									'border-style': 'solid',
									'border-width': '2px',
									'border-color': 'hsla(0, 0%, 25%, 1)',
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
