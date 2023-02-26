import { Button, MultiSelect, Radio, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMutation, useQuery } from "@tanstack/react-query"
import cronstrue from "cronstrue"
import _ from "lodash"
import { useEffect, useState } from "react"
import Cron, { HEADER } from "react-cron-generator"
import { TbArrowLeft } from "react-icons/tb"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { z } from "zod"
import { createEmailPipeline, runCustomQuery } from "../api"
import { Editor, EditorValue } from "../features/editor/editor"
import { ContentWrapper, Header } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"

export function CreateSchedulePage() {
	const navigate = useNavigate()
	const [stage, setStage] = useState<"content" | "schedule">("content")
	const { projectName } = useGetProjectTag()
	const [editorValues, setEditorValues] = useState<EditorValue>()
	const emailMutation = useMutation(createEmailPipeline, {
		onSuccess: () => {
			toast("Schedule added successfully", { type: "success", autoClose: 2000 })
			navigate(`/projects/${projectName}/audience?tab=schedules`)
		},
		onError: (e: any) => {
			toast(e.response.data.message, { type: "error", autoClose: 2000 })
		},
	})

	const submitEditor = (values: EditorValue): void => {
		setEditorValues(values)
		setStage("schedule")
	}

	return (
		<div>
			<Header
				tabs={["content", "schedule"]}
				activeTab={stage}
				onTabChange={setStage}
				title={
					<span className="cursor-pointer" onClick={() => navigate(-1)}>
						New Schedule
					</span>
				}
			/>
			<ContentWrapper>
				{stage === "content" && <Editor onSave={submitEditor} />}
				{stage === "schedule" && (
					<div>
						<Button
							size="xs"
							leftIcon={<TbArrowLeft />}
							onClick={() => setStage("content")}
						>
							Back
						</Button>
						<CreateSchedule
							onSave={(values) => {
								emailMutation.mutate({
									...values,
									payload: {
										...values.payload,
										html_content: editorValues?.html,
									},
								})
							}}
							submitting={emailMutation.isLoading}
						/>
					</div>
				)}
			</ContentWrapper>
		</div>
	)
}

function CreateSchedule({
	onSave,
	submitting,
}: {
	onSave: (values: any) => void
	submitting: boolean
}) {
	const schema = z.object({
		name: z.string().min(2).max(20),
		from: z.string().min(2).max(20),
		schedule_expression: z.string(),
		subject: z.string().optional(),
		text_content: z.string().optional(),
		html_content: z.string().optional(),
	})

	type Schema = z.infer<typeof schema>
	const { getInputProps, values, onSubmit, setValues } = useForm<Schema>({
		initialValues: {
			name: "",
			from: "",
			subject: "",
			text_content: "",
			html_content: "",
			schedule_expression: "",
		},
	})
	const [target, setTarget] = useState("product_ids")
	const [targetValue, setTargetValue] = useState<any>()
	const [targetPayload, setTargetPayload] = useState<{ target: any }>({ target: "" })
	useEffect(() => {
		if (target === "send_to_all") setTargetPayload({ target: { send_to_all: true } })
		else setTargetPayload({ target: { [target]: targetValue } })
	}, [target, targetValue])

	const isTargetEmpty = target !== "send_to_all" && (targetValue?.length === 0 || !targetValue)
	const [scheduleValue, setScheduleValue] = useState("")
	useEffect(() => {
		setValues({ schedule_expression: `cron(${_.tail(scheduleValue.split(" ")).join(" ")})` })
	}, [scheduleValue, setValues])

	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const productsListQuery = useQuery(
		["get-products", projectTag],
		() => runCustomQuery(projectTag, "SELECT * FROM products;"),
		{ enabled: !!projectTag }
	)

	const productsList = productsListQuery.data?.data?.rows ?? []
	const TagsList = _.uniq(
		productsList
			.map((d) => {
				return d.tags
			})
			.join()
			.split(",")
	)
	const productIdList = productsList.map((d) => {
		return {
			label: d.name + ` (${d.id})`,
			value: d.id,
		}
	})
	const handleSubmit = onSubmit(() => {
		onSave({
			tag: projectTag,
			payload: {
				...values,
				...targetPayload,
			},
		})
	})
	return (
		<form onSubmit={handleSubmit}>
			<div className="flex items-start gap-x-5 mt-5">
				<div className="w-[450px]  bg-white rounded p-4 space-y-5">
					<Radio.Group
						onChangeCapture={() => setTargetValue("")}
						value={target}
						onChange={setTarget}
						name="target"
						label="To"
						description="Select by"
					>
						<div className="space-y-2">
							<Radio
								value="product_ids"
								label={
									<div className="font-normal whitespace-nowrap -ml-1">
										Customers who bought these products
									</div>
								}
							/>
							<Radio
								value="tags"
								label={
									<div className="font-normal whitespace-nowrap -ml-1">
										Customers who bought these categories/tags
									</div>
								}
							/>
							<Radio
								value="send_to_all"
								label={
									<div className="font-normal whitespace-nowrap -ml-1">
										Send to all
									</div>
								}
							/>
						</div>
					</Radio.Group>
					{target === "product_ids" && (
						<MultiSelect
							label="Product Ids"
							placeholder="Select products"
							value={targetValue}
							onChange={setTargetValue}
							data={productIdList}
						/>
					)}
					{target === "tags" && (
						<MultiSelect
							label="Product tags"
							placeholder="Select tags"
							value={targetValue}
							onChange={setTargetValue}
							data={TagsList}
						/>
					)}
					{target === "send_to_all" && (
						<div className="text-sm text-gray-700">Send to all customers.</div>
					)}
				</div>
				<div className="grid grid-cols-2 gap-4 gap-x-6 w-full bg-white rounded p-4">
					<TextInput
						label="Name"
						placeholder="Schedule name"
						{...getInputProps("name")}
					/>
					<TextInput
						label="From"
						type={"email"}
						placeholder="Sender email address"
						{...getInputProps("from")}
					/>
					<TextInput label="Subject" placeholder="" {...getInputProps("subject")} />
					<TextInput
						label="Text content"
						placeholder=""
						{...getInputProps("text_content")}
					/>
					<div className="col-span-2">
						<Cron
							onChange={setScheduleValue}
							value={scheduleValue}
							options={{
								headers: [
									HEADER.MONTHLY,
									HEADER.WEEKLY,
									HEADER.MINUTES,
									HEADER.HOURLY,
									HEADER.DAILY,
								],
							}}
							showResultText={false}
							showResultCron={false}
						/>
					</div>
					<div className="text-gray-700 text-xs flex items-end pb-2 ">
						{scheduleValue &&
							cronstrue.toString(scheduleValue, {
								throwExceptionOnParseError: false,
							})}
					</div>

					<div className="col-span-2">
						<Button
							loading={submitting}
							disabled={isTargetEmpty}
							type="submit"
							className="float-right "
						>
							Create
						</Button>
					</div>
				</div>
			</div>
		</form>
	)
}
