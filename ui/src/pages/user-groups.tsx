import { Button, Title } from '@mantine/core'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getProject, QueryKey } from '../api'
import { Modals, useModal } from '../features/hooks'
import { ContentWrapper, NewModal } from '../features/ui'
import { PageTitle } from '../features/ui/page-title'
import { UserGroups, UserGroupsForm, UserGroupValues } from '../features/user-groups'
import { AUTOMATION_PROJECT_NAME } from './automation'

export default function UserGroupsPage() {
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const projectQuery = useQuery([QueryKey.GetProject, projectName], () => getProject(projectName))
	const projectTag = projectQuery.data?.data.tag ?? ''
	const modals = useModal()
	const [defaultValues, setDefaultValues] = useState<UserGroupValues>()
	const title = defaultValues ? 'Edit User Group' : 'Create User Group'

	const helpDetails = {
		title: 'Use user groups to set permissions for your users',
		description:
			'With user groups you can control the access of your users to tables and interactions. Each user by default is assigned to the default user group of your project.',
		videoUrl: 'https://www.youtube.com/embed/_5GRK17KUrg',
		tutorialUrl: 'https://docs.dotenx.com/docs/builder_studio/files',
	}

	return (
		<>
			<ContentWrapper>
				<div className="flex justify-between">
					<PageTitle title="User Groups" helpDetails={helpDetails} />
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
