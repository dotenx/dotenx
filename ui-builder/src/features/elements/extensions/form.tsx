import { ActionIcon, Button, CloseButton, Code, Divider, Menu, Text } from '@mantine/core'
import { closeAllModals, openModal } from '@mantine/modals'
import axios from 'axios'
import produce from 'immer'
import { ReactNode, useContext } from 'react'
import { FrameContext } from 'react-frame-component'
import { TbEdit, TbForms, TbPlus } from 'react-icons/tb'
import { AnyJson, uuid } from '../../../utils'
import {
	CodeEditor,
	FetchSettings,
	getActionDefaultValue,
	SetStateSettings,
	ToggleStateSettings,
} from '../../data-bindings/data-editor'
import { DataSourceForm } from '../../data-bindings/data-source-form'
import { useDataSourceStore } from '../../data-bindings/data-source-store'
import { Element, RenderFn } from '../element'
import { useElementsStore } from '../elements-store'
import { Action, ActionKind, actionKinds, ElementEvent, EventKind } from '../event'
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
					url: dataSource.url,
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
	const submitEvent = element.events.filter((event) => event.kind === EventKind.Submit)[0]
	const submitActions = submitEvent?.actions ?? []
	const changeOrAddEvent = (newEvent: ElementEvent) => {
		if (submitEvent) {
			set(
				produce(element, (draft) => {
					draft.events = draft.events.map((event) =>
						event === submitEvent ? newEvent : event
					)
				})
			)
		} else {
			set(
				produce(element, (draft) => {
					draft.events.push({ ...newEvent, id: uuid(), kind: EventKind.Submit })
				})
			)
		}
	}
	const addAction = (kind: ActionKind) => {
		const action = getActionDefaultValue(kind)
		switch (kind) {
			case ActionKind.Code:
				changeOrAddEvent({ ...submitEvent, actions: [...submitActions, action] })
				break
			case ActionKind.ToggleState:
				changeOrAddEvent({ ...submitEvent, actions: [...submitActions, action] })
				break
			case ActionKind.SetState:
				changeOrAddEvent({ ...submitEvent, actions: [...submitActions, action] })
				break
			case ActionKind.Fetch:
				changeOrAddEvent({ ...submitEvent, actions: [...submitActions, action] })
				break
		}
	}

	const openActionSettings = (action: Action) => {
		switch (action.kind) {
			case ActionKind.Code:
				openModal({
					children: (
						<CodeEditor
							defaultValue={action.code}
							onChange={(code) =>
								changeOrAddEvent({
									...submitEvent,
									actions: submitActions.map((a) =>
										a.id === action.id ? { ...a, code } : a
									),
								})
							}
						/>
					),
					size: 'xl',
					closeOnEscape: false,
				})
				break
			case ActionKind.ToggleState:
				openModal({
					title: 'Toggle State',
					children: (
						<ToggleStateSettings
							defaultValue={action.name}
							onChange={(name) => {
								changeOrAddEvent({
									...submitEvent,
									actions: submitActions.map((a) =>
										a.id === action.id ? { ...a, name } : a
									),
								})
								closeAllModals()
							}}
						/>
					),
				})
				break
			case ActionKind.SetState:
				openModal({
					title: 'Set State',
					children: (
						<SetStateSettings
							defaultValue={{ name: action.name, value: action.valueToSet }}
							onChange={({
								name,
								value,
							}: {
								name: string
								value: string | number | boolean
							}) =>
								changeOrAddEvent({
									...submitEvent,
									actions: submitActions.map((a) =>
										a.id === action.id
											? {
													...a,
													kind: ActionKind.SetState,
													name,
													valueToSet: value,
											  }
											: a
									),
								})
							}
						/>
					),
				})
				break
			case ActionKind.Fetch:
				openModal({
					title: 'Fetch',
					children: (
						<FetchSettings
							initialValues={action}
							onSave={(values) => {
								changeOrAddEvent({
									...submitEvent,
									actions: submitActions.map((a) =>
										a.id === action.id ? values : a
									),
								})
								closeAllModals()
							}}
						/>
					),
				})
				break
		}
	}

	const actions = submitActions.map((action) => (
		<div key={action.id} className="flex items-center gap-1">
			<Button
				size="xs"
				fullWidth
				variant="outline"
				onClick={() => openActionSettings(action)}
			>
				{action.kind}
			</Button>
			<CloseButton
				size="xs"
				onClick={() =>
					changeOrAddEvent({
						...submitEvent,
						actions: submitActions.filter((a) => action.id !== a.id),
					})
				}
			/>
		</div>
	))

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

			<Divider label="Actions" mt="xl" mb="xs" />
			<div className="space-y-2">{actions}</div>
			<Menu shadow="sm" width={200} position="bottom-end">
				<Menu.Target>
					<Button leftIcon={<TbPlus />} size="xs" mt="md">
						Action
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					{actionKinds.map((kind) => (
						<Menu.Item key={kind} onClick={() => addAction(kind)}>
							{kind}
						</Menu.Item>
					))}
				</Menu.Dropdown>
			</Menu>
		</div>
	)
}
