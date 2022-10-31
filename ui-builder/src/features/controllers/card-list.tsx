import { Select } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import imageUrl from '../../assets/components/card-list.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { useAddDataSource } from '../data-bindings/data-source-form'
import { HttpMethod } from '../data-bindings/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { ColumnsElement } from '../elements/extensions/columns'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { projectTagAtom } from '../page/top-bar'
import { useSelectedElement } from '../selection/use-selected-component'
import { inteliState, inteliText } from '../ui/intelinput'
import { Controller } from './controller'
import { TableSelect, useColumnsQuery } from './create-form'
import { ComponentName } from './helpers'

export class CardList extends Controller {
	name = 'Card List'
	image = imageUrl
	defaultData = deserializeElement(defaultData)
	data: { tableName: string | null } = { tableName: null }

	renderOptions() {
		return <CardListOptions controller={this} />
	}
}

function CardListOptions({ controller }: { controller: CardList }) {
	const columnsElement = useSelectedElement() as ColumnsElement
	const titleElement = columnsElement.children?.[0].children?.[0].children?.[0]
		.children?.[0] as TextElement
	const nameElement = columnsElement.children?.[0].children?.[1] as TextElement
	const set = useElementsStore((store) => store.set)
	const [selectedTable, setSelectedTable] = useInputState(controller.data.tableName)
	const dataSourceName = `${selectedTable}s`
	const { addDataSource } = useAddDataSource({ mode: 'add' })
	const projectTag = useAtomValue(projectTagAtom)
	const columnsQuery = useColumnsQuery({
		tableName: selectedTable,
		onSuccess: () => {
			if (!selectedTable) return
			addDataSource({
				body: JSON.stringify({ columns: [] }),
				fetchOnload: true,
				headers: '',
				method: HttpMethod.Post,
				stateName: dataSourceName,
				url: inteliText(
					`https://api.dotenx.com/database/query/select/project/${projectTag}/table/${selectedTable}`
				),
				isPrivate: true,
			})
			controller.data.tableName = selectedTable
		},
	})
	const columns = columnsQuery.data?.data.columns.map((col) => col.name) ?? []
	const titleFrom = _.last(titleElement.data.text[0].data.split('.')) ?? ''
	const nameFrom = _.last(nameElement.data.text[0].data.split('.')) ?? ''
	return (
		<div className="space-y-6">
			<ComponentName name="Card List" />
			<TableSelect
				description="Table which you want to get data from"
				value={selectedTable}
				onChange={setSelectedTable}
			/>
			<Select
				size="xs"
				label="Title"
				description="Get title from"
				data={columns}
				value={titleFrom}
				onChange={(value) => {
					set(
						produce(columnsElement, (draft) => {
							draft.children = [
								createCard({ dataSourceName, titleFrom: value ?? '', nameFrom }),
							]
						})
					)
				}}
			/>
			<Select
				size="xs"
				label="Name"
				description="Get name from"
				data={columns}
				value={nameFrom}
				onChange={(value) => {
					set(
						produce(columnsElement, (draft) => {
							draft.children = [
								createCard({ dataSourceName, titleFrom, nameFrom: value ?? '' }),
							]
						})
					)
				}}
			/>
		</div>
	)
}

function createCard({
	dataSourceName,
	nameFrom,
	titleFrom,
}: {
	dataSourceName: string
	titleFrom: string
	nameFrom: string
}) {
	return produce(regenElement(deserializeElement(card)) as LinkElement, (draft) => {
		draft.repeatFrom = {
			name: `$store.${dataSourceName}.rows`,
			iterator: `${dataSourceName}.rowsItem`,
		}
		const title = draft.children?.[0].children?.[0].children?.[0] as TextElement
		const name = draft.children?.[1] as TextElement
		title.data.text = inteliState(`$store.page.${dataSourceName}.rowsItem.${titleFrom}`)
		name.data.text = inteliState(`$store.page.${dataSourceName}.rowsItem.${nameFrom}`)
		draft.data.href = `/details?id=$store.page.${dataSourceName}.rowsItem.id`
	})
}

