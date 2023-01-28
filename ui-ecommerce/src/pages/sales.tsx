import { Button, Code } from "@mantine/core"
import { format } from "date-fns"
import { useState } from "react"
import { IoReload } from "react-icons/io5"
import { useQuery, useQueryClient } from "react-query"
import { Navigate, useParams } from "react-router-dom"
import {
	API_URL,
	getLast24HoursSales,
	getProductsSummary,
	getProfile,
	getProject,
	QueryKey,
} from "../api"
import { Modals, useModal } from "../features/hooks"
import { Content_Wrapper, Drawer, Endpoint, Header, Loader, Table } from "../features/ui"
import UserGroupsWrapper from "./user-groups"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <UMTableContent projectName={projectName} />
}

function UMTableContent({ projectName }: { projectName: string }) {
	const [currentPage, setCurrentPage] = useState(1)
	const [activeTab, setActiveTab] = useState<"all" | "products" | "memberships">("all")

	const { data: projectDetails, isLoading: projectDetailsLoading } = useQuery(
		QueryKey.GetProject,
		() => getProject(projectName)
	)
	const projectTag = projectDetails?.data.tag ?? ""
	const { data: usersData, isLoading: usersDataLoading } = useQuery(
		[QueryKey.GetLast24HoursSales, projectTag, currentPage],
		() => getLast24HoursSales(projectTag, currentPage),
		{ enabled: !!projectTag }
	)
	const tableData = usersData?.data?.rows ?? []

	const nPages = Math.ceil((usersData?.data?.totalRows as number) / 10)
	const queryClient = useQueryClient()

	return (
		<div>
			<Header
				tabs={["all", "products", "memberships"]}
				headerLink={`/builder/projects/${projectName}/user-management`}
				title={"Sales"}
				activeTab={activeTab}
				onTabChange={(v: typeof activeTab) => {
					setActiveTab(v)
				}}
			>
				<ActionBar projectTag={projectTag} />
			</Header>
			<Content_Wrapper>
				{activeTab === "all" && (
					<div className="flex flex-col">
            <CurrentMonthSalesChart />
						<Table
							withPagination
							currentPage={currentPage}
							nPages={nPages}
							setCurrentPage={setCurrentPage}
							loading={projectDetailsLoading || usersDataLoading}
							emptyText="No sales recorded yet"
							actionBar={
								<Button
									leftIcon={<IoReload />}
									type="button"
									onClick={() =>
										queryClient.invalidateQueries(QueryKey.GetLast24HoursSales)
									}
								>
									Refresh
								</Button>
							}
							columns={[
								{
									Header: "Time",
									accessor: "time",
								},
								{
									Header: "Amount",
									accessor: "total",
								},
								{
									Header: "Customer",
									accessor: "email",
								}
							]}
							data={tableData}
						/>
					</div>
				)}
				{activeTab === "products" && <UserGroupsWrapper />}
			</Content_Wrapper>
		</div>
	)
}

const registerExample = {
	email: "example@email.com",
	password: "abcdefg1234",
	fullname: "John Smith",
}

const loginExample = {
	email: "example@email.com",
	password: "abcdefg1234",
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
				>
					Add New Product
				</Button>
			</div>
			<Drawer kind={Modals.UserManagementEndpoint} title="Endpoint">
				<div className="space-y-8">
					<Endpoint
						label="Sign up a user"
						url={`${API_URL}/user/management/project/${projectTag}/register`}
						method="POST"
						code={registerExample}
					/>
					<Endpoint
						label="Sign in"
						url={`${API_URL}/user/management/project/${projectTag}/login`}
						method="POST"
						code={loginExample}
					/>
					<Endpoint
						label="Get user profile"
						url={`${API_URL}/profile/project/${projectTag}`}
						method="GET"
						code={profileExample}
						isResponse
						description={
							<p>
								<Code>tp_account_id</Code> is the user&apos;s account ID.
							</p>
						}
					/>
					<Endpoint
						label="Authenticate with provider"
						url={`${API_URL}/user/management/project/${projectTag}/provider/:provider_name/authorize`}
						method="GET"
					/>
					<Endpoint
						label="Set user group"
						url={`${API_URL}/user/group/management/project/${projectTag}/userGroup/name/:group_name`}
						method="POST"
						code={{
							account_id: "account_id",
						}}
					/>
				</div>
			</Drawer>
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


function CurrentMonthSalesChart() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Current Month Sales Amount",
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };
  
  // days of the current month from 1 to the last day of the month. The last day of the month depends on the current month.
  const labels = Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => i + 1);
  
  const data = {
    labels,
    datasets: [
      {
        label: "Daily Sales",
        data: labels.map(() => Math.floor(Math.random() * 100)),
        backgroundColor: "#8d99ae",
      },
    ],
  };

  ChartJS.defaults.font.family = "Inter";
  ChartJS.defaults.color = "#2b2d42";

  return <div className="">
    <Bar options={options} data={data} className="max-h-80" />
  </div>;
}