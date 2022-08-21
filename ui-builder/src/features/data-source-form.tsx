import { Button, JsonInput, SegmentedControl, Switch, Text, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { AnyJson } from '../utils'
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
	method: z.string(),
	header: z.string().optional(),
	body: z.string().optional(),
	fetchOnload: z.boolean(),
})

export function DataSourceForm({
	mode,
	initialValues = {
		stateName: '',
		url: '',
		method: HttpMethod.GET,
		headers: '',
		body: '',
		id: '',
		properties: [],
		fetchOnload: true,
	},
}: {
	mode: 'add' | 'edit'
	initialValues?: DataSource
}) {
	const setPageState = usePageStates((store) => store.setState)
	const { addSource, editSource } = useDataSourceStore((store) => ({
		addSource: store.add,
		editSource: store.edit,
	}))
	const mutation = useMutation((url: string) => axios.get<AnyJson>(url))
	const form = useForm({ validate: zodResolver(schema), initialValues })
	const handleSubmit = form.onSubmit((values) => {
		mutation.mutate(values.url, {
			onSuccess: (data) => {
				const response = data.data
				const properties = findPropertyPaths(response)
				if (mode === 'add') {
					addSource({
						...values,
						id: nanoid(),
						properties: properties,
					})
				} else {
					editSource(initialValues.id, { ...values, properties })
				}
				setPageState(values.stateName, response)
				closeAllModals()
			},
		})
	})

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-2 gap-10">
			<div className="space-y-6">
				<TextInput
					label="State name"
					description="Unique state name for this data"
					required
					{...form.getInputProps('stateName')}
				/>
				<TextInput
					description="JSON API endpoint to fetch data from"
					label="URL"
					required
					{...form.getInputProps('url')}
				/>
				<Switch
					label="Fetch on page load"
					{...form.getInputProps('fetchOnload', { type: 'checkbox' })}
				/>
			</div>
			<div className="space-y-6">
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
			<Button className="col-span-2" fullWidth type="submit" loading={mutation.isLoading}>
				{_.capitalize(mode)}
			</Button>
		</form>
	)
}
