import {
	Button,
	CloseButton,
	Divider,
	JsonInput,
	Menu,
	SegmentedControl,
	Switch,
	Text,
	TextInput,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { closeAllModals, openModal } from '@mantine/modals'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import produce from 'immer'
import { TbPlus } from 'react-icons/tb'
import { z } from 'zod'
import { AnyJson, uuid } from '../../utils'
import { ACTIONS } from '../actions'
import { Expression, ExpressionKind } from '../states/expression'
import { usePageStateStore } from '../states/page-states-store'
import { useGetStates } from '../states/use-get-states'
import { Intelinput, inteliText, inteliToString } from '../ui/intelinput'
import {
	DataSource,
	findPropertyPaths,
	HttpMethod,
	httpMethods,
	useDataSourceStore,
} from './data-source-store'

const schema = z.object({
	stateName: z.string().min(1),
	url: z.instanceof(Expression),
	method: z.nativeEnum(HttpMethod),
	headers: z.string(),
	body: z.instanceof(Expression),
	fetchOnload: z.boolean(),
	onSuccess: z.array(z.any()).optional(),
	isPrivate: z.boolean().optional(),
})

type Schema = z.infer<typeof schema>

type DataSourceFormMode = 'add' | 'edit' | 'simple-add' | 'simple-edit'

export function DataSourceForm({
	mode,
	initialValues = {
		stateName: '',
		url: new Expression(),
		method: HttpMethod.Get,
		headers: '',
		body: new Expression(),
		id: '',
		properties: [],
		fetchOnload: true,
		isPrivate: false,
	},
	onSuccess,
	withoutFetch,
}: {
	withoutFetch?: boolean
	mode: DataSourceFormMode
	initialValues?: DataSource
	onSuccess?: (values: Schema) => void
}) {
	const isAddMode = mode === 'add' || mode === 'simple-add'
	const isSimple = mode === 'simple-add' || mode === 'simple-edit'
	const normalizedInitialValues = produce(initialValues, (draft) => {
		if (!(initialValues.url instanceof Expression)) {
			const newUrl = new Expression()
			newUrl.value = (initialValues.url as any)?.value ?? []
			draft.url = newUrl
		}
		if (!(initialValues.body instanceof Expression)) {
			const newBody = new Expression()
			newBody.value = (initialValues.body as any)?.value ?? []
			draft.body = newBody
		}
	})
	const form = useForm<Schema>({
		validate: zodResolver(schema),
		initialValues: normalizedInitialValues,
	})
	const { addDataSource, mutation } = useAddDataSource({
		mode,
		initialValues,
		onSuccess,
		withoutFetch,
	})
	const handleSubmit = form.onSubmit(addDataSource)
	const states = useGetStates()

	const nameAndUrl = (
		<>
			<TextInput
				label="Name"
				description="Unique state name for this data"
				required
				name="stateName"
				{...form.getInputProps('stateName')}
			/>
			<Intelinput
				label="URL"
				options={states.map((state) => state.name)}
				{...form.getInputProps('url')}
			/>
		</>
	)

	const methods = (
		<div>
			<Text size="sm" weight={500} color="#212529" className="cursor-default">
				Method
			</Text>
			<Text size="xs" color="dimmed">
				HTTP request method
			</Text>
			<SegmentedControl
				className="mt-1"
				size="xs"
				fullWidth
				data={httpMethods}
				{...form.getInputProps('method')}
			/>
		</div>
	)

	const submitButton = (
		<Button className="col-span-2" fullWidth type="submit" loading={mutation.isLoading}>
			{isAddMode ? 'Add' : 'Save'}
		</Button>
	)

	const headers = (
		<JsonInput
			label="Headers"
			description="Passes additional context and metadata about the request"
			placeholder="JSON object"
			validationError="Invalid JSON"
			formatOnBlur
			autosize
			minRows={3}
			{...form.getInputProps('headers')}
		/>
	)

	if (isSimple) {
		return (
			<form onSubmit={handleSubmit} className="space-y-6">
				{methods}
				{nameAndUrl}
				{headers}
				{submitButton}
			</form>
		)
	}

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-2 gap-10">
			<div className="space-y-6">
				{nameAndUrl}
				<Switch
					label="Fetch on page load"
					{...form.getInputProps('fetchOnload', { type: 'checkbox' })}
				/>
				<Switch
					label="Requires authentication"
					{...form.getInputProps('isPrivate', { type: 'checkbox' })}
				/>
				{mode === 'edit' && (
					<>
						<Divider label="On success" my="sm" />
						<DataSourceSuccessActions dataSourceId={initialValues.id} />
					</>
				)}
			</div>
			<div className="space-y-6">
				{methods}
				{headers}
				<Intelinput
					label="Body"
					placeholder="JSON object"
					options={states.map((state) => state.name)}
					{...form.getInputProps('body')}
				/>
			</div>
			{submitButton}
		</form>
	)
}

