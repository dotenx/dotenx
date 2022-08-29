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
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: { desktop: { backgroundColor: '#eeeeee' }, tablet: {}, mobile: {} },
				},
			}
		case ComponentKind.Button:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							width: '100%',
							borderRadius: '4px',
							backgroundColor: '#2563eb',
							padding: '4px',
							color: '#ffffff',
							fontWeight: '500',
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
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: { gap: '40px', flex: '1 1 0px', display: 'flex', padding: '40px' },
						tablet: {},
						mobile: {},
					},
				},
			}
		case ComponentKind.Image:
			return {
				kind,
				components: [],
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
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							border: '1px solid #cccccc',
							borderRadius: '4px',
							width: '100%',
							padding: '4px',
						},
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
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							border: '1px solid #cccccc',
							borderRadius: '4px',
							width: '100%',
							padding: '4px',
						},
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
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							width: '100%',
							borderRadius: '4px',
							backgroundColor: '#2563eb',
							padding: '4px',
							color: '#ffffff',
							fontWeight: '500',
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
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							border: '1px solid #cccccc',
							borderRadius: '4px',
							width: '100%',
							padding: '4px',
						},
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
				repeatFrom: { name: '', iterator: '' },
				bindings: {},
				events: [],
				id,
				parentId,
				data: {
					style: { desktop: { padding: '40px' }, tablet: {}, mobile: {} },
					dataSourceName: '',
				},
			}
	}
}
