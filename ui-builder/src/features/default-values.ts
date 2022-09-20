import { uuid } from '../utils'
import { Component, ComponentKind, MenuButtonComponent, TextComponent } from './canvas-store'

export const getDefaultComponent = (
	kind: ComponentKind,
	id: string,
	parentId: string
): Component => {
	switch (kind) {
		case ComponentKind.Box:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {},
						tablet: {},
						mobile: {},
					},
				},
			}
		case ComponentKind.Button:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							default: {
								backgroundColor: '#3b82f6',
								color: 'white',
								border: '0',
								paddingTop: '10px',
								paddingBottom: '10px',
								paddingLeft: '20px',
								paddingRight: '20px',
								display: 'inline-block',
								textAlign: 'center',
								fontWeight: 600,
							},
						},
						tablet: {},
						mobile: {},
					},
					text: 'Button',
				},
			}
		case ComponentKind.Columns:
			return {
				kind,
				components: [
					getDefaultComponent(ComponentKind.Box, uuid(), id),
					getDefaultComponent(ComponentKind.Box, uuid(), id),
				],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							default: {
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '10px',
							},
						},
						tablet: {},
						mobile: {},
					},
				},
			}
		case ComponentKind.Image:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							default: {
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								width: '100%',
							},
						},
						tablet: {},
						mobile: {},
					},
					src: null,
					alt: '',
				},
			}
		case ComponentKind.Input:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {},
						tablet: {},
						mobile: {},
					},
					defaultValue: '',
					name: '',
					placeholder: '',
					required: false,
					type: 'text',
					value: '',
				},
			}
		case ComponentKind.Select:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {},
						tablet: {},
						mobile: {},
					},
					options: [],
					defaultValue: '',
					name: '',
					required: false,
					value: '',
				},
			}
		case ComponentKind.SubmitButton:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							default: {
								backgroundColor: '#3b82f6',
								color: 'white',
								border: '0',
								paddingTop: '10px',
								paddingBottom: '10px',
								paddingLeft: '20px',
								paddingRight: '20px',
								display: 'inline-block',
								textAlign: 'center',
								fontWeight: 600,
							},
						},
						tablet: {},
						mobile: {},
					},
					text: 'Submit Button',
				},
			}
		case ComponentKind.Text:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							default: {
								fontSize: '1rem',
							},
						},
						tablet: {},
						mobile: {},
					},
					text: 'Text',
				},
			}
		case ComponentKind.Textarea:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {},
						tablet: {},
						mobile: {},
					},
					placeholder: '',
					value: '',
					defaultValue: '',
					required: false,
					name: '',
				},
			}
		case ComponentKind.Form:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: { desktop: {}, tablet: {}, mobile: {} },
					dataSourceName: '',
				},
			}
		case ComponentKind.Link:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: { desktop: {}, tablet: {}, mobile: {} },
					href: '',
					openInNewTab: false,
				},
			}
		case ComponentKind.Stack:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							default: { display: 'flex', flexDirection: 'column', gap: '10px' },
						},
						tablet: {},
						mobile: {},
					},
				},
			}
		case ComponentKind.Divider:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							default: {
								marginTop: '10px',
								marginBottom: '10px',
								height: '1px',
								backgroundColor: '#999999',
							},
						},
						tablet: {},
						mobile: {},
					},
				},
			}
		case ComponentKind.NavMenu:
			return {
				kind,
				components: [
					getNavMenuItem(id, 'Home'),
					getNavMenuItem(id, 'About'),
					getNavMenuItem(id, 'Contact'),
				],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							default: {
								display: 'flex',
							},
						},
						tablet: {
							default: {
								display: 'none',
								position: 'absolute',
								top: '100%',
								backgroundColor: '#eeeeee',
								left: 0,
								right: 0,
								zIndex: 100,
								flexDirection: 'column',
							},
						},
						mobile: {},
					},
				},
			}
		case ComponentKind.Navbar:
			return {
				kind,
				components: getNavbarChildren(id),
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							default: {
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								position: 'relative',
							},
						},
						tablet: {},
						mobile: {},
					},
				},
			}
		case ComponentKind.MenuButton:
			return {
				kind,
				components: [],
				classNames: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
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
						mobile: {},
					},
					text: 'Menu',
					menuId: '',
				},
			}
	}
}

const getNavbarChildren = (parentId: string) => {
	const navMenu = getDefaultComponent(ComponentKind.NavMenu, uuid(), parentId)

	return [
		getDefaultComponent(ComponentKind.Box, uuid(), parentId),
		navMenu,
		getMenuButton(parentId, navMenu.id),
	]
}

const getNavMenuItem = (parentId: string, text: string): Component => {
	const id = uuid()
	return {
		...getDefaultComponent(ComponentKind.Link, id, parentId),
		components: [
			{
				...(getDefaultComponent(ComponentKind.Text, uuid(), id) as TextComponent),
				data: {
					style: {
						desktop: {
							default: {
								paddingTop: '20px',
								paddingBottom: '20px',
								paddingRight: '20px',
								paddingLeft: '20px',
							},
						},
						tablet: {},
						mobile: {},
					},
					text,
				},
			},
		],
	}
}

const getMenuButton = (parentId: string, menuId: string) => {
	const component = getDefaultComponent(
		ComponentKind.MenuButton,
		uuid(),
		parentId
	) as MenuButtonComponent
	return { ...component, data: { ...component.data, menuId } }
}
