import { uuid } from '../utils'
import { Component, ComponentKind } from './canvas-store'

export const getDefaultComponentState = (
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
								display: 'flex',
								flexWrap: 'wrap',
								gap: '20px',
							},
						},
						tablet: {},
						mobile: {},
					},
					columnWidths: [
						{ id: uuid(), value: 50 },
						{ id: uuid(), value: 50 },
					],
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
							default: { backgroundSize: 'cover', backgroundPosition: 'center' },
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
	}
}
