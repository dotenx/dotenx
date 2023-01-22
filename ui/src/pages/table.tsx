/* eslint-disable no-mixed-spaces-and-tabs */
import { ActionIcon, Button, Menu } from "@mantine/core"
import { openModal } from "@mantine/modals"
import _ from "lodash"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
	IoAdd,
	IoEllipsisVertical,
	IoFilter,
	IoList,
	IoPencil,
	IoReload,
	IoSearch,
	IoTrash,
} from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { CellProps } from "react-table"
import {
	API_URL,
	deleteColumn,
	deleteRecord,
	deleteTable,
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
	TableEndpoints,
} from "../features/database"
import { Modals, useModal } from "../features/hooks"
import { Content_Wrapper, Drawer, Endpoint, Header, Modal, NewModal, Table } from "../features/ui"
import { ViewForm } from "../features/views/view-form"

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
					Header: "",
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
				title={"Tables"}
				activeTab={tableName}
				tabs={[tableName]}
			>
				<ActionBar />
			</Header>
			<Content_Wrapper expand>
				<Table
					withPagination
					currentPage={currentPage}
					nPages={nPages}
					setCurrentPage={setCurrentPage}
					helpDetails={helpDetails}
					columns={tableHeaders as any}
					data={records}
					loading={recordsQuery.isLoading || columnsQuery.isLoading}
					actionBar={<TableActions projectName={projectName} tableName={tableName} />}
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

function ActionBar() {
	const modal = useModal()

	return (
		<div className="flex gap-2 text-xs">
			<Button
				size="xs"
				leftIcon={<IoSearch />}
				type="button"
				onClick={() => modal.open(Modals.QueryBuilder)}
				variant="default"
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
		<div className="flex items-center gap-2 group">
			{name}
			{showDelete && (
				<ActionIcon
					type="button"
					onClick={() => deleteMutation.mutate()}
					loading={deleteMutation.isLoading}
					className="invisible group-hover:visible"
					color="dark"
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
		<div className="flex gap-1 opacity-0 group-hover/row:opacity-100 justify-end">
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

function TableActions({ projectName, tableName }: { projectName: string; tableName: string }) {
	const modal = useModal()
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const deleteMutation = useMutation(() => deleteTable(projectName, tableName), {
		onSuccess: () => navigate(`/builder/projects/${projectName}/tables`),
	})

	return (
		<div className="flex">
			<ActionIcon
				color="dark"
				onClick={() => queryClient.invalidateQueries(QueryKey.GetTableRecords)}
			>
				<IoReload />
			</ActionIcon>
			<ActionIcon color="dark" onClick={() => modal.open(Modals.TableFilter)}>
				<IoFilter />
			</ActionIcon>
			<Menu position="bottom-end">
				<Menu.Target>
					<ActionIcon color="dark">
						<IoEllipsisVertical />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item
						icon={<IoAdd />}
						onClick={() => modal.open(Modals.NewRecord)}
						className="font-medium !text-xs"
					>
						Add record
					</Menu.Item>
					<Menu.Item
						icon={<IoAdd />}
						onClick={() => modal.open(Modals.NewColumn)}
						className="font-medium !text-xs"
					>
						Add column
					</Menu.Item>
					<Menu.Item
						icon={<IoTrash />}
						onClick={() => deleteMutation.mutate()}
						className="font-medium !text-xs !text-red-600"
					>
						Delete table
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</div>
	)
}
