import { ActionIcon, Anchor, Button } from '@mantine/core'
import _ from 'lodash'
import { IoAdd, IoCodeDownload, IoTrash } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import {
	API_URL,
	Automation,
	AutomationKind,
	EndpointFields,
	getInteractionEndpointFields,
	getTemplateEndpointFields,
	QueryKey,
} from '../../api'
import { Modals, useModal } from '../hooks'
import { ContentWrapper, Endpoint, Loader, Modal, Table } from '../ui'
import { useDeleteAutomation } from './use-delete'
import { useNewAutomation } from './use-new'

interface AutomationListProps {
	automations?: Automation[]
	loading: boolean
	title: string
	kind: AutomationKind
}

export function AutomationList({ automations, loading, title, kind }: AutomationListProps) {
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
								Header: 'Action',
								id: 'action',
								accessor: 'name',
								Cell: ({ value }: { value: string }) => (
									<AutomationActions automationName={value} kind={kind} />
								),
							},
						] as const
					).filter((col) => (kind !== 'automation' ? col.Header !== 'Status' : true))}
					data={automations}
				/>
			</ContentWrapper>
			<Modal kind={Modals.TemplateEndpoint} title="Endpoint" fluid size="lg">
				{(data: { automationName: string }) => (
					<>
						{kind === 'template' && (
							<TemplateEndpoint automationName={data.automationName} />
						)}
						{kind === 'interaction' && (
							<InteractionEndpoint automationName={data.automationName} />
						)}
					</>
				)}
			</Modal>
		</>
	)
}

function NewAutomation({ kind }: { kind: AutomationKind }) {
	const newAutomation = useNewAutomation('new')
	const newButtonText = kind === 'template' ? 'Automation' : kind

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
	automationName: string
	kind: AutomationKind
}

function AutomationActions({ automationName, kind }: AutomationActionsProps) {
	const deleteMutation = useDeleteAutomation()
	const modal = useModal()

	return (
		<div className="flex items-center justify-end gap-4">
			{kind !== 'automation' && (
				<Button
					onClick={() => modal.open(Modals.TemplateEndpoint, { automationName })}
					variant="subtle"
					size="xs"
				>
					Endpoint
				</Button>
			)}
			<ActionIcon
				color="rose"
				loading={deleteMutation.isLoading}
				onClick={() => deleteMutation.mutate(automationName)}
			>
				<IoTrash />
			</ActionIcon>
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
	const fieldsQuery = useQuery(
		[QueryKey.GetTemplateEndpointFields, automationName],
		() => getTemplateEndpointFields(automationName),
		{ enabled: !!automationName }
	)
	const fields = fieldsQuery.data?.data
	const body = _.fromPairs(mapFieldsToPairs(fields))

	if (fieldsQuery.isLoading || !fields) return <Loader />

	return (
		<Endpoint
			label="Add an automation"
			url={`${API_URL}/pipeline/template/name/${automationName}`}
			kind="POST"
			code={body}
		/>
	)
}

function InteractionEndpoint({ automationName }: { automationName: string }) {
	const query = useQuery(
		[QueryKey.GetInteractionEndpointFields, automationName],
		() => getInteractionEndpointFields(automationName),
		{ enabled: !!automationName }
	)
	const pairs = mapFieldsToPairs(query.data?.data)
	const body = pairs?.length === 0 ? {} : { interactionRunTime: _.fromPairs(pairs) }

	if (query.isLoading) return <Loader />

	return (
		<Endpoint
			label="Run interaction"
			url={`${API_URL}/execution/name/${automationName}/start`}
			kind="POST"
			code={body}
		/>
	)
}

const mapFieldsToPairs = (fields?: EndpointFields) => {
	return _.toPairs(fields).map(([nodeName, fields]) => [
		nodeName,
		_.fromPairs(fields.map((field) => [field, field])),
	])
}
