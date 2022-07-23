import { ActionIcon, Badge, Button, Popover } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import _ from 'lodash'
import { useState } from 'react'
import { IoClose, IoPencil } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteUserGroup, getUserGroups, QueryKey, UserGroup } from '../../api'
import { Modals, useModal } from '../hooks'
import { NewModal } from '../ui'
import { UserGroupDetails } from './details'
import { UserGroupValues } from './form'

const defaultUserGroups = ['editors', 'users', 'readers', 'writers']

export function UserGroups({
	projectTag,
	onEdit,
}: {
	projectTag: string
	onEdit: (data: UserGroupValues) => void
}) {
	const userGroupsQuery = useQuery(
		[QueryKey.GetUserGroups, projectTag],
		() => getUserGroups(projectTag),
		{ enabled: !!projectTag }
	)
	const client = useQueryClient()
	const deleteUserGroupMutation = useMutation(
		(userGroupName: string) => deleteUserGroup(projectTag, userGroupName),
		{ onSuccess: () => client.invalidateQueries(QueryKey.GetUserGroups) }
	)
	const userGroups = _.toPairs(userGroupsQuery.data?.data)
	const [userGroupDetails, setUserGroupDetails] = useState<UserGroupValues>()

	return (
		<>
			<div className="grid grid-cols-1 gap-10 lg:grid-cols-3 xl:grid-cols-4">
				{userGroups.map(([name, details]) => (
					<UserGroupItem
						key={name}
						name={name}
						details={details}
						onEdit={onEdit}
						onDelete={() => deleteUserGroupMutation.mutate(name)}
						onShowDetails={(details) => setUserGroupDetails(details)}
					/>
				))}
			</div>
			<NewModal kind={Modals.UserGroupDetails} title={userGroupDetails?.name} size="xl">
				{userGroupDetails && <UserGroupDetails details={userGroupDetails} />}
			</NewModal>
		</>
	)
}

function UserGroupItem({
	name,
	details,
	onEdit,
	onDelete,
	onShowDetails,
}: {
	name: string
	details: UserGroup
	onEdit: (data: UserGroupValues) => void
	onDelete: () => void
	onShowDetails: (details: UserGroupValues) => void
}) {
	const modal = useModal()
	const defaultValues: UserGroupValues = {
		name: name,
		description: '',
		select: [],
		update: [],
		delete: [],
	}
	_.toPairs(details).forEach(([table, permissions]) => {
		permissions.forEach((permission) => {
			const permissionField = defaultValues[permission as 'select' | 'update' | 'delete']
			if (permissionField) permissionField.push(table)
		})
	})
	const [deleteConfirmationOpened, deleteConfirmationHandlers] = useDisclosure(false)

	return (
		<div className="px-4 py-3 space-y-2 border rounded-md">
			<div className="flex items-center justify-between">
				<button
					className="font-medium hover:bg-gray-50"
					type="button"
					onClick={() => {
						onShowDetails(defaultValues)
						modal.open(Modals.UserGroupDetails)
					}}
				>
					{name}
				</button>
				{!defaultUserGroups.includes(name) ? (
					<div className="flex gap-1">
						<ActionIcon
							type="button"
							className="text-sm"
							onClick={() => {
								onEdit(defaultValues)
								modal.open(Modals.CreateUserGroup)
							}}
							size="xs"
							title="Edit user group"
						>
							<IoPencil />
						</ActionIcon>
						<Popover
							opened={deleteConfirmationOpened}
							onClose={deleteConfirmationHandlers.close}
							target={
								<ActionIcon
									type="button"
									className="text-sm"
									onClick={deleteConfirmationHandlers.open}
									size="xs"
									title="Delete user group"
								>
									<IoClose />
								</ActionIcon>
							}
							withArrow
							position="bottom"
						>
							<div className="flex flex-col gap-6">
								<p className="text-sm">
									Are you sure you want to delete this user group?
								</p>
								<Button type="button" onClick={onDelete}>
									Confirm Delete
								</Button>
							</div>
						</Popover>
					</div>
				) : (
					<Badge size="xs" color="gray">
						Default
					</Badge>
				)}
			</div>
			<p className="overflow-hidden text-xs text-slate-500 text-ellipsis">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, veritatis? Numquam
				sit, impedit asperiores sunt cum voluptatem distinctio a consequuntur autem et?
				Dolor optio, ex at ea repellendus numquam quae?
			</p>
		</div>
	)
}
