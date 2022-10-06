import { Button, JsonInput, SegmentedControl, Switch, Text, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { z } from 'zod'
import { AnyJson, uuid } from '../../utils'
import {
	DataSource,
	findPropertyPaths,
	HttpMethod,
	httpMethods,
	useDataSourceStore,
} from './data-source-store'
import { usePageStates } from './page-states'

const schema = z.object({
	stateName: z.string().min(1),
	url: z.string().url(),
	method: z.nativeEnum(HttpMethod),
	headers: z.string(),
	body: z.string(),
	fetchOnload: z.boolean(),
})

type Schema = z.infer<typeof schema>

export function DataSourceForm({
	mode,
	initialValues = {
		stateName: '',
		url: '',
		method: HttpMethod.Get,
		headers: '',
		body: '',
		id: '',
		properties: [],
		fetchOnload: true,
	},
	onSuccess,
}: {
	mode: 'add' | 'edit' | 'simple-add' | 'simple-edit'
	initialValues?: DataSource
	onSuccess?: (values: Schema) => void
}) {
	const isAddMode = mode === 'add' || mode === 'simple-add'
	const isSimple = mode === 'simple-add' || mode === 'simple-edit'
	const setPageState = usePageStates((store) => store.setState)
	const { addSource, editSource } = useDataSourceStore((store) => ({
		addSource: store.add,
		editSource: store.edit,
	}))
	const mutation = useMutation((url: string) => axios.get<AnyJson>(url))
	const form = useForm<Schema>({ validate: zodResolver(schema), initialValues })
	const handleSubmit = form.onSubmit((values) => {
		mutation.mutate(values.url, {
			onSuccess: (data) => {
				const response = data.data
				const properties = findPropertyPaths(response)
				if (isAddMode) {
					addSource({
						...values,
						id: uuid(),
						properties: properties,
					})
				} else {
					editSource(initialValues.id, { ...values, properties })
				}
				onSuccess?.(values)
				setPageState(`$store.${values.stateName}`, response)
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
		})
	})

	const nameAndUrl = (
		<>
			<TextInput
				label="Name"
				description="Unique state name for this data"
				required
				name="stateName"
				{...form.getInputProps('stateName')}
			/>
			<TextInput
				description="JSON API endpoint to fetch data from"
				label="URL"
				required
				name="url"
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
			{isAddMode ? 'Add' : 'Edit'}
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
			</div>
			<div className="space-y-6">
				{methods}
				{headers}
				<JsonInput
					label="Body"
					description="The request data"
					placeholder="JSON object"
					validationError="Invalid JSON"
					formatOnBlur
					autosize
					minRows={3}
					{...form.getInputProps('body')}
				/>
			</div>
			{submitButton}
		</form>
	)
}
