/* eslint-disable no-mixed-spaces-and-tabs */
import { ActionIcon, Button } from "@mantine/core"
import { openModal } from "@mantine/modals"
import _ from "lodash"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { IoAdd, IoFilter, IoList, IoPencil, IoReload, IoSearch, IoTrash } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { Navigate, useParams } from "react-router-dom"
import { CellProps } from "react-table"
import {
	API_URL,
	deleteColumn,
	deleteRecord,
	Filters,
	getColumns,
	getProject,
	getTableRecords,
	GetTableRecordsRequest,
	QueryKey,
	TableRecord,
} from "../api"
import {
	ColumnForm,
	EditRecordForm,
	QueryBuilder,
	QueryBuilderValues,
	RecordForm,
	TableDeletion,
	TableEndpoints,
<<<<<<< HEAD
} from '../features/database'
import { Modals, useModal } from '../features/hooks'
import { Content_Wrapper, Drawer, Endpoint, Header, Modal, NewModal, Table } from '../features/ui'
import { ViewForm } from '../features/views/view-form'
=======
} from "../features/database"
import { Modals, useModal } from "../features/hooks"
import { Drawer, Endpoint, Modal, NewModal, Table } from "../features/ui"
import { ViewForm } from "../features/views/view-form"
>>>>>>> main

export default function TablePage() {
	const { projectName, tableName } = useParams()
	if (!projectName || !tableName) return <Navigate to="/builder/projects" replace />

	return <TableContent projectName={projectName} tableName={tableName} />
}

function TableContent({ projectName, tableName }: { projectName: string; tableName: string }) {
	const [currentPage, setCurrentPage] = useState(1)

	const modal = useModal()
	const [filters, setFilters] = useState<GetTableRecordsRequest>({ columns: [] })
	const projectDetails = useQuery(QueryKey.GetProject, () => getProject(projectName))
	const projectTag = projectDetails.data?.data.tag ?? ""
	const columnsQuery = useQuery(QueryKey.GetColumns, () => getColumns(projectName, tableName))
	const recordsQuery = useQuery(
		[QueryKey.GetTableRecords, projectTag, tableName, filters, currentPage],
		() => getTableRecords(projectTag, tableName, currentPage, filters),
		{ enabled: !!projectTag }
	)

	const nPages = Math.ceil((recordsQuery.data?.data?.totalRows as number) / 10)

	const records = (recordsQuery.data?.data?.rows || []).map((record) =>
		_.fromPairs(
			_.toPairs(record).map(([key, value]) =>
				typeof value === "boolean"
					? [key, value ? "Yes" : "No"]
					: _.isArray(value)
					? [key, value.join(", ")]
					: typeof value === "object"
					? [key, JSON.stringify(value)]
					: [key, value]
			)
		)
	)
	const columns = columnsQuery.data?.data.columns ?? []
	const headers =
		columns.map((column) => ({
			Header: <Column projectName={projectName} tableName={tableName} name={column.name} />,
			accessor: column.name,
		})) ?? []
	const tableHeaders = !records[0]?.id
		? headers
		: [
				...headers,
				{
					Header: "Actions",
					accessor: "___actions___",
					Cell: (props: CellProps<TableRecord>) => (
						<RecordActions
							projectTag={projectTag}
							tableName={tableName}
							data={props.row.original}
						/>
					),
				},
		  ]
	const formColumns = columns.filter(
		(column) => column.name !== "id" && column.name !== "creator_id"
	)

	const helpDetails = {
		title: `You can manage your table's records or find the data manipulation endpoints here`,
		description:
			"You can also add new columns or delete existing ones. Use the column types that best fit your data. Use the query builder to filter the records with simple or complex conditions.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/files",
	}

	return (
		<div>
			<Header
				headerLink={`/builder/projects/${projectName}/tables`}
				expand
				title={'Tables'}
				activeTab={tableName}
				tabs={[tableName]}
			>
				<ActionBar projectName={projectName} tableName={tableName} />
			</Header>
			<Content_Wrapper expand>
				<Table
					withPagination
					currentPage={currentPage}
					nPages={nPages}
					setCurrentPage={setCurrentPage}
					helpDetails={helpDetails}
<<<<<<< HEAD
					columns={tableHeaders}
=======
					title={`Table ${tableName}`}
					columns={tableHeaders as any}
>>>>>>> main
					data={records}
					loading={recordsQuery.isLoading || columnsQuery.isLoading}
				/>
			</Content_Wrapper>

			<NewModal kind={Modals.NewColumn} title="New Column">
				<ColumnForm projectName={projectName} tableName={tableName} />
			</NewModal>
			<NewModal kind={Modals.NewRecord} title="New Record">
				<RecordForm columns={formColumns} projectTag={projectTag} tableName={tableName} />
			</NewModal>
			<Drawer kind={Modals.TableEndpoints} title="Endpoints">
				<TableEndpoints projectTag={projectTag} />
			</Drawer>
			<NewModal kind={Modals.QueryBuilder} title="Query Builder" size="1100px">
				<QueryTable
					projectName={projectName}
					projectTag={projectTag}
					tableName={tableName}
				/>
			</NewModal>
			<NewModal kind={Modals.TableFilter} title="Filter Records" size="1100px">
				<RecordFilter
					projectName={projectName}
					tableName={tableName}
					defaultValues={filters.filters}
					onSubmit={(values) => {
						setFilters({ columns: [], filters: values })
						recordsQuery.refetch()
						modal.close()
					}}
				/>
			</NewModal>
			<Modal kind={Modals.EditRecord} title="Edit Record">
				{({ id, data }: { id: string; data: TableRecord }) => (
					<EditRecordForm
						projectTag={projectTag}
						tableName={tableName}
						rowId={id}
						defaultValues={_.fromPairs(
							_.toPairs(
								_.omit(
									recordsQuery.data?.data?.rows.find(
										(record) => record.id === id
									) ?? data,
									["id", "creator_id"]
								)
							).map(([key, value]) => [
								key,
								!_.isArray(value) && _.isObject(value)
									? JSON.stringify(value, null, 2)
									: _.isArray(value)
									? value.map(_.toString)
									: value,
							])
						)}
						columns={formColumns}
					/>
				)}
			</Modal>
		</div>
	)
}

