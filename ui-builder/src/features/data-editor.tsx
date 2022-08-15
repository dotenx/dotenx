import {
	Button,
	CloseButton,
	Code,
	Divider,
	Menu,
	NumberInput,
	Select,
	Switch,
	Text,
	TextInput,
} from '@mantine/core'
import { openModal } from '@mantine/modals'
import Editor from '@monaco-editor/react'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { TbPlus } from 'react-icons/tb'
import {
	Action,
	ActionKind,
	Binding,
	BindingKind,
	Component,
	ComponentEvent,
	EventKind,
	getStateNames,
	useCanvasStore,
} from './canvas-store'
import { DataSourceForm } from './data-source-form'
import {
	DataSource,
	findPropertyPaths,
	PropertyKind,
	useDataSourceStore,
} from './data-source-store'
import { usePageStates } from './page-states'

export function DataEditor({ component }: { component: Component }) {
	const {
		components,
		addEvent,
		editEvent,
		removeEvent,
		addBinding,
		editBinding,
		removeBinding,
		editRepeatFrom,
	} = useCanvasStore((store) => ({
		addEvent: store.addComponentEvent,
		editEvent: store.editComponentEvent,
		removeEvent: store.removeEvent,
		addBinding: store.addBinding,
		components: store.components,
		editBinding: store.editBinding,
		removeBinding: store.removeBinding,
		editRepeatFrom: store.editRepeatFrom,
	}))
	const handleAddEvent = () =>
		addEvent(component.id, { id: nanoid(), kind: EventKind.Click, actions: [] })
	const handleAddBinding = () =>
		addBinding(component.id, { id: nanoid(), kind: BindingKind.Text, fromStateName: '' })
	const { dataSources } = useDataSourceStore((store) => ({
		dataSources: store.sources,
		addDataSource: store.add,
	}))

	const handleAddDataSource = () =>
		openModal({ children: <DataSourceForm />, title: 'New API Data Source' })

	const pageStates = usePageStates((store) => store.states)
	const repeatedState = component.repeatFrom ? pageStates[component.repeatFrom] : null
	const repeatedSample = _.isArray(repeatedState) ? repeatedState[0] : null
	const repeatedProperties = findPropertyPaths(repeatedSample)

	const states = [
		...getStateNames(components).map((stateName) => ({
			kind: PropertyKind.Unknown,
			name: stateName,
		})),
		...dataSources
			.map((source) =>
				source.properties.map((property) => ({
					kind: property.kind,
					name: `${source.stateName}${property.path}`,
				}))
			)
			.flat(),
		...repeatedProperties.map((property) => ({
			kind: property.kind,
			name: `${component.repeatFrom}${property.path}`,
		})),
	]

	const events = component.events.map((event) => (
		<EventInput
			key={event.id}
			event={event}
			changeEvent={(newEvent: ComponentEvent) => editEvent(component.id, newEvent)}
			removeEvent={() => removeEvent(component.id, event.id)}
		/>
	))

	const bindings = component.bindings.map((binding) => (
		<BindingInput
			key={binding.id}
			binding={binding}
			stateNames={states.map((stateName) => stateName.name)}
			onChange={(binding: Binding) => editBinding(component.id, binding)}
			removeBinding={() => removeBinding(component.id, binding.id)}
		/>
	))

	const sources = dataSources.map((dataSource) => (
		<DataSourceItem key={dataSource.id} dataSource={dataSource} />
	))

	return (
		<div>
			<Divider label="Events" mb="xs" />
			<div className="space-y-4">{events}</div>
			<Button mt="md" leftIcon={<TbPlus />} size="xs" onClick={handleAddEvent}>
				Event
			</Button>

			<Divider label="Data bindings" mt="xl" mb="xs" />
			<div className="space-y-4">{bindings}</div>
			<Button mt="md" leftIcon={<TbPlus />} size="xs" onClick={handleAddBinding}>
				Binding
			</Button>
			<div className="flex items-center gap-2 mt-10">
				<Text color="dimmed" size="xs" className="whitespace-nowrap">
					Repeat for each
				</Text>
				<Select
					size="xs"
					data={states
						.filter((state) => state.kind === PropertyKind.Array)
						.map((state) => state.name)}
					className="grow"
					value={component.repeatFrom}
					onChange={(value) => editRepeatFrom(component.id, value ?? '')}
				/>
			</div>

			<Divider label="API Data" mt="xl" mb="xs" />
			<div className="space-y-4">{sources}</div>
			<Button mt="md" leftIcon={<TbPlus />} size="xs" onClick={handleAddDataSource}>
				API Data Source
			</Button>
		</div>
	)
}

function DataSourceItem({ dataSource }: { dataSource: DataSource }) {
	const { remove } = useDataSourceStore((store) => ({
		remove: store.remove,
		edit: store.edit,
	}))

	return (
		<div className="space-y-2">
			<CloseButton size="xs" ml="auto" onClick={() => remove(dataSource.id)} />
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
				<Code className="grow overflow-x-auto no-scrollbar">{dataSource.url}</Code>
			</div>
		</div>
	)
}

const eventOptions = [
	{ label: 'click', value: EventKind.Click },
	{ label: 'mouse enter', value: EventKind.MouseEnter },
	{ label: 'mouse leave', value: EventKind.MouseLeave },
	{ label: 'key down', value: EventKind.KeyDown },
	{ label: 'change', value: EventKind.Change },
	{ label: 'submit', value: EventKind.Submit },
]

