import { ActionIcon } from '@mantine/core'
import _ from 'lodash'
import { IoClose, IoPencil } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteUserGroup, getUserGroups, QueryKey } from '../../api'
import { Modals, useModal } from '../hooks'
import { UserGroupValues } from './form'

const defaultUserGroups = ['editors', 'users', 'readers', 'writers']

export function UserGroups({
	projectTag,
	onEdit,
}: {
	projectTag: string
	onEdit: (data: UserGroupValues) => void
}) {
	const modals = useModal()
	const userGroupsQuery = useQuery([QueryKey.GetUserGroups, projectTag], () =>
		getUserGroups(projectTag)
	)
	const client = useQueryClient()
	const deleteUserGroupMutation = useMutation(
		(userGroupName: string) => deleteUserGroup(projectTag, userGroupName),
		{ onSuccess: () => client.invalidateQueries(QueryKey.GetUserGroups) }
	)
	const userGroups = _.toPairs(userGroupsQuery.data?.data)

	return (
		<div className="grid grid-cols-4 gap-10">
			{userGroups.map(([name, details]) => (
				<div key={name} className="flex justify-between p-6 border rounded-md">
					<p>{name}</p>
					<div className="space-y-1">
						<ActionIcon
							type="button"
							className="text-sm"
							onClick={() => deleteUserGroupMutation.mutate(name)}
							size="xs"
							disabled={defaultUserGroups.includes(name)}
							title="Delete user group"
						>
							<IoClose />
						</ActionIcon>
						<ActionIcon
							type="button"
							className="text-sm"
							onClick={() => {
								const defaultValues: UserGroupValues = {
									name: name,
									select: [],
									update: [],
									delete: [],
								}
								if (defaultValues) {
									_.toPairs(details).forEach(([table, permissions]) => {
										permissions.forEach((permission) => {
											const permissionField =
												defaultValues[
													permission as 'select' | 'update' | 'delete'
												]
											if (permissionField) permissionField.push(table)
										})
									})
								}
								onEdit(defaultValues)
								modals.open(Modals.CreateUserGroup)
							}}
							size="xs"
							disabled={defaultUserGroups.includes(name)}
							title="Edit user group"
						>
							<IoPencil />
						</ActionIcon>
					</div>
				</div>
			))}
		</div>
	)
}