function QueryTable({
	projectName,
	projectTag,
	tableName,
}: {
	projectName: string
	projectTag: string
	tableName: string
}) {
	const defaultValues = { filterSet: [{ key: "", operator: "", value: "" }], conjunction: "and" }
	const query = useQuery(QueryKey.GetColumns, () => getColumns(projectName, tableName))
	const form = useForm<QueryBuilderValues>({ defaultValues })
	const modal = useModal()

	return (
		<QueryBuilder
			index={0}
			name=""
			query={query}
			form={form}
			projectName={projectName}
			tableName={tableName}
		>
			{(values) => (
				<>
					<Endpoint
						method="POST"
						label="Get records"
						url={`${API_URL}/database/query/select/project/${projectTag}/table/${tableName}`}
						code={{ columns: [], filters: values }}
					/>
					<Button
						onClick={() => {
							modal.close()
							openModal({
								title: "Create view",
								children: (
									<ViewForm
										filters={values as Filters}
										projectName={projectName}
										tableName={tableName}
										columns={query.data?.data.columns ?? []}
									/>
								),
							})
						}}
					>
						Create view from query
					</Button>
				</>
			)}
		</QueryBuilder>
	)
}

function ActionBar({ projectName, tableName }: { projectName: string; tableName: string }) {
	const modal = useModal()
	const queryClient = useQueryClient()

	return (
		<div className="flex gap-2 text-xs">
			<TableDeletion projectName={projectName} tableName={tableName} />
			<Button
				leftIcon={<IoReload />}
				size="xs"
				type="button"
				onClick={() => queryClient.invalidateQueries(QueryKey.GetTableRecords)}
			>
				Refresh
			</Button>
			<Button
				size="xs"
				leftIcon={<IoFilter />}
				type="button"
				onClick={() => modal.open(Modals.TableFilter)}
			>
				Filter
			</Button>
			<Button
				size="xs"
				leftIcon={<IoSearch />}
				type="button"
				onClick={() => modal.open(Modals.QueryBuilder)}
			>
				Query Builder
			</Button>
			<Button
				size="xs"
				leftIcon={<IoList />}
				type="button"
				onClick={() => modal.open(Modals.TableEndpoints)}
			>
				Endpoints
			</Button>
			<Button
				size="xs"
				leftIcon={<IoAdd />}
				type="button"
				onClick={() => modal.open(Modals.NewRecord)}
			>
				New Record
			</Button>
			<Button
				size="xs"
				leftIcon={<IoAdd />}
				type="button"
				onClick={() => modal.open(Modals.NewColumn)}
			>
				New Column
			</Button>
		</div>
	)
}

interface ColumnProps {
	projectName: string
	tableName: string
	name: string
}

function Column({ projectName, tableName, name }: ColumnProps) {
	const client = useQueryClient()
	const deleteMutation = useMutation(() => deleteColumn(projectName, tableName, name), {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetColumns)
			client.invalidateQueries(QueryKey.GetTableRecords)
		},
	})
	const showDelete = name !== "id" && name !== "creator_id"

	return (
		<div className="flex items-center gap-2">
			{name}
			{showDelete && (
				<ActionIcon
					type="button"
					onClick={() => deleteMutation.mutate()}
					loading={deleteMutation.isLoading}
				>
					<IoTrash />
				</ActionIcon>
			)}
		</div>
	)
}

function RecordFilter({
	projectName,
	tableName,
	defaultValues,
	onSubmit,
}: {
	projectName: string
	tableName: string
	defaultValues?: QueryBuilderValues
	onSubmit: (values: QueryBuilderValues) => void
}) {
	const query = useQuery(QueryKey.GetColumns, () => getColumns(projectName, tableName))
	const form = useForm<QueryBuilderValues>({ defaultValues })
	return (
		<QueryBuilder
			index={0}
			name=""
			query={query}
			form={form}
			projectName={projectName}
			tableName={tableName}
			defaultValues={defaultValues}
		>
			{(values) => (
				<Button type="button" onClick={() => onSubmit(values)}>
					Apply Filter
				</Button>
			)}
		</QueryBuilder>
	)
}

function RecordActions({
	projectTag,
	tableName,
	data,
}: {
	projectTag: string
	tableName: string
	data: TableRecord
}) {
	const rowId = data.id
	const client = useQueryClient()
	const mutation = useMutation(() => deleteRecord(projectTag, tableName, rowId as string), {
		onSuccess: () => client.invalidateQueries(QueryKey.GetTableRecords),
	})
	const modal = useModal()

	return (
		<div className="flex gap-1">
			<ActionIcon
				type="button"
				onClick={() =>
					modal.open(Modals.EditRecord, { id: rowId, data: _.omit(data, "id") })
				}
			>
				<IoPencil />
			</ActionIcon>
			<ActionIcon
				loading={mutation.isLoading}
				type="button"
				onClick={() => mutation.mutate()}
			>
				<IoTrash />
			</ActionIcon>
		</div>
	)
}
