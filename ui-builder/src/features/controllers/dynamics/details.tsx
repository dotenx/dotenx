import { Select } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { API_URL } from '../../../api'
import imageUrl from '../../../assets/components/details.png'
import { deserializeElement } from '../../../utils/deserialize'
import { useAddDataSource } from '../../data-source/data-source-form'
import { HttpMethod } from '../../data-source/data-source-store'
import { useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import { projectTagAtom } from '../../page/top-bar'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Expression, ExpressionKind } from '../../states/expression'
import { inteliState } from '../../ui/intelinput'
import { Component } from '../controller'
import { TableSelect, useColumnsQuery } from '../create-form'
import { ComponentName } from '../helpers'

export class Details extends Component {
	name = 'Details'
	image = imageUrl
	defaultData = deserializeElement(defaultData)
	data: { tableName: string | null } = { tableName: null }

	renderOptions() {
		return <DetailsOptions controller={this} />
	}
}

function DetailsOptions({ controller }: { controller: Details }) {
	const set = useSetElement()
	const [selectedTable, setSelectedTable] = useInputState(controller.data.tableName)
	const root = useSelectedElement() as BoxElement
	const imageElement = root.children[0] as ImageElement
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
				body: new Expression(),
				fetchOnload: true,
				headers: '',
				method: HttpMethod.Get,
				stateName: dataSourceName,
				url: new Expression([
					{
						kind: ExpressionKind.Text,
						value: `${API_URL}/public/database/query/select/project/${projectTag}/table/${selectedTable}/row/`,
					},
					{ kind: ExpressionKind.State, value: '$store.url.id' },
				]),
				isPrivate: true,
			})
			controller.data.tableName = selectedTable
		},
	})
	const columns = columnsQuery.data?.data.columns.map((col) => col.name) ?? []
	const imageFrom = _.last(imageElement.data.src.value[0].value?.split('.')) ?? ''
	const titleFrom = _.last(titleElement.data.text.value[0].value?.split('.')) ?? ''
	const descriptionFrom = _.last(descriptionElement.data.text.value[0].value?.split('.')) ?? ''
	return (
		<div className="space-y-6">
			<ComponentName name="Details" />
			<TableSelect
				description="Table which you want to get data from"
				value={selectedTable}
				onChange={setSelectedTable}
			/>
			<Select
				size="xs"
				label="Image"
				description="Get image from"
				data={columns}
				value={imageFrom}
				onChange={(value) => {
					set(
						imageElement,
						(draft) =>
							(draft.data.src = inteliState(
								`$store.source.${dataSourceName}.${value}`
							))
					)
				}}
			/>
			<Select
				size="xs"
				label="Title"
				description="Get title from"
				data={columns}
				value={titleFrom}
				onChange={(value) => {
					set(root, (draft) => {
						const title = draft.children?.[1] as TextElement
						title.data.text = inteliState(`$store.source.${dataSourceName}.${value}`)
					})
				}}
			/>
			<Select
				size="xs"
				label="Name"
				description="Get name from"
				data={columns}
				value={descriptionFrom}
				onChange={(value) => {
					set(root, (draft) => {
						const description = draft.children?.[2] as TextElement
						description.data.text = inteliState(
							`$store.source.${dataSourceName}.${value}`
						)
					})
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
				style: {
					desktop: { default: { height: '300px', objectFit: 'cover', margin: 'auto' } },
				},
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
				text: Expression.fromString('Elegant Wood chair'),
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
				text: Expression.fromString(
					'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit nulla, rerum facere possimus perspiciatis labore optio! Quae deleniti id quam, doloremque commodi tempore quos quas saepe et reiciendis beatae sed?'
				),
				style: {
					desktop: {
						default: {
							color: 'hsla(0, 0%, 25%, 1)',
							'font-size': '0.875rem',
							'text-align': 'center',
							'font-weight': '400',
							'padding-left': '50px',
							'padding-right': '50px',
							maxWidth: '50%',
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
					'min-height': 'auto',
					'align-items': 'center',
					display: 'flex',
					'flex-direction': 'column',
				},
			},
		},
	},
}
