import { Select } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import imageUrl from '../../../assets/components/details.png'
import { deserializeElement } from '../../../utils/deserialize'
import { useAddDataSource } from '../../data-bindings/data-source-form'
import { HttpMethod } from '../../data-bindings/data-source-store'
import { useElementsStore } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ColumnsElement } from '../../elements/extensions/columns'
import { TextElement } from '../../elements/extensions/text'
import { projectTagAtom } from '../../page/top-bar'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Controller } from '../controller'
import { useColumnsQuery, TableSelect } from '../create-form'

export class Details extends Controller {
	name = 'Details'
	image = imageUrl
	defaultData = deserializeElement(defaultData)
	data: { tableName: string | null } = { tableName: null }

	renderOptions() {
		return <DetailsOptions controller={this} />
	}
}

function DetailsOptions({ controller }: { controller: Details }) {
	const set = useElementsStore((store) => store.set)
	const [selectedTable, setSelectedTable] = useInputState(controller.data.tableName)
	const root = useSelectedElement() as BoxElement
	const titleElement = root.children?.[1] as TextElement
	const descriptionElement = root.children?.[2] as TextElement
	const dataSourceName = `${selectedTable}_details`
	const { addDataSource } = useAddDataSource({ mode: 'add' })
	const projectTag = useAtomValue(projectTagAtom)
	const columnsQuery = useColumnsQuery({
		tableName: selectedTable,
		onSuccess: () => {
			if (!selectedTable) return
			addDataSource({
				body: '',
				fetchOnload: true,
				headers: '',
				method: HttpMethod.Get,
				stateName: dataSourceName,
				url: `https://api.dotenx.com/public/database/query/select/project/${projectTag}/table/${selectedTable}/row/ $store.url.id`,
				isPrivate: true,
			})
			controller.data.tableName = selectedTable
		},
	})
	const columns = columnsQuery.data?.data.columns.map((col) => col.name) ?? []
	const titleFrom = _.last(titleElement.data.text.split('.')) ?? ''
	const descriptionFrom = _.last(descriptionElement.data.text.split('.')) ?? ''
	return (
		<div className="space-y-6">
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
						produce(root, (draft) => {
							const title = draft.children?.[1] as TextElement
							title.data.text = `$store.${dataSourceName}.${value}`
						})
					)
				}}
			/>
			<Select
				size="xs"
				label="Name"
				description="Get name from"
				data={columns}
				value={descriptionFrom}
				onChange={(value) => {
					set(
						produce(root, (draft) => {
							const description = draft.children?.[2] as TextElement
							description.data.text = `$store.${dataSourceName}.${value}`
						})
					)
				}}
			/>
		</div>
	)
}

const defaultData = {
	kind: 'Box',
	id: 'xpjBinHmBRaFju_a',
	components: [
		{
			kind: 'Image',
			id: 'LElySoHpSSAuEGgw',
			classNames: [],
			repeatFrom: null,
			events: [],
			bindings: {},
			data: {
				alt: '',
				src: 'https://img.freepik.com/free-photo/furniture-modern-studio-lifestyle-green_1122-1837.jpg?1&w=996&t=st=1665145693~exp=1665146293~hmac=c6f1344624e73fe176b2e26c6d127432a0e77b94453b79fcefc6d78e69fa7887',
				style: { desktop: { default: { height: '300px' } } },
			},
		},
		{
			kind: 'Text',
			id: 'KMGrVysDadQGUHLJ',
			classNames: [],
			repeatFrom: null,
			events: [],
			bindings: {},
			data: {
				text: 'Elegant Wood chair',
				style: {
					desktop: {
						default: {
							color: 'hsla(0, 0%, 20%, 1)',
							'font-size': '1.875rem',
							'text-align': 'center',
							'font-weight': '300',
							'padding-top': '20px',
							'padding-bottom': '20px',
						},
					},
				},
			},
		},
		{
			kind: 'Text',
			id: 'VEpVcRsNwMvZsjMv',
			classNames: [],
			repeatFrom: null,
			events: [],
			bindings: {},
			data: {
				text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit nulla, rerum facere possimus perspiciatis labore optio! Quae deleniti id quam, doloremque commodi tempore quos quas saepe et reiciendis beatae sed?',
				style: {
					desktop: {
						default: {
							color: 'hsla(0, 0%, 25%, 1)',
							'font-size': '0.875rem',
							'text-align': 'center',
							'font-weight': '400',
							'padding-left': '50px',
							'padding-right': '50px',
						},
					},
				},
			},
		},
		// {
		// 	kind: 'Box',
		// 	id: 'ngHJfiKrXxivXNAU',
		// 	components: [
		// 		{
		// 			kind: 'Button',
		// 			id: 'rfSrVunfnvGsHGxn',
		// 			classNames: [],
		// 			repeatFrom: null,
		// 			events: [],
		// 			bindings: {},
		// 			data: {
		// 				text: 'Edit',
		// 				style: {
		// 					desktop: {
		// 						default: {
		// 							color: 'hsla(0, 0%, 25%, 1)',
		// 							border: '0',
		// 							cursor: 'pointer',
		// 							display: 'inline-block',
		// 							'box-shadow': '0px 0px 0px 0px ',
		// 							'text-align': 'center',
		// 							'font-weight': 600,
		// 							'padding-top': '6px',
		// 							'border-style': 'solid',
		// 							'border-width': '2px',
		// 							'padding-left': '20px',
		// 							'border-radius': '10px',
		// 							'padding-right': '20px',
		// 							'padding-bottom': '6px',
		// 							'background-color': 'hsla(217, 0%, 100%, 1)',
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 		{
		// 			kind: 'Icon',
		// 			id: 'vgMyGRwPwTXdvcuC',
		// 			components: [],
		// 			classNames: [],
		// 			repeatFrom: null,
		// 			events: [],
		// 			bindings: {},
		// 			data: {
		// 				name: 'trash',
		// 				type: 'fas',
		// 				style: {
		// 					desktop: {
		// 						default: {
		// 							color: 'hsla(0, 75%, 40%, 1)',
		// 							width: '24px',
		// 							height: '24px',
		// 							'background-color': '',
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 	],
		// 	classNames: [],
		// 	repeatFrom: null,
		// 	events: [],
		// 	bindings: {},
		// 	data: {
		// 		style: {
		// 			desktop: {
		// 				default: {
		// 					display: 'flex',
		// 					'min-height': 'auto',
		// 					'align-items': 'center',
		// 					'margin-left': '50px',
		// 					'padding-top': '30px',
		// 					'margin-right': '50px',
		// 					'padding-right': '0px',
		// 					'justify-content': 'space-between',
		// 				},
		// 			},
		// 		},
		// 	},
		// },
	],
	classNames: [],
	repeatFrom: null,
	events: [],
	bindings: {},
	data: {
		style: { desktop: { default: { 'min-height': 'auto' } } },
	},
}
