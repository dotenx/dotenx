import {
	ActionIcon,
	Button,
	CloseButton,
	Code,
	Divider,
	JsonInput,
	Menu,
	NumberInput,
	Select,
	Switch,
	Text,
	TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals, openModal } from '@mantine/modals'
import Editor from '@monaco-editor/react'
import produce from 'immer'
import _ from 'lodash'
import { useState } from 'react'
import { TbEdit, TbPlus } from 'react-icons/tb'
import { JsonArray, uuid } from '../../utils'
import { Binding, BindingKind, bindingKinds, Element, RepeatFrom } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import {
	Action,
	ActionKind,
	actionKinds,
	ElementEvent,
	EventKind,
	FetchAction,
	SetStateAction,
	ToggleStateAction,
} from '../elements/event'
import { useSelectedElement } from '../selection/use-selected-component'
import { DataSourceForm } from './data-source-form'
import {
	DataSource,
	findPropertyPaths,
	PropertyKind,
	useDataSourceStore,
} from './data-source-store'
import { usePageStates } from './page-states'

export function DataEditor() {
	const element = useSelectedElement()
	const { dataSources } = useDataSourceStore((store) => ({
		dataSources: store.sources,
		addDataSource: store.add,
	}))
	const { set, elements } = useElementsStore((store) => ({
		set: store.set,
		elements: store.elements,
	}))
	const pageStates = usePageStates((store) => store.states)
	if (!element) return null

	const handleAddEvent = () => {
		set(
			produce(element, (draft) => {
				draft.events.push({ id: uuid(), kind: EventKind.Click, actions: [] })
			})
		)
	}
	const handleAddBinding = (bindingKind: BindingKind) => {
		set(
			produce(element, (draft) => {
				draft.bindings[bindingKind] = { fromStateName: '' }
			})
		)
	}
	const handleAddDataSource = () =>
		openModal({
			children: <DataSourceForm mode="add" />,
			title: 'New API Data Source',
			size: 'xl',
		})
	const editEvent = (event: ElementEvent) => {
		set(
			produce(element, (draft) => {
				draft.events = draft.events.map((e) => (e.id === event.id ? event : e))
			})
		)
	}
	const removeEvent = (event: ElementEvent) => {
		set(
			produce(element, (draft) => {
				draft.events = draft.events.filter((e) => e.id !== event.id)
			})
		)
	}
	const editBinding = (bindingKind: BindingKind, binding: Binding) => {
		set(
			produce(element, (draft) => {
				draft.bindings[bindingKind] = binding
			})
		)
	}
	const removeBinding = (bindingKind: BindingKind) => {
		set(
			produce(element, (draft) => {
				delete draft.bindings[bindingKind]
			})
		)
	}
	const editRepeatFrom = (repeatFrom: RepeatFrom) => {
		set(
			produce(element, (draft) => {
				draft.repeatFrom = repeatFrom
			})
		)
	}

	const repeatedState = element.repeatFrom?.name
		? _.get(pageStates, element.repeatFrom.name)
		: null
	const repeatedSample = _.isArray(repeatedState) ? repeatedState[0] : null
	const repeatedProperties = findPropertyPaths(repeatedSample)

	const repeatedParent = findRepeatedParent(element, elements)
	let passedProperties: { kind: PropertyKind; name: string }[] = []
	if (repeatedParent && repeatedParent.repeatFrom?.name) {
		const parentState = _.get(pageStates, repeatedParent.repeatFrom.name) as JsonArray
		passedProperties = findPropertyPaths(parentState[0]).map((property) => ({
			kind: property.kind,
			name: `${repeatedParent.repeatFrom?.iterator}${property.path}`,
		}))
	}

	const states = [
		...getStateNames(elements).map((stateName) => ({
			kind: PropertyKind.Unknown,
			name: stateName,
		})),
		...dataSources
			.map((source) =>
				source.properties.map((property) => ({
					kind: property.kind,
					name: `$store.${source.stateName}${property.path}`,
				}))
			)
			.flat(),
		...(element.repeatFrom?.name
			? repeatedProperties.map((property) => ({
					kind: property.kind,
					name: `${element.repeatFrom?.iterator}${property.path}`,
			  }))
			: []),
		...passedProperties,
	]

	const events = element.events.map((event) => (
		<EventInput
			key={event.id}
			event={event}
			changeEvent={(newEvent: ElementEvent) => editEvent(newEvent)}
			removeEvent={() => removeEvent(event)}
		/>
	))

	const bindings = _.toPairs(element.bindings)
		.filter((b): b is [BindingKind, Binding] => !!b[1])
		.map(([bindingKind, binding]) => (
			<BindingInput
				key={bindingKind}
				kind={bindingKind}
				binding={binding}
				stateNames={states.map((stateName) => stateName.name)}
				onChange={(binding: Binding) => editBinding(bindingKind, binding)}
				removeBinding={() => removeBinding(bindingKind)}
			/>
		))

	const sources = dataSources.map((dataSource) => (
		<DataSourceItem key={dataSource.id} dataSource={dataSource} />
	))

	const remainingBindings = bindingKinds.filter((binding) => !element.bindings[binding])

	return (
		<div>
			<Divider label="Events" mb="xs" />
			<div className="space-y-4">{events}</div>
			<Button mt="md" leftIcon={<TbPlus />} size="xs" onClick={handleAddEvent}>
				Event
			</Button>

			<Divider label="Data bindings" mt="xl" mb="xs" />
			<div className="space-y-4">{bindings}</div>
			<Menu width={150} shadow="sm" position="bottom-start">
				<Menu.Target>
					<Button mt="md" leftIcon={<TbPlus />} size="xs">
						Binding
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					{remainingBindings.map((kind) => (
						<Menu.Item key={kind} onClick={() => handleAddBinding(kind)}>
							{kind}
						</Menu.Item>
					))}
				</Menu.Dropdown>
			</Menu>

			<RepeatInput
				states={states}
				repeatFrom={element.repeatFrom}
				onChange={(value) =>
					editRepeatFrom({
						name: value,
						iterator: value.replace('$store.', '')
							? `${value.replace('$store.', '')}Item`
							: '',
					})
				}
			/>

			<Divider label="API Data" mt="xl" mb="xs" />
			<div className="space-y-4">{sources}</div>
			<Button mt="md" leftIcon={<TbPlus />} size="xs" onClick={handleAddDataSource}>
				API Data Source
			</Button>
		</div>
	)
}

