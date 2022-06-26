import _ from 'lodash'
import { IoAdd, IoCodeDownload } from 'react-icons/io5'
import { Link } from 'react-router-dom'
import { Automation, AutomationKind } from '../../api'
import { Endpoint } from '../database'
import { Modals, useModal } from '../hooks'
import { Button, DeleteButton, Modal, Table } from '../ui'
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
		<div className="grow">
			<div className="px-32 py-16">
				<Table
					title={title}
					emptyText={`You have no ${title.toLowerCase()} yet, try adding one.`}
					loading={loading}
					actionBar={<NewAutomation kind={_.capitalize(kind)} />}
					columns={[
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
					]}
					data={automations}
				/>
			</div>
		</div>
	)
}

function NewAutomation({ kind }: { kind: string }) {
	const newAutomation = useNewAutomation('new')

	return (
		<div className="flex gap-4">
			{kind === 'automation' && (
				<Link to="yaml/import">
					<Button className="max-w-min">
						<IoCodeDownload className="text-2xl" />
						Import YAML
					</Button>
				</Link>
			)}
			<Button className="max-w-min" onClick={newAutomation}>
				<IoAdd className="text-2xl" />
				New {kind}
			</Button>
		</div>
	)
}

function AutomationLink({ automationName }: { automationName: string }) {
	return (
		<Link className="hover:underline underline-offset-2" to={automationName}>
			{automationName}
		</Link>
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
		<>
			<div className="flex items-center justify-end gap-4">
				<div className="flex gap-4">
					{kind === 'template' && (
						<Button
							variant="outlined"
							onClick={() => modal.open(Modals.TemplateEndpoint)}
						>
							Endpoint
						</Button>
					)}
					<DeleteButton
						loading={deleteMutation.isLoading}
						onClick={() => deleteMutation.mutate(automationName)}
					/>
				</div>
			</div>
			<Modal kind={Modals.TemplateEndpoint} title="Endpoint" fluid size="lg">
				<div className="px-4 pt-6 pb-10">
					<Endpoint
						label="Add Automation"
						url={`https://api.dotenx.com/pipeline/template/name/${automationName}`}
						kind="POST"
					/>
				</div>
			</Modal>
		</>
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