const defaultData = {
	kind: 'Columns',
	id: 'bnRpMejvZgFEYCNI',
	components: [
		{
			kind: 'Box',
			id: 'yzSOgbpZPxyKRHsG',
			components: [
				{
					kind: 'Box',
					id: 'AvKBS_vaV_JdEYqQ',
					components: [
						{
							kind: 'Box',
							id: 'gUIfSBYpoMvbuQGZ',
							components: [
								{
									kind: 'Text',
									id: 'GdKvL_lAvygTLqFG',
									classNames: [],
									repeatFrom: null,
									events: [],
									bindings: {},
									data: {
										text: '82%',
										style: {
											desktop: {
												default: {
													color: '#2d6a4f',
													height: '24px',
													display: 'flex',
													'font-size': '1rem',
													'align-items': 'center',
													'font-weight': '500',
													'padding-top': '0px',
													'padding-left': '12px',
													'border-radius': '4px',
													'padding-right': '12px',
													'padding-bottom': '0px',
													'justify-content': 'center',
													'background-color': '#d8f3dc',
												},
											},
										},
									},
								},
								{
									kind: 'Box',
									id: 'PpAVtyZddQnEQkEK',
									components: [],
									classNames: [],
									repeatFrom: null,
									events: [],
									bindings: {},
									data: {
										style: {
											desktop: {
												default: {
													width: '24px',
													height: '24px',
													'min-height': 'auto',
													'border-radius': '4px',
													'background-color': 'hsla(0, 0%, 90%, 1)',
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
											width: '100%',
											display: 'flex',
											'min-height': 'auto',
											'align-items': 'center',
											'justify-content': 'space-between',
										},
									},
								},
							},
						},
						{
							kind: 'Image',
							id: 'iYCgcmfgppplwthp',
							classNames: [],
							repeatFrom: null,
							events: [],
							bindings: {},
							data: {
								alt: '',
								src: 'https://img.freepik.com/free-photo/furniture-modern-studio-lifestyle-green_1122-1837.jpg?1&w=996&t=st=1665145693~exp=1665146293~hmac=c6f1344624e73fe176b2e26c6d127432a0e77b94453b79fcefc6d78e69fa7887',
								style: {
									desktop: {
										default: {
											width: '220px',
											height: '130px',
											overflow: 'hidden',
											'align-self': 'center',
											'background-size': 'cover',
											'background-position': 'center',
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
									width: '260px',
									height: '200px',
									display: 'flex',
									'row-gap': '8px',
									'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
									'min-height': 'auto',
									'align-items': 'flex-start',
									'padding-top': '14px',
									'border-color': 'hsla(0, 0%, 85%, 1)',
									'border-style': 'solid',
									'border-width': '1px',
									'padding-left': '14px',
									'border-radius': '6px',
									'padding-right': '14px',
									'flex-direction': 'column',
									'padding-bottom': '14px',
								},
							},
						},
					},
				},
				{
					kind: 'Text',
					id: 'ZWotVlhlPVwbFuIY',
					classNames: [],
					repeatFrom: null,
					events: [],
					bindings: {},
					data: {
						text: 'Elegant Wood chair',
						style: {
							desktop: {
								default: {
									color: 'hsla(0, 0%, 27%, 1)',
									'font-size': '1rem',
									'margin-top': '20px',
									'font-weight': '500',
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
						focus: {},
						hover: {},
						default: { width: '260px', 'min-height': '150px' },
					},
					tablet: { focus: {}, hover: {}, default: {} },
					mobile: { focus: {}, hover: {}, default: {} },
				},
			},
		},
		{
			kind: 'Box',
			id: 'yzSOgbpZPxyKRHsG',
			components: [
				{
					kind: 'Box',
					id: 'AvKBS_vaV_JdEYqQ',
					components: [
						{
							kind: 'Box',
							id: 'gUIfSBYpoMvbuQGZ',
							components: [
								{
									kind: 'Text',
									id: 'GdKvL_lAvygTLqFG',
									classNames: [],
									repeatFrom: null,
									events: [],
									bindings: {},
									data: {
										text: '82%',
										style: {
											desktop: {
												default: {
													color: '#2d6a4f',
													height: '24px',
													display: 'flex',
													'font-size': '1rem',
													'align-items': 'center',
													'font-weight': '500',
													'padding-top': '0px',
													'padding-left': '12px',
													'border-radius': '4px',
													'padding-right': '12px',
													'padding-bottom': '0px',
													'justify-content': 'center',
													'background-color': '#d8f3dc',
												},
											},
										},
									},
								},
								{
									kind: 'Box',
									id: 'PpAVtyZddQnEQkEK',
									components: [],
									classNames: [],
									repeatFrom: null,
									events: [],
									bindings: {},
									data: {
										style: {
											desktop: {
												default: {
													width: '24px',
													height: '24px',
													'min-height': 'auto',
													'border-radius': '4px',
													'background-color': 'hsla(0, 0%, 90%, 1)',
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
											width: '100%',
											display: 'flex',
											'min-height': 'auto',
											'align-items': 'center',
											'justify-content': 'space-between',
										},
									},
								},
							},
						},
						{
							kind: 'Image',
							id: 'iYCgcmfgppplwthp',
							classNames: [],
							repeatFrom: null,
							events: [],
							bindings: {},
							data: {
								alt: '',
								src: 'https://img.freepik.com/free-photo/furniture-modern-studio-lifestyle-green_1122-1837.jpg?1&w=996&t=st=1665145693~exp=1665146293~hmac=c6f1344624e73fe176b2e26c6d127432a0e77b94453b79fcefc6d78e69fa7887',
								style: {
									desktop: {
										default: {
											width: '220px',
											height: '130px',
											overflow: 'hidden',
											'align-self': 'center',
											'background-size': 'cover',
											'background-position': 'center',
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
									width: '260px',
									height: '200px',
									display: 'flex',
									'row-gap': '8px',
									'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
									'min-height': 'auto',
									'align-items': 'flex-start',
									'padding-top': '14px',
									'border-color': 'hsla(0, 0%, 85%, 1)',
									'border-style': 'solid',
									'border-width': '1px',
									'padding-left': '14px',
									'border-radius': '6px',
									'padding-right': '14px',
									'flex-direction': 'column',
									'padding-bottom': '14px',
								},
							},
						},
					},
				},
				{
					kind: 'Text',
					id: 'ZWotVlhlPVwbFuIY',
					classNames: [],
					repeatFrom: null,
					events: [],
					bindings: {},
					data: {
						text: 'Elegant Wood chair',
						style: {
							desktop: {
								default: {
									color: 'hsla(0, 0%, 27%, 1)',
									'font-size': '1rem',
									'margin-top': '20px',
									'font-weight': '500',
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
						focus: {},
						hover: {},
						default: { width: '260px', 'min-height': '150px' },
					},
					tablet: { focus: {}, hover: {}, default: {} },
					mobile: { focus: {}, hover: {}, default: {} },
				},
			},
		},
		{
			kind: 'Box',
			id: 'yzSOgbpZPxyKRHsG',
			components: [
				{
					kind: 'Box',
					id: 'AvKBS_vaV_JdEYqQ',
					components: [
						{
							kind: 'Box',
							id: 'gUIfSBYpoMvbuQGZ',
							components: [
								{
									kind: 'Text',
									id: 'GdKvL_lAvygTLqFG',
									classNames: [],
									repeatFrom: null,
									events: [],
									bindings: {},
									data: {
										text: '82%',
										style: {
											desktop: {
												default: {
													color: '#2d6a4f',
													height: '24px',
													display: 'flex',
													'font-size': '1rem',
													'align-items': 'center',
													'font-weight': '500',
													'padding-top': '0px',
													'padding-left': '12px',
													'border-radius': '4px',
													'padding-right': '12px',
													'padding-bottom': '0px',
													'justify-content': 'center',
													'background-color': '#d8f3dc',
												},
											},
										},
									},
								},
								{
									kind: 'Box',
									id: 'PpAVtyZddQnEQkEK',
									components: [],
									classNames: [],
									repeatFrom: null,
									events: [],
									bindings: {},
									data: {
										style: {
											desktop: {
												default: {
													width: '24px',
													height: '24px',
													'min-height': 'auto',
													'border-radius': '4px',
													'background-color': 'hsla(0, 0%, 90%, 1)',
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
											width: '100%',
											display: 'flex',
											'min-height': 'auto',
											'align-items': 'center',
											'justify-content': 'space-between',
										},
									},
								},
							},
						},
						{
							kind: 'Image',
							id: 'iYCgcmfgppplwthp',
							classNames: [],
							repeatFrom: null,
							events: [],
							bindings: {},
							data: {
								alt: '',
								src: 'https://img.freepik.com/free-photo/furniture-modern-studio-lifestyle-green_1122-1837.jpg?1&w=996&t=st=1665145693~exp=1665146293~hmac=c6f1344624e73fe176b2e26c6d127432a0e77b94453b79fcefc6d78e69fa7887',
								style: {
									desktop: {
										default: {
											width: '220px',
											height: '130px',
											overflow: 'hidden',
											'align-self': 'center',
											'background-size': 'cover',
											'background-position': 'center',
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
									width: '260px',
									height: '200px',
									display: 'flex',
									'row-gap': '8px',
									'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
									'min-height': 'auto',
									'align-items': 'flex-start',
									'padding-top': '14px',
									'border-color': 'hsla(0, 0%, 85%, 1)',
									'border-style': 'solid',
									'border-width': '1px',
									'padding-left': '14px',
									'border-radius': '6px',
									'padding-right': '14px',
									'flex-direction': 'column',
									'padding-bottom': '14px',
								},
							},
						},
					},
				},
				{
					kind: 'Text',
					id: 'ZWotVlhlPVwbFuIY',
					classNames: [],
					repeatFrom: null,
					events: [],
					bindings: {},
					data: {
						text: 'Elegant Wood chair',
						style: {
							desktop: {
								default: {
									color: 'hsla(0, 0%, 27%, 1)',
									'font-size': '1rem',
									'margin-top': '20px',
									'font-weight': '500',
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
						focus: {},
						hover: {},
						default: { width: '260px', 'min-height': '150px' },
					},
					tablet: { focus: {}, hover: {}, default: {} },
					mobile: { focus: {}, hover: {}, default: {} },
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
					'min-height': '150px',
					display: 'grid',
					'grid-template-columns': '1fr 1fr 1fr',
					gap: '30px',
					'align-items': 'center',
					'justify-items': 'center',
					'padding-top': '50px',
					'padding-bottom': '50px',
					'padding-left': '20px',
					'padding-right': '20px',
				},
				hover: {},
				focus: {},
			},
			tablet: { default: {}, hover: {}, focus: {} },
			mobile: { default: {}, hover: {}, focus: {} },
		},
	},
}

const card = {
	id: 'AfzSraYwGDWGnRKS',
	data: {
		style: {
			mobile: { focus: {}, hover: {}, default: {} },
			tablet: { focus: {}, hover: {}, default: {} },
			desktop: {
				focus: {},
				hover: {},
				default: { width: '260px', 'min-height': '150px' },
			},
		},
		href: '',
		openInNewTab: false,
	},
	kind: 'Link',
	events: [],
	bindings: {},
	classNames: [],
	components: [
		{
			id: 'ocBrShXlSsJPgTuJ',
			data: {
				style: {
					desktop: {
						default: {
							width: '260px',
							height: '200px',
							display: 'flex',
							'row-gap': '8px',
							'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
							'min-height': 'auto',
							'align-items': 'flex-start',
							'padding-top': '14px',
							'border-color': 'hsla(0, 0%, 85%, 1)',
							'border-style': 'solid',
							'border-width': '1px',
							'padding-left': '14px',
							'border-radius': '6px',
							'padding-right': '14px',
							'flex-direction': 'column',
							'padding-bottom': '14px',
						},
					},
				},
			},
			kind: 'Box',
			events: [],
			bindings: {},
			classNames: [],
			components: [
				{
					id: 'qkXESnnOjlRbarfH',
					data: {
						style: {
							desktop: {
								default: {
									width: '100%',
									display: 'flex',
									'min-height': 'auto',
									'align-items': 'center',
									'justify-content': 'space-between',
								},
							},
						},
					},
					kind: 'Box',
					events: [],
					bindings: {},
					classNames: [],
					components: [
						{
							id: 'NTNQT_KiCknFstoj',
							data: {
								text: '82%',
								style: {
									desktop: {
										default: {
											color: '#2d6a4f',
											height: '24px',
											display: 'flex',
											'font-size': '1rem',
											'align-items': 'center',
											'font-weight': '500',
											'padding-top': '0px',
											'padding-left': '12px',
											'border-radius': '4px',
											'padding-right': '12px',
											'padding-bottom': '0px',
											'justify-content': 'center',
											'background-color': '#d8f3dc',
										},
									},
								},
							},
							kind: 'Text',
							events: [],
							bindings: {},
							classNames: [],
							repeatFrom: null,
						},
						{
							id: 'kezlhxUHixTfSogU',
							data: {
								style: {
									desktop: {
										default: {
											width: '24px',
											height: '24px',
											'min-height': 'auto',
											'border-radius': '4px',
											'background-color': 'hsla(0, 0%, 90%, 1)',
										},
									},
								},
							},
							kind: 'Box',
							events: [],
							bindings: {},
							classNames: [],
							components: [],
							repeatFrom: null,
						},
					],
					repeatFrom: null,
				},
				{
					id: 'DfCBRAZwjZXRYBxd',
					data: {
						alt: '',
						src: 'https://img.freepik.com/free-photo/furniture-modern-studio-lifestyle-green_1122-1837.jpg?1\u0026w=996\u0026t=st=1665145693~exp=1665146293~hmac=c6f1344624e73fe176b2e26c6d127432a0e77b94453b79fcefc6d78e69fa7887',
						style: {
							desktop: {
								default: {
									width: '220px',
									height: '130px',
									overflow: 'hidden',
									'align-self': 'center',
									'background-size': 'cover',
									'background-position': 'center',
								},
							},
						},
					},
					kind: 'Image',
					events: [],
					bindings: {},
					classNames: [],
					repeatFrom: null,
				},
			],
			repeatFrom: null,
		},
		{
			id: 'DBmcmmyQdEBGAiri',
			data: {
				text: 'Elegant Wood chair',
				style: {
					desktop: {
						default: {
							color: 'hsla(0, 0%, 27%, 1)',
							'font-size': '1rem',
							'margin-top': '20px',
							'font-weight': '500',
						},
					},
				},
			},
			kind: 'Text',
			events: [],
			bindings: {},
			classNames: [],
			repeatFrom: null,
		},
	],
	repeatFrom: null,
}