export const getStateNames = (components: Element[]) => {
	let states: string[] = []
	for (const component of components) {
		states = [
			...states,
			...component.events
				.flatMap((event) => event.actions)
				.filter(
					(action): action is ToggleStateAction | SetStateAction =>
						action.kind === ActionKind.ToggleState ||
						action.kind === ActionKind.SetState
				)
				.map((action) => action.name),
		]
		states = [...states, ...getStateNames(component.children ?? [])]
	}
	return states
}

function RepeatInput({
	repeatFrom,
	onChange,
	states,
}: {
	repeatFrom: RepeatFrom | null
	onChange: (value: string) => void
	states: { kind: PropertyKind; name: string }[]
}) {
	return (
		<div>
			<div className="flex items-center gap-2 mt-10">
				<Text color="dimmed" size="xs" className="w-24 whitespace-nowrap shrink-0">
					Repeat for each
				</Text>
				<Select
					size="xs"
					data={states
						.filter((state) => state.kind === PropertyKind.Array)
						.map((state) => ({
							label: state.name.replace('$store.', ''),
							value: state.name,
						}))}
					className="grow"
					value={repeatFrom?.name ?? ''}
					onChange={(value) => onChange(value ?? '')}
					clearable
				/>
			</div>
			{repeatFrom?.iterator && (
				<div className="flex items-center gap-2 mt-2">
					<Text color="dimmed" size="xs" className="w-24 whitespace-nowrap shrink-0">
						as
					</Text>
					<Code>{repeatFrom.iterator}</Code>
				</div>
			)}
		</div>
	)
}

const findRepeatedParent = (component: Element, components: Element[]): Element | null => {
	return null
}

function DataSourceItem({ dataSource }: { dataSource: DataSource }) {
	const { remove } = useDataSourceStore((store) => ({
		remove: store.remove,
		edit: store.edit,
	}))

	return (
		<div className="space-y-2">
			<div className="flex justify-end gap-1">
				<ActionIcon
					size="xs"
					onClick={() =>
						openModal({
							children: <DataSourceForm mode="edit" initialValues={dataSource} />,
							title: 'Edit Data Source',
							size: 'xl',
						})
					}
				>
					<TbEdit />
				</ActionIcon>
				<CloseButton size="xs" onClick={() => remove(dataSource.id)} />
			</div>
			<div className="flex items-center gap-2">
				<Text color="dimmed" size="xs" className="w-8 shrink-0">
					Fetch
				</Text>
				<Code className="grow">{dataSource.stateName}</Code>
			</div>
			<div className="flex items-center gap-2">
				<Text color="dimmed" size="xs" className="w-8 shrink-0">
					from
				</Text>
				<Code className="overflow-x-auto grow no-scrollbar max-w-[237px]">
					{dataSource.url}
				</Code>
			</div>
		</div>
	)
}

