import { Button, Code } from "@mantine/core"
import { format } from "date-fns"
import { useState } from "react"
import { IoReload } from "react-icons/io5"
import { useQuery, useQueryClient } from "react-query"
import { Navigate, useParams } from "react-router-dom"
import {
	API_URL,
	getProductsSummary,
	getProfile,
	getProject,
	getUserManagementData,
	QueryKey,
} from "../api"
import { Modals, useModal } from "../features/hooks"
import { Content_Wrapper, Drawer, Endpoint, Header, Loader, Table } from "../features/ui"
import UserGroupsWrapper from "./user-groups"

export default function NewProductsPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <UMTableContent projectName={projectName} />
}

function UMTableContent({ projectName }: { projectName: string }) {
	const [currentPage, setCurrentPage] = useState(1)
	const [activeTab, setActiveTab] = useState<"details" | "content">("details")

	const { data: projectDetails, isLoading: projectDetailsLoading } = useQuery(
		QueryKey.GetProject,
		() => getProject(projectName)
	)
	const projectTag = projectDetails?.data.tag ?? ""
	const { data: usersData, isLoading: usersDataLoading } = useQuery(
		[QueryKey.GetProductsSummary, projectTag, currentPage],
		() => getProductsSummary(projectTag, currentPage),
		{ enabled: !!projectTag }
	)
	const tableData = usersData?.data?.rows ?? []

	const nPages = Math.ceil((usersData?.data?.totalRows as number) / 10)
	const queryClient = useQueryClient()

	return (
		<div>
			<Header
				tabs={["details", "content"]}
				headerLink={`/builder/projects/${projectName}/user-management`}
				title={"New Product"}
				activeTab={activeTab}
				onTabChange={(v: typeof activeTab) => {
					setActiveTab(v)
				}}
			>
				<ActionBar projectTag={projectTag} />
			</Header>
			<Content_Wrapper>
				{activeTab === "details" && <DetailsTab />}
				{activeTab === "content" && <UserGroupsWrapper />}
			</Content_Wrapper>
		</div>
	)
}

function DetailsTab() {
	return (
		<div className="grid grid-cols-[60%_40%]">
			<form className="flex flex-col w-full gap-8">
					<Input label="Product Name" value="" placeholder="Name" />
					<Select label="Product Type" value="" placeholder="Type">
						<option value="subscription">Subscription</option>
						<option value="one-time">One-time</option>
					</Select>
					<TextArea label="Long Description" value="" placeholder="Description" rows={10} />
					<TextArea label="Short Description" value="" placeholder="Description" rows={3} />
					{/* Todo: Add file upload for cover image */}
					{/* Todo: Add file upload for thumbnails */}
			</form>
			<div></div>
		</div>
	)
}

function Input({ label, value, placeholder }: { label: string; value: string, placeholder?: string }) {
	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm text-black">{label}</label>
			<input
				type="text"
				value={value}
				placeholder={placeholder}
				className="w-full border border-gray-600 focus:outline-gray-700 rounded-md px-4 py-3"
			/>
		</div>
	)
}

function TextArea({ label, value, placeholder, rows }: { label: string; value: string, placeholder?: string, rows?: number }) {
	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm text-black">{label}</label>
			<textarea
				rows={rows}
				value={value}
				placeholder={placeholder}
				className="w-full border border-gray-600 focus:outline-gray-700 rounded-md px-4 py-3"
			/>
		</div>
	)
}

function Select({ label, value, placeholder, children }: { label: string; value: string, placeholder?: string, children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm text-black">{label}</label>
			<select
				value={value}
				placeholder={placeholder}
				className="w-full border border-gray-600 focus:outline-gray-700 rounded-md px-4 py-3"
			>
				{children}
			</select>
		</div>
	)
}

function ActionBar({ projectTag }: { projectTag: string }) {
	const modal = useModal()
	const profileQuery = useQuery(
		[QueryKey.GetProfile, projectTag],
		() => getProfile({ projectTag }),
		{ enabled: !!projectTag }
	)
	const accountId = profileQuery.data?.data.account_id
	const profileExample = {
		account_id: accountId,
		created_at: "2022-11-25 20:59:13.675894187 +0000 UTC m=+171.884849553",
		email: "example.email.com",
		full_name: "John Smith",
		user_group: "users",
		tp_account_id: "********-****-****-****-************",
	}

	if (profileQuery.isLoading) return <Loader />

	return (
		<>
			<div className="flex flex-wrap gap-2">
				<Button
					className="endpoints"
					onClick={() => modal.open(Modals.UserManagementEndpoint)}
					styles={(theme) => ({
						root: {
							backgroundColor: theme.colors.dark[0],
							color: "white",

							"&:hover": {
								backgroundColor: theme.colors.gray[0],
								color: theme.colors.dark[0],
							},
						},

						leftIcon: {
							marginRight: 15,
						},
					})}
				>
					Publish
				</Button>
				<Button
					className="endpoints"
					onClick={() => modal.open(Modals.UserManagementEndpoint)}
				>
					Save
				</Button>
			</div>
		</>
	)
}

function Stats() {
	const totalRevenue = 130
	const last24 = 10
	const mrr = 100

	return (
		<div className="grid lg:grid-cols-3 md-grid-cols-2 gap-x-2 gap-y-2">
			<StatBlock title="Total Revenue" value={`$${totalRevenue}`} defaultValue="$0" />
			<StatBlock title="Last 24h" value={`$${last24}`} defaultValue="$0" />
			<StatBlock title="MRR" value={`$${mrr}`} defaultValue="$0" />
		</div>
	)
}

function StatBlock({
	title,
	value,
	defaultValue,
}: {
	title: string
	value: string
	defaultValue: string
}) {
	return (
		<div className="bg-white rounded-lg p-4 border-solid border-2 border-gray-600">
			<p className="text-gray-500 text-sm pb-2">{title}</p>
			<p className="text-2xl font-bold">{value || defaultValue}</p>
		</div>
	)
}
