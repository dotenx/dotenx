import { useState } from "react"
import { useQuery } from "react-query"
import { useParams } from "react-router-dom"
import { getProject, QueryKey } from "../api"
import { Modals, useModal } from "../features/hooks"
import { AddButton, NewModal } from "../features/ui"
import { UserGroups, UserGroupsForm, UserGroupValues } from "../features/user-groups"
import { AUTOMATION_PROJECT_NAME } from "./automation"

export default function UserGroupsWrapper() {
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const projectQuery = useQuery([QueryKey.GetProject, projectName], () => getProject(projectName))
	const projectTag = projectQuery.data?.data.tag ?? ""
	const modals = useModal()
	const [defaultValues, setDefaultValues] = useState<UserGroupValues>()
	const title = defaultValues ? "Edit User Group" : "Create User Group"

	const helpDetails = {
		title: "Use user groups to set permissions for your users",
		description:
			"With user groups you can control the access of your users to tables and interactions. Each user by default is assigned to the default user group of your project.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/files",
	}

	return (
		<div>
			<div className="w-full mb-5	">
				<AddButton
					handleClick={() => {
						modals.open(Modals.CreateUserGroup)
						setDefaultValues(undefined)
					}}
					text="Add User Group"
				/>
			</div>
			<UserGroups projectTag={projectTag} onEdit={setDefaultValues} />
			<NewModal size="md" kind={Modals.CreateUserGroup} title={title}>
				<UserGroupsForm
					projectName={projectName}
					projectTag={projectTag}
					defaultValues={defaultValues}
					kind={defaultValues ? "update" : "create"}
				/>
			</NewModal>
		</div>
	)
}