export const eventOptions = [
	{ label: 'click', value: EventKind.Click },
	{ label: 'mouse enter', value: EventKind.MouseEnter },
	{ label: 'mouse leave', value: EventKind.MouseLeave },
	{ label: 'key down', value: EventKind.KeyDown },
	{ label: 'change', value: EventKind.Change },
	{ label: 'submit', value: EventKind.Submit },
	{ label: 'load', value: EventKind.Onload },
	{ label: 'intersection', value: EventKind.Intersection },
]

export const getActionDefaultValue = (kind: ActionKind) => {
	switch (kind) {
		case ActionKind.Code:
			return { id: uuid(), kind, code: '' }
		case ActionKind.ToggleState:
			return { id: uuid(), kind, name: '' }
		case ActionKind.SetState:
			return { id: uuid(), kind, name: '', valueToSet: '' }
		case ActionKind.Fetch:
			return { id: uuid(), kind, dataSourceName: '', body: '', params: '' }
		case ActionKind.Animation:
			return { id: uuid(), kind, animationName: '' }
	}
}

function EventInput({
	event,
	changeEvent,
	removeEvent,
}: {
	event: ElementEvent
	changeEvent: (newEvent: ElementEvent) => void
	removeEvent: () => void
}) {
	const addAction = (kind: ActionKind) => {
		const action = getActionDefaultValue(kind)
		switch (kind) {
			case ActionKind.Code:
				changeEvent({ ...event, actions: [...event.actions, action] })
				break
			case ActionKind.ToggleState:
				changeEvent({ ...event, actions: [...event.actions, action] })
				break
			case ActionKind.SetState:
				changeEvent({ ...event, actions: [...event.actions, action] })
				break
			case ActionKind.Fetch:
				changeEvent({ ...event, actions: [...event.actions, action] })
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
								changeEvent({
									...event,
									actions: event.actions.map((a) =>
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
								changeEvent({
									...event,
									actions: event.actions.map((a) =>
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
								changeEvent({
									...event,
									actions: event.actions.map((a) =>
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
								changeEvent({
									...event,
									actions: event.actions.map((a) =>
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

	return (
		<div className="flex items-center gap-2">
			<Text size="xs" color="dimmed">
				On
			</Text>
			<Select
				value={event.kind}
				data={eventOptions}
				onChange={(value: EventKind) => changeEvent({ ...event, kind: value })}
				placeholder="event"
				size="xs"
			/>
			<Text size="xs" color="dimmed">
				do
			</Text>
			<Menu shadow="sm" width={350} position="bottom-end" withinPortal>
				<Menu.Target>
					<Button variant="outline" size="xs">
						Action
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Label>Edit actions</Menu.Label>
					{event.actions.map((action) => (
						<div key={action.id} className="flex items-center gap-2 px-2 py-1">
							<Menu.Item onClick={() => openActionSettings(action)}>
								{action.kind}
							</Menu.Item>
							<CloseButton
								size="xs"
								onClick={() =>
									changeEvent({
										...event,
										actions: event.actions.filter((a) => action.id !== a.id),
									})
								}
							/>
						</div>
					))}

					<Menu.Divider />
					<div className="p-2">
						<Menu width={200} withinPortal position="left-start" shadow="md">
							<Menu.Target>
								<Button size="xs" fullWidth leftIcon={<TbPlus />}>
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
				</Menu.Dropdown>
			</Menu>
			<CloseButton size="xs" onClick={removeEvent} />
		</div>
	)
}

export function FetchSettings({
	initialValues,
	onSave,
}: {
	initialValues: FetchAction
	onSave: (values: FetchAction) => void
}) {
	const dataSources = useDataSourceStore((store) => store.sources)
	const form = useForm({ initialValues })

	return (
		<form onSubmit={form.onSubmit(onSave)}>
			<Select
				label="Data source"
				description="Fetch request of"
				data={dataSources.map((source) => source.stateName)}
				{...form.getInputProps('dataSourceName')}
			/>
			<TextInput
				label="Query parameters"
				description="Search params"
				mt="xl"
				{...form.getInputProps('params')}
			/>
			<JsonInput
				label="Body"
				description="Data passed to the request"
				placeholder="JSON object"
				validationError="Invalid JSON"
				formatOnBlur
				autosize
				mt="xl"
				minRows={3}
				{...form.getInputProps('body')}
			/>
			<Button fullWidth mt="xl" type="submit">
				Save
			</Button>
		</form>
	)
}

export function CodeEditor({
	defaultValue,
	onChange,
}: {
	defaultValue: string
	onChange: (value: string) => void
}) {
	const [code, setCode] = useState(defaultValue)

	return (
		<div>
			<Editor
				height="75vh"
				defaultLanguage="javascript"
				defaultValue={defaultValue}
				onChange={(value) => setCode(value ?? '')}
				options={{ fontFamily: 'monospace' }}
			/>
			<Button
				fullWidth
				mt="xs"
				onClick={() => {
					onChange(code)
					closeAllModals()
				}}
			>
				Save
			</Button>
		</div>
	)
}

export function ToggleStateSettings({
	defaultValue,
	onChange,
}: {
	defaultValue: string
	onChange: (value: string) => void
}) {
	const form = useForm({ initialValues: { stateName: defaultValue } })

	return (
		<form onSubmit={form.onSubmit((values) => onChange(values.stateName))}>
			<TextInput label="State name" {...form.getInputProps('stateName')} />
			<Text size="xs" mt="xs" color="dimmed">
				The name to toggle a value for
			</Text>
			<Button type="submit" fullWidth mt="xs">
				Save
			</Button>
		</form>
	)
}

export function SetStateSettings({
	defaultValue,
	onChange,
}: {
	defaultValue: { name: string; value: string | number | boolean }
	onChange: ({ name, value }: { name: string; value: string | number | boolean }) => void
}) {
	const form = useForm({
		initialValues: {
			...defaultValue,
			kind:
				typeof defaultValue.value === 'string'
					? 'text'
					: typeof defaultValue.value === 'number'
					? 'number'
					: 'yes/no',
		},
	})

	return (
		<form
			onSubmit={form.onSubmit((values) => {
				onChange({ name: values.name, value: values.value })
				closeAllModals()
			})}
			className="space-y-4"
		>
			<div>
				<TextInput label="Set" {...form.getInputProps('name')} />
				<Text size="xs" mt="xs" color="dimmed">
					The name to set a value for
				</Text>
			</div>
			<div>
				<div className="flex items-end gap-2">
					<Select
						label="To"
						className="w-28"
						data={['text', 'number', 'yes/no']}
						{...form.getInputProps('kind')}
					/>
					{form.values.kind === 'text' && (
						<TextInput
							className="grow"
							placeholder="value"
							{...form.getInputProps('value')}
						/>
					)}
					{form.values.kind === 'number' && (
						<NumberInput
							className="grow"
							placeholder="value"
							{...form.getInputProps('value')}
						/>
					)}
					{form.values.kind === 'yes/no' && (
						<Switch
							className="self-center grow"
							placeholder="value"
							ml="xs"
							mt="xl"
							onLabel="Yes"
							offLabel="No"
							size="xl"
							{...form.getInputProps('value', { type: 'checkbox' })}
						/>
					)}
				</div>
				<Text size="xs" mt="xs" color="dimmed">
					The value to assign to the above state property name
				</Text>
			</div>
			<Button fullWidth mt="xs" type="submit">
				Save
			</Button>
		</form>
	)
}

function BindingInput({
	stateNames,
	onChange,
	binding,
	removeBinding,
	kind,
}: {
	stateNames: string[]
	onChange: (binding: Binding) => void
	binding: Binding
	kind: BindingKind
	removeBinding: () => void
}) {
	return (
		<div className="space-y-2">
			<CloseButton size="xs" ml="auto" onClick={removeBinding} />
			<div className="flex items-center gap-2">
				<Text color="dimmed" size="xs" className="w-8">
					Get
				</Text>
				<Code className="grow">{kind}</Code>
			</div>
			<div className="flex items-center gap-2">
				<Text color="dimmed" size="xs" className="w-8">
					from
				</Text>
				<Select
					size="xs"
					data={stateNames.map((name) => ({
						label: name.replace('$store.', ''),
						value: name,
					}))}
					className="grow"
					value={binding.fromStateName}
					onChange={(value) => onChange({ ...binding, fromStateName: value ?? '' })}
				/>
			</div>
		</div>
	)
}
