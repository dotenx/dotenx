import { ActionIcon, Anchor, Button, Checkbox, MultiSelect, Drawer } from '@mantine/core'
import { useForm } from '@mantine/form'
import { CellProps } from 'react-table'
import { format } from 'date-fns'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { IoCodeDownload, IoTrash } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
	API_URL,
	Automation,
	AutomationKind,
	EndpointFields,
	Execution,
	getAutomationExecutions,
	getInteractionEndpointFields,
	getProject,
	getTemplateEndpointFields,
	getUserGroups,
	QueryKey,
	setAccess,
	setInteractionUserGroup,
} from '../../api'
import { AUTOMATION_PROJECT_NAME } from '../../pages/automation'
import { Modals, useModal } from '../hooks'
import { AddButton, Confirm, Endpoint, Form, Loader, Modal, NewModal, Table } from '../ui'
import { HelpDetails } from '../ui/help-popover'
import { useDeleteAutomation } from './use-delete'
import { useNewAutomation } from './use-new'

interface AutomationListProps {
	automations?: Automation[]
	loading: boolean
	title: string
	subtitle?: string
	kind: AutomationKind
	helpDetails?: HelpDetails
}

export function AutomationList({
	automations,
	loading,
	title,
	subtitle,
	kind,
	helpDetails,
}: AutomationListProps) {
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
	const { mutate: mutateAutomationHistory, isLoading: loadingAutomationHistory } = useMutation(
		getAutomationExecutions,
		{
			onSuccess: (data) => {
				setAutomationHistory(data.data), setOpenHistory(true)
			},
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
	const navigate = useNavigate()

	const [defaultUserGroups, setDefaultUserGroups] = useState([])
	const { onSubmit, ...form } = useForm()
	useEffect(() => {
		form.setValues({ userGroups: defaultUserGroups })
	}, [defaultUserGroups])

	const [openHistory, setOpenHistory] = useState(false)
	const [automationName, setAutomationName] = useState('')
	const [automationHistory, setAutomationHistory] = useState<any>([])

	return (
		<div>
			<NewAutomation kind={kind} />
			<Table
				emptyText={`You have no ${title.toLowerCase()} yet, try adding one.`}
				loading={loading || loadingAutomationHistory}
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
							Header: 'User account',
							accessor: 'created_for',
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
							Header: 'Created automations',
							id: 'Created automations',
							accessor: 'name',
							Cell: ({ value, row }: { value: string; row: any }) => (
								<Button
									onClick={() => navigate(`${value}/automations`)}
									variant="subtle"
									color="gray"
									size="xs"
								>
									Show
								</Button>
							),
						},
						{
							Header: 'History',
							id: 'automation history',
							accessor: 'name',
							Cell: ({ value }: { value: string }) => (
								<Button
									onClick={() => {
										mutateAutomationHistory({
											name: value,
											projectName,
										}),
											setAutomationName(value)
									}}
									variant="subtle"
									color="gray"
									size="xs"
								>
									Show
								</Button>
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
						(!['automation', 'template_automations'].includes(kind)
							? col.Header !== 'Status'
							: true) &&
						(kind !== 'interaction' ? !['Public'].includes(col.Header) : true) &&
						(!['interaction', 'template'].includes(kind)
							? !['User groups'].includes(col.Header)
							: true) &&
						(kind !== 'template' ? col.Header !== 'Created automations' : true) &&
						(kind === 'template_automations' ? col.Header !== 'Name' : true) &&
						(kind !== 'template_automations'
							? !['History', 'User account'].includes(col.Header)
							: true)
				)}
				data={automations}
			/>
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
						<p className="my-6">Select which user groups can access this {kind}</p>
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

			<Drawer
				opened={openHistory}
				onClose={() => setOpenHistory(false)}
				title="Automation History"
				padding="xl"
				size="xl"
				position="right"
			>
				<div className="overflow-y-auto h-full pb-20 ">
					<Table
						title=""
						columns={[
							{
								Header: 'Date',
								Cell: (props: CellProps<Execution>) => (
									<Link
										className="rounded hover:bg-slate-50"
										to={`/builder/projects/${projectName}/automations/${automationName}/executions/${props.row.original.Id}`}
									>
										<span>
											{format(
												new Date(props.row.original.StartedAt),
												'yyyy/MM/dd'
											)}
										</span>
										<span className="ml-4 text-xs">
											{format(
												new Date(props.row.original.StartedAt),
												'HH:mm:ss'
											)}
										</span>
									</Link>
								),
							},
							{ Header: 'ID', accessor: 'Id' },
						]}
						data={automationHistory}
						emptyText={`This ${kind} has no execution history yet.`}
					/>
				</div>
			</Drawer>
		</div>
	)
}

function NewAutomation({ kind }: { kind: AutomationKind }) {
	const newAutomation = useNewAutomation(kind)
	const newButtonText = kind === 'template' ? 'Automation Template' : kind

	if (kind === 'template_automations') return null
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
			<AddButton handleClick={newAutomation} text={`New ${_.capitalize(newButtonText)}`} />
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
			{!['automation', 'template_automations'].includes(kind) && (
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
				url={`${API_URL}/execution/project/${projectName}/name/${automationName}/start`}
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