function DataSourceSuccessActions({ dataSourceId }: { dataSourceId: string }) {
	const { edit, sources } = useDataSourceStore((store) => ({
		edit: store.edit,
		sources: store.sources,
	}))
	const source = sources.find((source) => source.id === dataSourceId)!
	const actions = source.onSuccess ?? []

	return (
		<div className="space-y-4">
			{actions.map((action) => (
				<div key={action.id} className="flex items-center gap-2">
					<Button
						size="xs"
						variant="light"
						fullWidth
						onClick={() =>
							openModal({
								title: action.name,
								children: action.renderDataSourceSettings(dataSourceId),
							})
						}
					>
						{action.name}
					</Button>
					<CloseButton
						size="xs"
						onClick={() => {
							const newSource = produce(source, (draft) => {
								draft.onSuccess = draft.onSuccess?.filter((a) => a.id !== action.id)
							})
							edit(dataSourceId, newSource)
						}}
					/>
				</div>
			))}
			<Menu width={200} withinPortal position="left-start" shadow="md">
				<Menu.Target>
					<Button size="xs" fullWidth leftIcon={<TbPlus />}>
						Action
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					{ACTIONS.map((Action) => {
						const action = new Action()
						return (
							<Menu.Item
								key={action.name}
								onClick={() =>
									openModal({
										title: action.name,
										children: action.renderDataSourceSettings(dataSourceId),
									})
								}
							>
								{action.name}
							</Menu.Item>
						)
					})}
				</Menu.Dropdown>
			</Menu>
		</div>
	)
}

export const useAddDataSource = ({
	mode,
	initialValues = {
		stateName: '',
		url: new Expression(),
		method: HttpMethod.Get,
		headers: '',
		body: new Expression(),
		id: '',
		properties: [],
		fetchOnload: true,
	},
	onSuccess,
	onSubmit,
	withoutFetch,
}: {
	mode: DataSourceFormMode
	initialValues?: DataSource
	onSuccess?: (values: Schema) => void
	onSubmit?: (values: AnyJson) => void
	withoutFetch?: boolean
}) => {
	const isAddMode = mode === 'add' || mode === 'simple-add'
	const setPageState = usePageStateStore((store) => store.setState)
	const { addSource, editSource } = useDataSourceStore((store) => ({
		addSource: store.add,
		editSource: store.edit,
	}))
	const mutation = useMutation(
		({
			body,
			method,
			url,
			withCredentials,
		}: {
			url: string
			method: HttpMethod
			body: unknown
			withCredentials: boolean
		}) => axios.request<AnyJson>({ url, method, data: body, withCredentials })
	)
	const addDataSource = (values: Schema) => {
		// This section is particularly used for handling form add request. In this case, we don't want to send an actual request to the server
		if (withoutFetch) {
			const response = [] as AnyJson // Based on the current logic we have to at least return an empty array so the state can be used in other places
			const properties = findPropertyPaths(response)
			if (isAddMode) {
				addSource({
					...values,
					id: uuid(),
					properties,
				})
				setPageState(values.stateName, response)
			} else {
				editSource(initialValues.id, { ...values, properties })
			}
			onSuccess?.(values)
			closeAllModals()
			return
		}
		const evaluatedUrl = evaluateExpression(values.url)
		mutation.mutate(
			{
				url: inteliToString(evaluatedUrl),
				body: inteliToString(evaluateExpression(values.body)),
				method: values.method,
				withCredentials: !!values.isPrivate,
			},
			{
				onSuccess: (data) => {
					const response = data.data
					const properties = findPropertyPaths(response)
					if (isAddMode) {
						addSource({
							...values,
							id: uuid(),
							properties,
						})
					} else {
						editSource(initialValues.id, { ...values, properties })
					}
					onSuccess?.(values)
					onSubmit?.(response)
					setPageState(values.stateName, response)
					closeAllModals()
				},
				onError: () => {
					if (isAddMode) {
						addSource({
							...values,
							id: uuid(),
							properties: [],
						})
					} else {
						editSource(initialValues.id, { ...values, properties: [] })
					}
					onSuccess?.(values)
					closeAllModals()
				},
			}
		)
	}

	return { addDataSource, mutation }
}

export function evaluateExpression(expression: Expression) {
	return (
		expression.value?.map((part) =>
			part.kind === ExpressionKind.State ? inteliText('1').value[0] : part
		) ?? []
	)
}
