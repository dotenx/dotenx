import { ActionIcon, Button, CloseButton, Code, Divider, Text } from '@mantine/core'
import { openModal } from '@mantine/modals'
import axios from 'axios'
import produce from 'immer'
import { ReactNode, useContext } from 'react'
import { FrameContext } from 'react-frame-component'
import { TbEdit, TbForms, TbPlus } from 'react-icons/tb'
import { AnyJson } from '../../../utils'
import { DataSourceForm } from '../../data-bindings/data-source-form'
import { useDataSourceStore } from '../../data-bindings/data-source-store'
import { inteliToString } from '../../ui/intelinput'
import { Element, RenderFn } from '../element'
import { useElementsStore } from '../elements-store'
import { Style } from '../style'

export class FormElement extends Element {
	name = 'Form'
	icon = (<TbForms />)
	children: Element[] = []
	style: Style = {
		desktop: {
			default: { minHeight: '150px' },
		},
	}
	data = { dataSourceName: '' }

	render(renderFn: RenderFn): ReactNode {
		return renderFn(this)
	}

	renderPreview(renderFn: RenderFn) {
		return <FormHandler element={this}>{renderFn(this)}</FormHandler>
	}

	renderOptions(): ReactNode {
		return <FormOptions element={this} />
	}
}

function FormHandler({ children, element }: { children: ReactNode; element: FormElement }) {
	const dataSources = useDataSourceStore((store) => store.sources)
	const dataSource = dataSources.find(
		(source) => source.stateName === element.data.dataSourceName
	)
	const { window } = useContext(FrameContext)

	return (
		<form
			id={element.id}
			className={element.generateClasses()}
			onSubmit={(event) => {
				event.preventDefault()
				const form = window?.document.getElementById(element.id) as HTMLFormElement
				if (!dataSource) return
				const formValues: AnyJson = {}
				new FormData(form).forEach((value, key) => {
					formValues[key] = value.toString()
					if (value.toString() === '') formValues[key] = true
				})
				axios.request({
					method: dataSource.method,
					url: inteliToString(dataSource.url),
					data: formValues,
				})
			}}
		>
			{children}
		</form>
	)
}

function FormOptions({ element }: { element: FormElement }) {
	const set = useElementsStore((state) => state.set)
	const { dataSources, removeDataSource } = useDataSourceStore((store) => ({
		dataSources: store.sources,
		removeDataSource: store.remove,
	}))
	const dataSource = dataSources.find(
		(source) => source.stateName === element.data.dataSourceName
	)
	const hasDataSource = !!dataSource

	return (
		<div>
			<Divider label="Request Handler" mb="xs" />
			{!hasDataSource && (
				<Button
					size="xs"
					mt="md"
					onClick={() =>
						openModal({
							title: 'Add Request',
							children: (
								<DataSourceForm
									withoutFetch={true}
									mode="simple-add"
									initialValues={dataSource}
									onSuccess={(values) =>
										set(
											produce(element, (draft) => {
												draft.data.dataSourceName = values.stateName
											})
										)
									}
								/>
							),
						})
					}
					leftIcon={<TbPlus />}
				>
					Request
				</Button>
			)}
			{hasDataSource && (
				<div className="space-y-2">
					<div className="flex items-center justify-end gap-1">
						<ActionIcon
							size="xs"
							onClick={() =>
								openModal({
									title: 'Add Request',
									children: (
										<DataSourceForm
											mode="simple-edit"
											initialValues={dataSource}
											onSuccess={(values) =>
												set(
													produce(element, (draft) => {
														draft.data.dataSourceName = values.stateName
													})
												)
											}
										/>
									),
								})
							}
						>
							<TbEdit />
						</ActionIcon>
						<CloseButton
							size="xs"
							onClick={() => {
								removeDataSource(dataSource.id)
								set(
									produce(element, (draft) => {
										draft.data.dataSourceName = ''
									})
								)
							}}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Text color="dimmed" size="xs" className="w-8 shrink-0">
							Name
						</Text>
						<Code className="grow">{dataSource.stateName}</Code>
					</div>
				</div>
			)}
		</div>
	)
}
