import { ActionIcon, Anchor, Button, Checkbox, MultiSelect } from '@mantine/core'
import { useForm } from '@mantine/form'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { IoAdd, IoCodeDownload, IoTrash } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import {
	API_URL,
	Automation,
	AutomationKind,
	EndpointFields,
	getInteractionEndpointFields,
	getProject,
	getTemplateEndpointFields,
	getUserGroups,
	QueryKey,
	setAccess,
	setInteractionUserGroup
} from '../../api'
import { AUTOMATION_PROJECT_NAME } from '../../pages/automation'
import { Modals, useModal } from '../hooks'
import { Confirm, ContentWrapper, Endpoint, Form, Loader, Modal, NewModal, Table } from '../ui'
import { useDeleteAutomation } from './use-delete'
import { useNewAutomation } from './use-new'

interface AutomationListProps {
	automations?: Automation[]
	loading: boolean
	title: string
	kind: AutomationKind
}

export function AutomationList({ automations, loading, title, kind }: AutomationListProps) {
	const modal = useModal()
	const client = useQueryClient()
	const [rowData, setRowData] = useState({ value: false, name: '' })
	const { mutate } = useMutation(setAccess, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetAutomations),
	})
	const { mutate: mutateInteractionUserGroup, isLoading: isUserGroupLoading } = useMutation(
		setInteractionUserGroup,
		{
			onSuccess: () => client.invalidateQueries(QueryKey.GetAutomations),
		}
	)

	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const projectQuery = useQuery([QueryKey.GetProject, projectName], () => getProject(projectName))
	const projectTag = projectQuery.data?.data.tag ?? ''

	const [userGroupsOptions, setUserGroupsOptions] = useState([{ label: '', value: '' }])
	useQuery([QueryKey.GetUserGroups, projectTag], () => getUserGroups(projectTag), {
		onSuccess: (data) => {
			const userGroups = Object.values(data.data)
			const userGroupsOptions = userGroups?.map((g) => ({ label: g.name, value: g.name }))
			setUserGroupsOptions(userGroupsOptions)
		},
		enabled: !!projectTag,
	})

	const [defaultUserGroups, setDefaultUserGroups] = useState([])
	const { onSubmit, ...form } = useForm()
	useEffect(() => {
		form.setValues({ userGroups: defaultUserGroups })
	}, [defaultUserGroups])

	return (
		<>
			<ContentWrapper>
				<Table
					title={title}
					emptyText={`You have no ${title.toLowerCase()} yet, try adding one.`}
					loading={loading}
					actionBar={<NewAutomation kind={kind} />}
					columns={(
						[
							{
								Header: 'Name',
								accessor: 'name',
								Cell: ({ value }: { value: string }) => (
									<AutomationLink automationName={value} />
								),
							},
							{
								Header: 'Status',
								accessor: 'is_active',
								Cell: ({ value }: { value: boolean }) => (
									<ActivationStatus isActive={value} />
								),
							},
							{
								Header: 'Public',
								accessor: 'is_public',
								Cell: ({ value, row }: { value: boolean; row: any }) => (
									<Checkbox
										readOnly
										checked={value}
										onClick={() => {
											setRowData({
												value: value,
												name: row.original.name,
											}),
												modal.open(Modals.ConfirmCheckbox)
										}}
									/>
								),
							},
							{
								Header: 'User groups',
								accessor: 'user_groups',
								Cell: ({ value, row }: { value: string[]; row: any }) => (
									<div
										className={`text-slate-700 ${
											row.original.is_public
												? 'pointer-events-none pl-6'
												: 'cursor-pointer hover:opacity-80 text-xs font-medium '
										}`}
										onClick={() => {
											setDefaultUserGroups(row.original.user_groups)
											modal.open(Modals.InteractionUserGroup, {
												name: row.original.name,
												userGroup: value,
											})
										}}
									>
										{row.original.is_public ? '_' : 'Show / Edit'}
									</div>
								),
							},
							{
								Header: 'Action',
								id: 'action',
								accessor: 'name',
								Cell: ({ value, row }: { value: string; row: any }) => (
									<AutomationActions
										automationName={value}
										endpoint={row.original.endpoint}
										isPublic={row.original.is_public}
										kind={kind}
									/>
								),
							},
						] as const
					).filter(
						(col) =>
							(kind !== 'automation' ? col.Header !== 'Status' : true) &&
							(kind !== 'interaction'
								? !['Public', 'User groups'].includes(col.Header)
								: true)
					)}
					data={automations}
				/>
			</ContentWrapper>
			<Modal kind={Modals.TemplateEndpoint} title="Endpoint" size="lg">
				{(data: { automationName: string; endpoint: string; isPublic: boolean }) => (
					<>
						{kind === 'template' && (
							<TemplateEndpoint automationName={data.automationName} />
						)}
						{kind === 'interaction' && (
							<InteractionEndpoint
								automationName={data.automationName}
								endpoint={data.endpoint}
								isPublic={data.isPublic}
							/>
						)}
					</>
				)}
			</Modal>
			<NewModal kind={Modals.ConfirmCheckbox} title="Change interaction access" size="xl">
				<h2>
					Are you sure you want to change{' '}
					<span className="text-sky-900">{rowData.name}</span> interaction access to{' '}
					{rowData.value ? 'private' : 'public'}?
				</h2>
				<div className="flex items-center justify-end">
					<Button
						className="mr-2"
						onClick={() => modal.close()}
						variant="subtle"
						color="gray"
						size="xs"
					>
						cancel
					</Button>
					<Button
						onClick={() => {
							mutate({
								name: rowData.name,
								isPublic: rowData.value,
								projectName,
							}),
								modal.close()
						}}
						size="xs"
					>
						confirm
					</Button>
				</div>
			</NewModal>

			<Modal fluid kind={Modals.InteractionUserGroup} title="User groups" size="md">
				{(data: { name: string; userGroup: string[] }) => (
					<div className="flex flex-col">
						<p className="my-6">Select which user groups can access this interaction</p>
						<Form
							className="h-full"
							onSubmit={onSubmit((values) =>
								mutateInteractionUserGroup(
									{
										name: data.name,
										payload: values,
										projectName,
									},
									{ onSuccess: () => modal.close() }
								)
							)}
						>
							<div className="flex flex-col gap-5 pb-10 grow ">
								<MultiSelect
									searchable
									clearable
									label="Select"
									data={userGroupsOptions}
									{...form.getInputProps('userGroups')}
								/>
							</div>
							<Button loading={isUserGroupLoading} className="w-full" type="submit">
								Save
							</Button>
						</Form>
					</div>
				)}
			</Modal>
		</>
	)
}