function EventInput({
	event,
	changeEvent,
	removeEvent,
}: {
	event: ComponentEvent
	changeEvent: (newEvent: ComponentEvent) => void
	removeEvent: () => void
}) {
	const addAction = (kind: ActionKind) => {
		switch (kind) {
			case ActionKind.Code:
				changeEvent({
					...event,
					actions: [...event.actions, { id: nanoid(), kind, code: '' }],
				})
				break
			case ActionKind.ToggleState:
				changeEvent({
					...event,
					actions: [...event.actions, { id: nanoid(), kind, name: '' }],
				})
				break
			case ActionKind.SetState:
				changeEvent({
					...event,
					actions: [...event.actions, { id: nanoid(), kind, name: '', valueToSet: '' }],
				})
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
							onChange={(name) =>
								changeEvent({
									...event,
									actions: event.actions.map((a) =>
										a.id === action.id ? { ...a, name } : a
									),
								})
							}
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
			<Menu shadow="sm" width={350} position="bottom-end">
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
						<Menu width={200} position="left-start" shadow="md">
							<Menu.Target>
								<Button size="xs" fullWidth leftIcon={<TbPlus />}>
									Action
								</Button>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item onClick={() => addAction(ActionKind.ToggleState)}>
									Toggle State
								</Menu.Item>
								<Menu.Item onClick={() => addAction(ActionKind.SetState)}>
									Set State
								</Menu.Item>
								<Menu.Item onClick={() => addAction(ActionKind.Code)}>
									Code
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</div>
				</Menu.Dropdown>
			</Menu>
			<CloseButton size="xs" onClick={removeEvent} />
		</div>
	)
}

function CodeEditor({
	defaultValue,
	onChange,
}: {
	defaultValue: string
	onChange: (value: string) => void
}) {
	return (
		<Editor
			height="80vh"
			defaultLanguage="javascript"
			defaultValue={defaultValue}
			onChange={(value) => onChange(value ?? '')}
		/>
	)
}

function ToggleStateSettings({
	defaultValue,
	onChange,
}: {
	defaultValue: string
	onChange: (value: string) => void
}) {
	return (
		<div>
			<TextInput
				label="State name"
				defaultValue={defaultValue}
				onChange={(e) => onChange(e.target.value)}
			/>
			<Text size="xs" mt="xs" color="dimmed">
				The name to toggle a value for
			</Text>
		</div>
	)
}

type ValueKind = 'text' | 'number' | 'switch'

function SetStateSettings({
	defaultValue,
	onChange,
}: {
	defaultValue: { name: string; value: string | number | boolean }
	onChange: ({ name, value }: { name: string; value: string | number | boolean }) => void
}) {
	const [valueKind, setValueKind] = useState<ValueKind>(
		typeof defaultValue.value === 'string'
			? 'text'
			: typeof defaultValue.value === 'number'
			? 'number'
			: 'switch'
	)
	const [name, setName] = useState(defaultValue.name)
	const [value, setValue] = useState(defaultValue.value)

	const handleChangeValue = (newValue: string | number | boolean) => {
		setValue(newValue)
		onChange({ name, value: newValue })
	}

	return (
		<div className="space-y-4">
			<div>
				<TextInput
					label="Set"
					defaultValue={defaultValue.name}
					onChange={(e) => {
						setName(e.target.value)
						onChange({ value, name: e.target.value })
					}}
				/>
				<Text size="xs" mt="xs" color="dimmed">
					The name to set a value for
				</Text>
			</div>
			<div>
				<div className="flex items-end gap-2">
					<Select
						label="To"
						className="w-28"
						value={valueKind}
						data={['text', 'number', 'switch']}
						onChange={(value: ValueKind) => {
							setValueKind(value)
							setValue(value === 'text' ? '' : value === 'number' ? 0 : false)
						}}
					/>
					{valueKind === 'text' && (
						<TextInput
							value={value as string}
							className="grow"
							placeholder="value"
							onChange={(e) => handleChangeValue(e.target.value)}
						/>
					)}
					{valueKind === 'number' && (
						<NumberInput
							value={value as number}
							className="grow"
							placeholder="value"
							onChange={(value) => handleChangeValue(value ?? 0)}
						/>
					)}
					{valueKind === 'switch' && (
						<Switch
							checked={value as boolean}
							className="self-center grow"
							placeholder="value"
							onChange={(e) => handleChangeValue(e.currentTarget.checked)}
							ml="xs"
							mt="xl"
						/>
					)}
				</div>
				<Text size="xs" mt="xs" color="dimmed">
					The value to assign to the above state property name
				</Text>
			</div>
		</div>
	)
}

function BindingInput({
	stateNames,
	onChange,
	binding,
	removeBinding,
}: {
	stateNames: string[]
	onChange: (binding: Binding) => void
	binding: Binding
	removeBinding: () => void
}) {
	return (
		<div className="space-y-2">
			<CloseButton size="xs" ml="auto" onClick={removeBinding} />
			<div className="flex items-center gap-2">
				<Text color="dimmed" size="xs" className="w-8">
					Get
				</Text>
				<Select
					size="xs"
					data={bindingOptions}
					className="grow"
					value={binding.kind}
					onChange={(value: BindingKind) => onChange({ ...binding, kind: value })}
				/>
			</div>
			<div className="flex items-center gap-2">
				<Text color="dimmed" size="xs" className="w-8">
					from
				</Text>
				<Select
					size="xs"
					data={stateNames}
					className="grow"
					value={binding.fromStateName}
					onChange={(value) => onChange({ ...binding, fromStateName: value ?? '' })}
				/>
			</div>
		</div>
	)
}

const bindingOptions = [
	{ label: 'text', value: BindingKind.Text },
	{ label: 'hide if', value: BindingKind.Hide },
	{ label: 'show if', value: BindingKind.Show },
	{ label: 'link', value: BindingKind.Link },
]
