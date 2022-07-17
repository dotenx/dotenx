import { Button, MultiSelect, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import _ from 'lodash'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { z } from 'zod'
import { createUserGroup, CreateUserGroupRequest, getTables, QueryKey } from '../../api'
import { useModal } from '../hooks'
import { Form } from '../ui'

const schema = z.object({
	name: z.string().min(1),
	select: z.array(z.string().min(1)),
	update: z.array(z.string().min(1)),
	delete: z.array(z.string().min(1)),
})

export type UserGroupValues = z.infer<typeof schema>

export function UserGroupsForm({
	projectName,
	projectTag,
	defaultValues = { name: '', select: [], update: [], delete: [] },
}: {
	projectName: string
	projectTag: string
	defaultValues?: { name: string; select: string[]; update: string[]; delete: string[] }
}) {
	const client = useQueryClient()
	const modal = useModal()
	const mutation = useMutation(
		(payload: CreateUserGroupRequest) => createUserGroup(projectTag, payload),
		{
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetUserGroups)
				modal.close()
			},
		}
	)
	const tablesQuery = useQuery([QueryKey.GetTables, projectName], () => getTables(projectName))
	const tables = tablesQuery.data?.data.tables ?? []
	const form = useForm<UserGroupValues>({
		schema: zodResolver(schema),
		initialValues: defaultValues,
	})
	const onSubmit = form.onSubmit((values) =>
		mutation.mutate({
			name: values.name,
			select: _.fromPairs(values.select.map((tableName) => [tableName, tableName])),
			update: _.fromPairs(values.update.map((tableName) => [tableName, tableName])),
			delete: _.fromPairs(values.delete.map((tableName) => [tableName, tableName])),
		})
	)

	return (
		<Form onSubmit={onSubmit}>
			<div className="space-y-5">
				<TextInput label="Name" {...form.getInputProps('name')} />
				<MultiSelect
					searchable
					clearable
					label="Select"
					data={tables}
					{...form.getInputProps('select')}
				/>
				<MultiSelect
					searchable
					clearable
					label="Update"
					data={tables}
					{...form.getInputProps('update')}
				/>
				<MultiSelect
					searchable
					clearable
					label="Delete"
					data={tables}
					{...form.getInputProps('delete')}
				/>
			</div>
			<Button type="submit" loading={mutation.isLoading}>
				Add User Group
			</Button>
		</Form>
	)
}
