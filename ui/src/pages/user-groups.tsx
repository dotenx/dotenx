import { Button, Title } from '@mantine/core'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getProject, QueryKey } from '../api'
import { Modals, useModal } from '../features/hooks'
import { ContentWrapper, NewModal } from '../features/ui'
import { UserGroups, UserGroupsForm, UserGroupValues } from '../features/user-groups'

export default function UserGroupsPage() {
	const { projectName = '' } = useParams()
	const projectQuery = useQuery([QueryKey.GetProject, projectName], () => getProject(projectName))
	const projectTag = projectQuery.data?.data.tag ?? ''
	const modals = useModal()
	const [defaultValues, setDefaultValues] = useState<UserGroupValues>()
	const title = defaultValues ? 'Edit User Group' : 'Create User Group'

	return (
		<>
			<ContentWrapper>
				<div className="flex justify-between">
					<Title order={2}>User Groups</Title>
					<Button
						type="button"
						onClick={() => {
							modals.open(Modals.CreateUserGroup)
							setDefaultValues(undefined)
						}}
					>
						Create User Group
					</Button>
				</div>
				<UserGroups projectTag={projectTag} onEdit={setDefaultValues} />
			</ContentWrapper>
			<NewModal size="xl" kind={Modals.CreateUserGroup} title={title}>
				<UserGroupsForm
					projectName={projectName}
					projectTag={projectTag}
					defaultValues={defaultValues}
					kind={defaultValues ? 'update' : 'create'}
				/>
			</NewModal>
		</>
	)
}
