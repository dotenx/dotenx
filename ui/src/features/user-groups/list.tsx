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
				<div key={name} className="px-4 py-3 space-y-2 border rounded-md">
					<div className="flex justify-between">
						<p className="">{name}</p>
						{!defaultUserGroups.includes(name) && (
							<div className="flex gap-1">
								<ActionIcon
									type="button"
									className="text-sm"
									onClick={() => {
										const defaultValues: UserGroupValues = {
											name: name,
											description: '',
											select: [],
											update: [],
											delete: [],
										}
										if (defaultValues) {
											_.toPairs(details).forEach(([table, permissions]) => {
												permissions.forEach((permission) => {
													const permissionField =
														defaultValues[
															permission as
																| 'select'
																| 'update'
																| 'delete'
														]
													if (permissionField) permissionField.push(table)
												})
											})
										}
										onEdit(defaultValues)
										modals.open(Modals.CreateUserGroup)
									}}
									size="xs"
									title="Edit user group"
								>
									<IoPencil />
								</ActionIcon>
								<ActionIcon
									type="button"
									className="text-sm"
									onClick={() => deleteUserGroupMutation.mutate(name)}
									size="xs"
									title="Delete user group"
								>
									<IoClose />
								</ActionIcon>
							</div>
						)}
					</div>
					<p className="overflow-hidden text-xs text-slate-500 text-ellipsis">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, veritatis?
						Numquam sit, impedit asperiores sunt cum voluptatem distinctio a
						consequuntur autem et? Dolor optio, ex at ea repellendus numquam quae?
					</p>
				</div>
			))}
		</div>
	)
}
