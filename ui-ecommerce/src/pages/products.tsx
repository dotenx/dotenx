import { Badge, Button, Image, Modal, Switch, Textarea } from "@mantine/core"
import { useEffect, useState } from "react"
import { BsPlusLg } from "react-icons/bs"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
	getIntegrations,
	getTableRecords,
	QueryKey,
	runPredefinedQuery,
	updateProduct,
} from "../api"
import { ContentWrapper, Header, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import _ from "lodash"
import { FaExternalLinkAlt, FaHashtag } from "react-icons/fa"
import { useClipboard } from "@mantine/hooks"
import { IoCheckmark, IoCopy } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { UpdateIntegrationForm } from "../features/app/updateIntegrationForm"
import { IntegrationForm } from "../features/app/addIntegrationForm"
import { IoMdSettings } from "react-icons/io"

export function ProductsPage() {
	const [activeTab, setActiveTab] = useState<"all" | "products" | "memberships">("all")
	const [details, setDetails] = useState<any>()
	const client = useQueryClient()
	const { projectTag } = useGetProjectTag()
	useEffect(() => {
		setDetails(false)
	}, [activeTab])
	const { mutate: mutateUpdateProduct, isLoading: loadingUpdateProduct } = useMutation(
		({ productId, payload }: { productId: string; payload: any }) =>
			updateProduct({ productId, tag: projectTag, payload }),
		{
			onSuccess: () => {
				setDetails(false)
				client.invalidateQueries([QueryKey.GetTableRecords])
				client.invalidateQueries([QueryKey.GetMembershipOnlyRecords])
				client.invalidateQueries([QueryKey.GetProductsOnlyRecords])
			},
		}
	)
	const tableColumns = [
		{
			Header: "id",
			accessor: "id",
		},
		{
			Header: "name",
			accessor: "name",
			Cell: (rows: any) => (
				<span
					onClick={() =>
						setDetails(rows.data.filter((r: any) => r.id === rows.row.original.id)[0])
					}
					className="flex items-center gap-x-2 text-rose-600 cursor-pointer "
				>
					{rows.row.values.name}
				</span>
			),
		},
		{
			Header: "description",
			accessor: "description",
		},
		{
			Header: "price",
			accessor: "price",
		},
		{
			Header: "type",
			accessor: "type",
		},
		{
			Header: "Publish product",
			accessor: "status",
			Cell: (rows: any) => {
				const status =
					rows.row.original.status === "published" ? "unpublished" : "published"
				return (
					<Switch
						disabled={loadingUpdateProduct}
						onClick={() =>
							mutateUpdateProduct({
								productId: rows.row.original.id,
								payload: {
									...rows.row.original,
									details: JSON.parse(rows.row.original.details),
									file_names: rows.row.original.file_names.split(","),
									tags: rows.row.original.tags.split(","),
									thumbnails: rows.row.original.thumbnails.split(","),
									metadata: JSON.parse(rows.row.original.metadata),
									recurring_payment: JSON.parse(
										rows.row.original.recurring_payment
									),
									json_content: JSON.parse(rows.row.original.json_content),
									status: status,
								},
							})
						}
						className="ml-10"
						checked={rows.row.original.status === "published"}
					/>
				)
			},
		},
	]
	return (
		<div>
			<Header
				title="Products"
				tabs={["all", "products", "memberships"]}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			>
				<ActionBar />
			</Header>
			<ContentWrapper>
				{activeTab === "all" && <AllTab columns={tableColumns} details={details} />}
				{activeTab === "products" && (
					<ProductsTab columns={tableColumns} details={details} />
				)}
				{activeTab === "memberships" && (
					<MembershipsTab columns={tableColumns} details={details} />
				)}
			</ContentWrapper>
		</div>
	)
}

function ActionBar() {
	const { projectName = "" } = useParams()
	const client = useQueryClient()
	const [openModal, setOpenModal] = useState(false)
	const [openSettingsModal, setOpenSettingsModal] = useState(false)
	const query = useQuery([QueryKey.GetIntegrations], () =>
		getIntegrations({ type: "stripe", projectName })
	)
	const IntegrationName = query?.data?.data[0]?.name ?? ""
	return (
		<div className="flex gap-x-5 items-center">
			{!IntegrationName && query.isSuccess && (
				<div className="text-sm p-1 px-2 bg-blue-50 rounded text-gray-600 flex items-center gap-x-2">
					You must connect your project to Stripe to create products{" "}
					<Button onClick={() => setOpenModal(true)} color="blue" size="xs">
						Connect
					</Button>
				</div>
			)}
			{IntegrationName && query.isSuccess && (
				<Button
					leftIcon={<IoMdSettings className="h-5 w-5" />}
					onClick={() => setOpenSettingsModal(true)}
					color="blue"
				>
					Stripe
				</Button>
			)}
			<Button
				disabled={!IntegrationName}
				component={Link}
				to={`/projects/${projectName}/products/new`}
				leftIcon={<BsPlusLg />}
			>
				New Product
			</Button>
			<Modal opened={openModal} onClose={() => setOpenModal(false)}>
				<IntegrationForm
					integrationKind={"stripe"}
					onSuccess={() => {
						toast("Stripe integration added successfully", {
							type: "success",
							autoClose: 2000,
						}),
							client.invalidateQueries([QueryKey.GetIntegrations]),
							setOpenModal(false)
					}}
				/>
			</Modal>
			<Modal opened={openSettingsModal} onClose={() => setOpenSettingsModal(false)}>
				<UpdateIntegrationForm
					name={IntegrationName}
					integrationKind={"stripe"}
					onSuccess={() => {
						toast("Stripe integration updated successfully", {
							type: "success",
							autoClose: 2000,
						}),
							client.invalidateQueries([QueryKey.GetIntegrations]),
							setOpenModal(false)
					}}
				/>
			</Modal>
		</div>
	)
}

function AllTab({
	columns,
	details,
}: {
	columns: { Header: string; accessor: string }[]
	details: any
}) {
	const [currentPage, setCurrentPage] = useState(1)
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const recordsQuery = useQuery(
		[QueryKey.GetTableRecords, projectTag, "products", { columns: [] }, currentPage],
		() => getTableRecords(projectTag, "products", currentPage, { columns: [] }),
		{ enabled: !!projectTag }
	)

	const products = (recordsQuery.data?.data?.rows || []).map((record: any) =>
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
	const nPages = Math.ceil((recordsQuery?.data?.data?.totalRows ?? 0) / 10)

	return (
		<div>
			<SalesStats projectTag={projectTag} />
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || recordsQuery.isLoading}
				emptyText="No products added yet"
				columns={columns}
				data={products}
			/>
			{details && <ProductDetails details={details} />}
		</div>
	)
}

export function SalesStats({ projectTag = "" }: { projectTag?: string }) {
	const totalRevenueQuery = useQuery(
		["get-total-revenue", projectTag],
		() => runPredefinedQuery(projectTag, "get_total_revenue"),
		{ enabled: !!projectTag }
	)
	const lastDayRevQuery = useQuery(
		["get-last-day-revenue", projectTag],
		() => runPredefinedQuery(projectTag, "get_last_24h_revenue"),
		{ enabled: !!projectTag }
	)
	const mrrQuery = useQuery(
		["get-mrr", projectTag],
		() => runPredefinedQuery(projectTag, "get_MRR"),
		{ enabled: !!projectTag }
	)
	const totalRevenue = totalRevenueQuery?.data?.data?.rows?.[0]?.total_revenue ?? 0
	const last24 = lastDayRevQuery?.data?.data?.rows?.[0]?.total_revenue ?? 0
	const mrr = mrrQuery?.data?.data?.rows?.[0]?.mrr ?? 0
	const stats = [
		{
			title: "Total Revenue",
			value: `$${totalRevenue.toFixed(2)}`,
			isLoading: totalRevenueQuery.isLoading || !projectTag,
		},
		{
			title: "Last 24h",
			value: `$${last24.toFixed(2)}`,
			isLoading: lastDayRevQuery.isLoading || !projectTag,
		},
		{ title: "MRR", value: `$${mrr.toFixed(2)}`, isLoading: mrrQuery.isLoading || !projectTag },
	]

	return <Stats stats={stats} />
}

export function Stats({ stats }: { stats: StatData[] }) {
	return (
		<div className="grid lg:grid-cols-3 md-grid-cols-2 gap-x-5 gap-y-2">
			{stats.map((stat) => (
				<StatBlock
					key={stat.title}
					title={stat.title}
					value={stat.value}
					isLoading={stat.isLoading}
				/>
			))}
		</div>
	)
}

type StatData = {
	title: string
	value: string | number
	isLoading?: boolean
}

export function StatBlock({ title, value, isLoading }: StatData) {
	return (
		<div className={`bg-white rounded-lg p-4 ${isLoading && "animate-pulse"}`}>
			<p className="text-gray-500 text-sm pb-2">{title}</p>
			<p className="text-2xl font-bold">
				{!isLoading && (!["$undefined", "$null"].includes(_.toString(value)) ? value : 0)}
			</p>
		</div>
	)
}

function ProductsTab({
	columns,
	details,
}: {
	columns: { Header: string; accessor: string }[]
	details: any
}) {
	const [currentPage, setCurrentPage] = useState(1)

	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const recordsQuery = useQuery(
		[QueryKey.GetProductsOnlyRecords, projectTag, "products", currentPage],
		() =>
			getTableRecords(projectTag, "products", currentPage, {
				columns: [],
				filters: { filterSet: [{ key: "type", operator: "!=", value: "membership" }] },
			}),
		{ enabled: !!projectTag }
	)
	const products = (recordsQuery.data?.data?.rows || []).map((record) =>
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
	const nPages = Math.ceil((recordsQuery?.data?.data?.totalRows ?? 0) / 10)
	return (
		<div>
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || recordsQuery.isLoading}
				emptyText="No products added yet"
				columns={columns}
				data={products}
			/>
			{details && <ProductDetails details={details} />}
		</div>
	)
}

function MembershipsTab({
	columns,
	details,
}: {
	columns: { Header: string; accessor: string }[]
	details: any
}) {
	const [currentPage, setCurrentPage] = useState(1)

	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const recordsQuery = useQuery(
		[QueryKey.GetMembershipOnlyRecords, projectTag, "products", currentPage],
		() =>
			getTableRecords(projectTag, "products", currentPage, {
				columns: [],
				filters: { filterSet: [{ key: "type", operator: "=", value: "membership" }] },
			}),
		{ enabled: !!projectTag }
	)
	const products = (recordsQuery.data?.data?.rows || []).map((record) =>
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
	const nPages = Math.ceil((recordsQuery?.data?.data?.totalRows ?? 0) / 10)
	return (
		<div>
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || recordsQuery.isLoading}
				emptyText="No products added yet"
				columns={columns}
				data={products}
			/>
			{details && <ProductDetails details={details} />}
		</div>
	)
}

const ProductDetails = ({ details }: { details: any }) => {
	const fileName = JSON.parse(details?.metadata)?.files ?? []
	const clipboard = useClipboard({ timeout: 3000 })
	const [copiedValue, setCopiedValue] = useState("")
	const navigate = useNavigate()
	return (
		<div className="bg-white mt-5 w-full rounded p-5  ">
			<div className=" gap-x-5 grid grid-cols-3  ">
				<div className="flex justify-end col-span-3">
					<Button
						onClick={() => {
							navigate(`${details.id}`)
						}}
					>
						Edit
					</Button>
				</div>
				<Image
					caption={``}
					width={"100%"}
					height={"100%"}
					className="border"
					src={
						details.image_url ||
						"https://files.dotenx.com/f061aac7-bad1-4b14-9b52-0e64f2b4b94d.png"
					}
				/>
				<div className="w-full col-span-2 space-y-3 	">
					{details.status && details.status === "published" ? (
						<Badge color="green">published</Badge>
					) : (
						<Badge color="yellow">unpublished</Badge>
					)}
					<div className="flex items-center justify-between">
						<div className="text-4xl font-normal">{details.name}</div>
						<div className="text-rose-600 font-medium">{details.type}</div>
					</div>
					<div className="text-2xl font-light ">
						{/* TO DO convert all currencies to symbols ? */}
						{_.upperCase(details.currency) === "USD" ? "$" : details.currency}
						{details.price}
					</div>
					<div className="w-fit ">
						{Object.entries(JSON.parse(details.details) || {})?.map((d: any) => {
							return (
								<div key={d[0]} className="flex items-center gap-x-1">
									<div>{d[0]} :</div> <div className="text-gray-500">{d[1]}</div>
								</div>
							)
						})}
					</div>
					<div className="space-y-1">
						<div className="text-lg font-medium">{details.description}</div>
						<div className="text-gray-500 ">{details.summary}</div>
					</div>
					{details?.tags && (
						<div className="flex gap-x-2">
							{details?.tags?.split(",").map((t: string) => (
								<div
									key={t}
									className="truncate  duration-100 	 rounded p-2 flex items-center bg-gray-200 text-sm "
								>
									<FaHashtag className="h-3 w-3 mr-1" /> {t}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			<div className="mt-5  border-b  border-gray-300 pb-5 ">
				{!!details.thumbnails && (
					<div>
						<div className="mb-2 font-normal text-lg">Thumbnails</div>
						<div className="w-full  grid grid-cols-6 gap-x-5">
							{details.thumbnails?.split(",").map((t: string) => (
								<Image
									key={t}
									caption={``}
									width={"100%"}
									height={"100%"}
									className="border"
									src={
										t ||
										"https://files.dotenx.com/f061aac7-bad1-4b14-9b52-0e64f2b4b94d.png"
									}
								/>
							))}
						</div>
					</div>
				)}
			</div>
			<div className="grid grid-cols-2  gap-x-10  mt-5 ">
				<div>
					ID <span className="text-gray-400 pl-1 ">{details.id || "-"}</span>
				</div>
				<div>
					LIMITATION
					<span className="text-gray-400 pl-1 ">{details.limitation || "-"}</span>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-x-10  mt-10">
				<div className=" space-y-5">
					<div>
						<div className="mb-1">stripe price id</div>
						{details.stripe_price_id ? (
							<div
								onClick={() => {
									setCopiedValue(details.stripe_price_id),
										clipboard.copy(details.stripe_price_id)
								}}
								className={` p-2 px-4 rounded bg-gray-100 text-gray-500  hover:bg-cyan-200 transition-colors cursor-pointer flex items-center justify-between  `}
							>
								{details.stripe_price_id}

								{clipboard.copied && copiedValue === details.stripe_price_id ? (
									<IoCheckmark className="h-4 w-4" />
								) : (
									<IoCopy className="h-4 w-4" />
								)}
							</div>
						) : (
							<div className=" p-2 px-4 rounded  bg-gray-100 text-gray-500     flex items-center justify-between ">
								-
							</div>
						)}
					</div>
					<div>
						<div className="mb-1">stripe product id</div>
						{details.stripe_product_ids ? (
							<div
								onClick={() => {
									setCopiedValue(details.stripe_product_id),
										clipboard.copy(details.stripe_product_id)
								}}
								className={` p-2 px-4 rounded bg-gray-100 text-gray-500  hover:bg-cyan-200 transition-colors cursor-pointer flex items-center justify-between  `}
							>
								{details.stripe_product_id}

								{clipboard.copied && copiedValue === details.stripe_product_id ? (
									<IoCheckmark className="h-4 w-4" />
								) : (
									<IoCopy className="h-4 w-4" />
								)}
							</div>
						) : (
							<div className=" p-2 px-4 rounded  bg-gray-100 text-gray-500     flex items-center justify-between ">
								-
							</div>
						)}
					</div>
				</div>
				<div className=" space-y-5">
					<div>
						<div className="mb-1 ">preview link</div>
						{details.preview_link ? (
							<div
								onClick={() => {
									setCopiedValue(details.preview_link),
										clipboard.copy(details.preview_link)
								}}
								className={` p-2 px-4 rounded bg-gray-100 text-gray-500  hover:bg-cyan-200 transition-colors cursor-pointer flex items-center justify-between  `}
							>
								{details.preview_link}
								<div className="flex item-center gap-x-2">
									{clipboard.copied && copiedValue === details.preview_link ? (
										<IoCheckmark className="h-4 w-4" />
									) : (
										<IoCopy className="h-4 w-4" />
									)}
									<a href={details.preview_link} target={"_blank"}>
										<FaExternalLinkAlt className="h-4 w-4 hover:text-gray-800" />
									</a>
								</div>
							</div>
						) : (
							<div className=" p-2 px-4 rounded  bg-gray-100 text-gray-500     flex items-center justify-between ">
								-
							</div>
						)}
					</div>
					<div>
						<div className="mb-1 ">download link</div>
						{details.download_link ? (
							<div
								onClick={() => {
									setCopiedValue(details.download_link),
										clipboard.copy(details.download_link)
								}}
								className={` p-2 px-4 rounded bg-gray-100 text-gray-500  hover:bg-cyan-200 transition-colors cursor-pointer flex items-center justify-between  `}
							>
								{details.download_link}
								<div className="flex item-center gap-x-2">
									{clipboard.copied && copiedValue === details.download_link ? (
										<IoCheckmark className="h-4 w-4" />
									) : (
										<IoCopy className="h-4 w-4" />
									)}
									<a href={details.download_link} target={"_blank"}>
										<FaExternalLinkAlt className="h-4 w-4 hover:text-gray-800" />
									</a>
								</div>
							</div>
						) : (
							<div className=" p-2 px-4 rounded  bg-gray-100 text-gray-500     flex items-center justify-between ">
								-
							</div>
						)}
					</div>
				</div>
			</div>
			{fileName.length > 0 && (
				<div className="mt-5 w-1/2 pr-5">
					attachments
					<div className="mt-2 border">
						{fileName.map((n: any, index: number) => (
							<div
								key={index}
								className={`text-xs ${
									index % 2 !== 0 ? "bg-white" : "bg-slate-50"
								} w-full p-1 `}
							>
								{n.display_name}
							</div>
						))}
					</div>
				</div>
			)}
			<div className="mt-5">
				content
				<Textarea readOnly value={details.content || ""} />
			</div>
		</div>
	)
}
