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
							backgroundColor: '#3b82f6',
							color: 'white',
							border: '0',
							paddingTop: '10px',
							paddingBottom: '10px',
							paddingLeft: '20px',
							paddingRight: '20px',
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
						desktop: { gap: '40px', flex: '1 1 0px', display: 'flex' },
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
						desktop: { backgroundSize: 'cover', backgroundPosition: 'center' },
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
							backgroundColor: '#3b82f6',
							color: 'white',
							border: '0',
							paddingTop: '10px',
							paddingBottom: '10px',
							paddingLeft: '20px',
							paddingRight: '20px',
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
				data: { style: { desktop: {}, tablet: {}, mobile: {} }, text: 'Text' },
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
	}
}
