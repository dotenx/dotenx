import { Button, MultiSelect, Textarea, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import _ from 'lodash'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { z } from 'zod'
import {
	createUserGroup,
	CreateUserGroupRequest,
	getTables,
	QueryKey,
	updateUserGroup,
	UpdateUserGroupRequest,
} from '../../api'
import { useModal } from '../hooks'
import { Form } from '../ui'

const schema = z.object({
	name: z.string().min(1),
	description: z.string(),
	select: z.array(z.string().min(1)),
	update: z.array(z.string().min(1)),
	delete: z.array(z.string().min(1)),
	insert: z.array(z.string().min(1)),
})

export type UserGroupValues = z.infer<typeof schema>

export function UserGroupsForm({
	projectName,
	projectTag,
	defaultValues = { name: '', description: '', select: [], update: [], delete: [], insert: [] },
	kind,
}: {
	projectName: string
	projectTag: string
	defaultValues?: UserGroupValues
	kind: 'create' | 'update'
}) {
	const client = useQueryClient()
	const modal = useModal()
	const createMutation = useMutation(
		(payload: CreateUserGroupRequest) => createUserGroup(projectTag, payload),
		{
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetUserGroups)
				modal.close()
			},
		}
	)
	const updateMutation = useMutation(
		(payload: UpdateUserGroupRequest) => updateUserGroup(projectTag, payload),
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
		validate: zodResolver(schema),
		initialValues: defaultValues,
	})
	const onSubmit = form.onSubmit((values) => {
		if (kind === 'create')
			createMutation.mutate({
				name: values.name,
				description: values.description,
				select: _.fromPairs(values.select.map((tableName) => [tableName, tableName])),
				update: _.fromPairs(values.update.map((tableName) => [tableName, tableName])),
				delete: _.fromPairs(values.delete.map((tableName) => [tableName, tableName])),
				insert: _.fromPairs(values.insert.map((tableName) => [tableName, tableName])),
			})
		else
			updateMutation.mutate({
				name: values.name,
				description: values.description,
				select: _.fromPairs(values.select.map((tableName) => [tableName, tableName])),
				update: _.fromPairs(values.update.map((tableName) => [tableName, tableName])),
				delete: _.fromPairs(values.delete.map((tableName) => [tableName, tableName])),
				insert: _.fromPairs(values.insert.map((tableName) => [tableName, tableName])),
			})
	})

	return (
		<Form onSubmit={onSubmit}>
			<div className="space-y-5">
				<TextInput
					label="Name"
					disabled={kind === 'update'}
					{...form.getInputProps('name')}
				/>
				<Textarea label="Description" {...form.getInputProps('description')} />
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
				<MultiSelect
					searchable
					clearable
					label="Insert"
					data={tables}
					{...form.getInputProps('insert')}
				/>
			</div>
			<Button type="submit" loading={createMutation.isLoading || updateMutation.isLoading}>
				{kind === 'update' ? 'Edit User Group' : 'Add User Group'}
			</Button>
		</Form>
	)
}