function NewAutomation({ kind }: { kind: AutomationKind }) {
	const newAutomation = useNewAutomation('new')
	const newButtonText = kind === 'template' ? 'Automation Template' : kind

	return (
		<div className="flex gap-4">
			{kind === 'automation' && (
				<Button
					component={Link}
					to="yaml/import"
					leftIcon={<IoCodeDownload className="text-xl" />}
				>
					Import YAML
				</Button>
			)}
			<Button onClick={newAutomation} leftIcon={<IoAdd className="text-xl" />}>
				New {_.capitalize(newButtonText)}
			</Button>
		</div>
	)
}

function AutomationLink({ automationName }: { automationName: string }) {
	return (
		<Anchor component={Link} to={automationName}>
			{automationName}
		</Anchor>
	)
}

interface AutomationActionsProps {
	endpoint: string
	isPublic: boolean
	automationName: string
	kind: AutomationKind
}

function AutomationActions({ automationName, kind, endpoint, isPublic }: AutomationActionsProps) {
	const deleteMutation = useDeleteAutomation()
	const modal = useModal()
	const textKind = kind === 'template' ? 'automation template' : kind
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()

	return (
		<div className="flex items-center justify-end gap-4">
			{kind !== 'automation' && (
				<Button
					onClick={() =>
						modal.open(Modals.TemplateEndpoint, { automationName, endpoint, isPublic })
					}
					variant="subtle"
					color="gray"
					size="xs"
				>
					Endpoint
				</Button>
			)}
			<Confirm
				confirmText={`Are you sure you want to delete this ${textKind}?`}
				onConfirm={() => deleteMutation.mutate({ name: automationName, projectName })}
				target={(open) => (
					<ActionIcon loading={deleteMutation.isLoading} onClick={open}>
						<IoTrash />
					</ActionIcon>
				)}
			/>
		</div>
	)
}

function ActivationStatus({ isActive }: { isActive: boolean }) {
	return isActive ? (
		<span className="px-2 py-1 text-xs font-extrabold text-green-600 rounded-md bg-green-50">
			Active
		</span>
	) : (
		<span className="px-2 py-1 text-xs font-extrabold text-gray-600 rounded-md bg-gray-50">
			Inactive
		</span>
	)
}

function TemplateEndpoint({ automationName }: { automationName: string }) {
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const fieldsQuery = useQuery(
		[QueryKey.GetTemplateEndpointFields, automationName, projectName],
		() => getTemplateEndpointFields({ projectName, templateName: automationName }),
		{ enabled: !!automationName }
	)
	const fields = fieldsQuery.data?.data
	const body = _.fromPairs(mapFieldsToPairs(fields))

	if (fieldsQuery.isLoading || !fields) return <Loader />

	return (
		<Endpoint
			label="Add an automation"
			url={`${API_URL}/pipeline/project/${projectName}/template/name/${automationName}`}
			method="POST"
			code={body}
		/>
	)
}

function InteractionEndpoint({
	automationName,
	isPublic,
	endpoint,
}: {
	automationName: string
	isPublic: boolean
	endpoint: string
}) {
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const query = useQuery(
		[QueryKey.GetInteractionEndpointFields, automationName, projectName],
		() => getInteractionEndpointFields({ interactionName: automationName, projectName }),
		{ enabled: !!automationName }
	)
	const pairs = mapFieldsToPairs(query.data?.data)
	const body = pairs?.length === 0 ? {} : { interactionRunTime: _.fromPairs(pairs) }

	if (query.isLoading) return <Loader />

	return (
		<div className="grid grid-cols-1 space-y-4">
			<Endpoint
				label="Run interaction"
				url={`${API_URL}/execution/name/${automationName}/start`}
				method="POST"
				code={body}
			/>

			{isPublic && (
				<Endpoint
					label="Run interaction (public access)"
					url={`${API_URL}/public/execution/ep/${endpoint}/start`}
					method="POST"
					code={body}
				/>
			)}
		</div>
	)
}

const mapFieldsToPairs = (fields?: EndpointFields) => {
	return _.toPairs(fields).map(([nodeName, fields]) => [
		nodeName,
		_.fromPairs(fields.map((field) => [field, field])),
	])
}
