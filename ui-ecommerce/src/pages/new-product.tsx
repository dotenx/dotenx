import {
	Button,
	Checkbox,
	Image,
	Modal,
	NumberInput,
	Popover,
	Select,
	Switch,
	Textarea,
	TextInput,
} from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import _ from "lodash"
import { useEffect, useState } from "react"
import { FaHashtag, FaPlus } from "react-icons/fa"
import { MdClose } from "react-icons/md"
import { createProduct, currency, getIntegrations, getProject, QueryKey } from "../api"
import { TiDelete } from "react-icons/ti"
import { AttachmentPage } from "../features/app/attachment"
import { Editor } from "../features/editor/editor"
import { ContentWrapper, Header } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import { IntegrationForm } from "../features/app/addIntegrationForm"
import { toast } from "react-toastify"
import { useNavigate, useParams } from "react-router-dom"
import { ImageDrop } from "../features/ui/image-drop"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function NewProductPage() {
	const [activeTab, setActiveTab] = useState<"details" | "content" | "attachment">("details")
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const { getInputProps, values, setValues } = useForm({
		initialValues: {
			name: "",
			type: "one-time",
			price: 0,
			recurring_payment: {},
			currency: "USD",
			thumbnails: [],
			description: "",
			summary: "",
			limitation: -1,
			file_names: [],
			tags: [],
			image_url: "",
			details: {},
			metadata: {},
			content: "",
			preview_link: "",
			download_link: "",
			status: "unpublished",
		},
	})
	return (
		<div>
			<Header
				tabs={["details", "content", "attachment"]}
				title="New Product"
				activeTab={activeTab}
				onTabChange={setActiveTab}
			>
				<ActionBar values={values} tag={projectTag} />
			</Header>
			<ContentWrapper>
				<form>
					{activeTab === "details" && (
						<DetailsTab
							getInputProps={getInputProps}
							values={values}
							setValues={setValues}
						/>
					)}
					{activeTab === "content" && <ContentTab />}
				</form>
				{activeTab === "attachment" && (
					<AttachmentPage tag={projectTag} setValues={setValues} values={values} />
				)}
			</ContentWrapper>
		</div>
	)
}

function DetailsTab({
	getInputProps,
	values,
	setValues,
}: {
	getInputProps: any
	values: any
	setValues: any
}) {
	const [tag, setTag] = useState("")
	const [thumbnailPopOpen, setThumbnailPopOpen] = useState(false)
	const [thumbnailSrc, setThumbnailSrc] = useState("")
	const [oneTimePrice, setOneTimePrice] = useState<number>(values.price)
	const formDetailsValue =
		Object.keys(values?.details).map((key) => {
			return { [key]: values?.details[key] }
		}) ?? []
	const [attributesList, setAttributesList] = useState(formDetailsValue)
	const [thumbnailList, setThumbnailList] = useState<string[]>(values.thumbnails)
	const [priceList, setPriceList] = useState<
		{
			price: ""
			recurring_interval_count: 0
			is_default: false
			recurring_interval: "month"
		}[]
	>(values.recurring_payment?.prices || [])
	const [limitation, setLimitation] = useState(values.limitation)
	const [categories, setCategories] = useState<string[]>(values.tags)
	const details = attributesList.length === 0 ? values?.details ?? {} : {}
	for (let i = 0; i < attributesList.length; i++) {
		Object.assign(details, attributesList[i])
	}
	const handleClick = () => {
		setCategories((current) => [...current, tag])
	}
	useEffect(() => {
		setValues({
			thumbnails: thumbnailList,
			limitation: limitation,
			tags: categories,
			details: details,
			price: oneTimePrice,
			recurring_payment: values.type === "one-time" ? {} : { prices: priceList },
		})
	}, [
		thumbnailList,
		limitation,
		categories,
		values.type,
		values.details,
		attributesList,
		priceList,
		oneTimePrice,
	])

	return (
		<div className="grid grid-cols-3 gap-20">
			<div className="flex flex-col w-full gap-5 col-span-2">
				<div className="border-b pb-5 border-gray-300 space-y-5 ">
					<div className="text-lg font-semibold">Product</div>
					<div className="flex items-center gap-x-5 ">
						<TextInput
							label="Name"
							required
							placeholder="Name"
							name="product name"
							{...getInputProps("name")}
						/>
						<Select
							data={["one-time", "membership"]}
							defaultValue="one-time"
							label="Type"
							placeholder="Type"
							name="type"
							{...getInputProps("type")}
						/>
					</div>
					<Textarea
						label="Short description"
						placeholder="Description"
						minRows={3}
						name="description"
						{...getInputProps("description")}
					/>
					<Textarea
						label="Long description"
						placeholder="Description"
						minRows={5}
						name="summary"
						{...getInputProps("summary")}
					/>
				</div>
				<div className="border-b pb-5 border-gray-300 space-y-5 ">
					<div className="text-lg font-semibold">Pricing</div>
					{values.type === "one-time" ? (
						<div className="flex items-center gap-x-5">
							<TextInput
								required
								type={"number"}
								label="Price"
								placeholder="0"
								name="price"
								value={values.price}
								onChange={(event) =>
									setOneTimePrice(_.toNumber(event.currentTarget.value))
								}
							/>
							<Select
								searchable
								className="w-24"
								defaultValue={currency[0]}
								label="Currency"
								data={currency}
								{...getInputProps("currency")}
							/>
						</div>
					) : (
						<div>
							<MonthlyPricingInput
								list={priceList}
								getInputProps={getInputProps}
								setList={setPriceList}
							/>
							{priceList.length > 0 && (
								<div className=" my-2 grid grid-cols-2 gap-x-10 gap-y-3 mt-5">
									{_.sortBy(priceList, [
										function (o) {
											return _.toNumber(o?.recurring_interval_count)
										},
									]).map(
										(p: {
											price: string
											recurring_interval_count: number
											is_default: boolean
										}) => (
											<div
												key={p.recurring_interval_count}
												className="flex group relative items-center gap-x-1  px-2 pr-4 hover:border-red-300  bg-white border  p-1 cursor-pointer text-sm  transition-all hover:bg-red-50  "
												onClick={() =>
													setPriceList(
														priceList.filter((price) => price !== p)
													)
												}
											>
												<div className="flex-grow w-[50px] truncate">
													{p.price}
													<span className="text-xs font-light ml-1">
														{values.currency}
													</span>
												</div>
												<div className=" text-end">per</div>
												<div className="font-light text-center">
													{p.recurring_interval_count}
												</div>
												<div>month(s)</div>
												{p.is_default && (
													<Checkbox
														readOnly
														checked
														className="ml-2"
														size="xs"
													/>
												)}

												<MdClose className="opacity-0 group-hover:opacity-100  transition-all absolute top-[2px] text-red-600 right-[2px] h-3 w-3" />
											</div>
										)
									)}
								</div>
							)}
						</div>
					)}
				</div>
				<div className="pb-5  space-y-5  ">
					<div className="text-lg font-semibold">Details</div>
					<div className="flex items-end justify-between">
						<div>
							<TextInput
								rightSection={
									<Button
										className="mr-4 hover:!bg-rose-900 transition-all "
										size="xs"
										disabled={tag.length === 0}
										onClick={() => {
											handleClick(), setTag("")
										}}
									>
										<FaHashtag className="h-[14px] w-[14px] " />
									</Button>
								}
								disabled={categories.length === 6}
								label={<div>Categories</div>}
								placeholder={"sale"}
								value={tag}
								onChange={(event) => setTag(event.currentTarget.value)}
							/>
						</div>
						<Switch
							size="md"
							checked={limitation > 0}
							onChange={(event) =>
								setLimitation(event.currentTarget.checked ? 1 : -1)
							}
							label={
								<span
									className={`${
										limitation ? "text-black " : "text-gray-500"
									} hover:text-black hover:cursor-pointer transition-all`}
								>
									Limitaion
								</span>
							}
						/>
					</div>
					<div className="flex items-center justify-between ">
						<div
							className={`flex items-center gap-x-2 -mt-5  flex-wrap mr-[10px]  overflow-x-auto ${
								!limitation ? "full" : "w-[500px]"
							} `}
						>
							{categories.map((c) => (
								<div
									key={c}
									onClick={() =>
										setCategories(
											categories.filter((category) => category !== c)
										)
									}
									className="group relative truncate mt-2	 transition-all duration-100 hover:pr-6 rounded p-2 flex items-center hover:bg-rose-200 bg-gray-200 text-sm cursor-pointer "
								>
									<FaHashtag className="h-3 w-3 mr-1" /> {c}
									<TiDelete className="hidden absolute top-1 right-0 duration-200 transition-all h-4 w-4  text-rose-600 group-hover:block " />
								</div>
							))}
						</div>
						{limitation > 0 && (
							<div className="border p-3 bg-white rounded  w-[300px]">
								<NumberInput
									value={limitation}
									min={1}
									onChange={(val = 0) => {
										setLimitation(val)
									}}
									type={"number"}
									label={
										<span className="text-xs">Maximum amount of purchases</span>
									}
								/>
							</div>
						)}
					</div>
					<KeyValueInput list={attributesList} setList={setAttributesList} />
					{(formDetailsValue.length > 0 || attributesList.length > 0) && (
						<div className="grid grid-cols-2 my-2 gap-y-2 gap-x-5 mt-5 rounded">
							{(attributesList || formDetailsValue).map((a, index) => (
								<div
									key={index}
									className="flex group relative items-center px-5 gap-x-1 hover:border-red-300  bg-white border  p-1 justify-between cursor-pointer text-sm  transition-all hover:bg-red-50 "
									onClick={() =>
										setAttributesList(
											attributesList.filter((attr: any) => attr !== a)
										)
									}
								>
									<div className="truncate">{Object.keys(a)} </div>
									<div className="font-light truncate">{Object.values(a)}</div>
									<MdClose className="opacity-0 group-hover:opacity-100  transition-all absolute top-[2px] text-red-600 right-[2px] h-3 w-3" />
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			<div className="space-y-8 bg-white p-2 rounded ">
				<ImageDrop
					label={
						<span>
							Cover image <span className="text-red-500">*</span>
						</span>
					}
					src={values.image_url}
					onChange={(src) => setValues({ image_url: src })}
				/>
				<div className="pt-5">
					<ImageDrop
						label="Thumbnail"
						src={thumbnailSrc}
						onChange={(src) => setThumbnailSrc(src)}
					/>
					<Popover withArrow opened={thumbnailPopOpen} onChange={setThumbnailPopOpen}>
						<Popover.Target>
							<Button
								disabled={!thumbnailSrc}
								variant="default"
								size="xs"
								className="mt-2 mb-5"
								onClick={() => {
									thumbnailList.length >= 6
										? setThumbnailPopOpen(true)
										: (setThumbnailList((current: any) => [
												...current,
												thumbnailSrc,
										  ]),
										  setThumbnailSrc(""))
								}}
							>
								Add thumbnail
							</Button>
						</Popover.Target>

						<Popover.Dropdown>
							<span className="text-xs">You can not add more than 6 thumbnails</span>
						</Popover.Dropdown>
					</Popover>

					<div>
						{thumbnailList.map((t, index) => (
							<div
								key={index}
								className="flex relative group items-center border p-1  mb-2 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer gap-x-5"
								onClick={() =>
									setThumbnailList(thumbnailList.filter((tl) => tl !== t))
								}
							>
								<Image height={"50px"} width="50px" src={t} />
								<div className="text-sm">Thumbnail {index + 1}</div>
								<MdClose className="opacity-0 group-hover:opacity-100  transition-all absolute top-[2px] text-red-600 right-[2px] h-3 w-3" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
const KeyValueInput = ({ list, setList }: { list: any; setList: any }) => {
	const [key, setKey] = useState("")
	const [value, setValue] = useState("")
	const [object, setObject] = useState({})

	useEffect(() => {
		setObject({ [key]: value })
	}, [key, value])
	const clear = () => {
		setKey("")
		setValue("")
		setObject({})
	}
	const duplicateKey = list.map((d: any) => Object.keys(d).indexOf(key) === 0).includes(true)
	return (
		<div className="flex items-end gap-x-5">
			<TextInput
				label="Additional details"
				placeholder="color"
				value={key}
				onChange={(event) => setKey(event.currentTarget.value)}
			/>
			<TextInput
				placeholder="blue"
				value={value}
				onChange={(event) => setValue(event.currentTarget.value)}
			/>
			<Button
				leftIcon={<FaPlus className="w-4 h-4" />}
				disabled={duplicateKey || !key || !value}
				onClick={() => {
					setList((current: any) => [...current, object]), clear()
				}}
			>
				Add
			</Button>
		</div>
	)
}
const MonthlyPricingInput = ({
	list,
	setList,
	getInputProps,
}: {
	list: any
	setList: any
	getInputProps: any
}) => {
	const monthOptions = [
		{ value: "1", label: "1" },
		{ value: "2", label: "2" },
		{ value: "3", label: "3" },
		{ value: "4", label: "4" },
		{ value: "5", label: "5" },
		{ value: "6", label: "6" },
		{ value: "7", label: "7" },
		{ value: "8", label: "8" },
		{ value: "9", label: "9" },
		{ value: "10", label: "10" },
		{ value: "11", label: "11" },
		{ value: "12", label: "12" },
	]
	const filteredMonthOptions = monthOptions.filter((o) => {
		const months = list?.map((l: any) => {
			return l.recurring_interval_count
		})
		return !months.includes(o.value)
	})
	const selectedMonths = monthOptions.filter((o) => {
		const months = list?.map((l: any) => {
			return _.toString(l.recurring_interval_count)
		})
		return months.includes(o.value)
	})
	const [price, setPrice] = useState(0)
	const [month, setMonth] = useState("")

	const [defaultMonth, setDefaultMonth] = useState(selectedMonths[0]?.value)
	const [pricePerMonth, setPricePerMonth] = useState({ price: 0, recurring_interval_count: 1 })
	useEffect(() => {
		setPricePerMonth({ price: price, recurring_interval_count: _.toNumber(month) })
	}, [price, month])
	useEffect(() => {
		if (!selectedMonths.map((s) => s.value).includes(defaultMonth))
			setDefaultMonth(selectedMonths[0]?.value)
	}, [selectedMonths])
	useEffect(() => {
		setList(
			list.map(
				(p: {
					recurring_interval_count: number
					is_default: boolean
					recurring_interval: string
				}) => {
					if (p.recurring_interval_count === _.toNumber(defaultMonth)) {
						p.is_default = true
						p.recurring_interval = "month"
					} else {
						p.is_default = false
						p.recurring_interval = "month"
					}
					return p
				}
			)
		)
	}, [defaultMonth])
	const clear = () => {
		setPrice(0)
		setMonth("")
		setPricePerMonth({ price: 0, recurring_interval_count: 1 })
	}
	return (
		<div>
			<div className="flex items-end gap-x-5">
				<TextInput
					required
					disabled={filteredMonthOptions.length === 0}
					label="Price"
					placeholder={"0"}
					type={"number"}
					value={price}
					onChange={(event) => setPrice(_.toNumber(event.currentTarget.value))}
				/>
				<Select
					disabled={filteredMonthOptions.length === 0}
					label="Month"
					placeholder="select"
					className="w-24"
					data={filteredMonthOptions}
					value={month}
					onChange={(value: string) => setMonth(value)}
				/>
				<Select
					className="w-24"
					defaultValue={currency[0]}
					searchable
					label="Currency"
					data={currency}
					{...getInputProps("currency")}
				/>

				<Button
					disabled={filteredMonthOptions.length === 0 || !price || !month}
					leftIcon={<FaPlus className="w-4 h-4" />}
					onClick={() => {
						setList((current: any) => [...current, pricePerMonth]), clear()
					}}
				>
					Add
				</Button>
			</div>
			{selectedMonths.length > 0 && (
				<div className="flex text-xs items-center gap-x-2 mt-3">
					default price
					<Select
						className="w-12 "
						defaultValue={selectedMonths[0].value}
						value={defaultMonth}
						size="xs"
						data={selectedMonths}
						onChange={(v: string) => setDefaultMonth(v)}
					/>
					month(s)
				</div>
			)}
		</div>
	)
}
function ActionBar({ values, tag }: { values: any; tag: string }) {
	const navigate = useNavigate()
	const { projectName = "" } = useParams()

	const { mutate, isLoading } = useMutation(() => createProduct({ tag, payload: values }), {
		onSuccess: () => {
			toast("Product added successfully", { type: "success", autoClose: 2000 }),
				navigate(`/projects/${projectName}/products`)
		},
	})
	const [openModal, setOpenModal] = useState(false)
	const query = useQuery([QueryKey.GetIntegrations], getIntegrations)
	const client = useQueryClient()
	const noIntegration =
		(
			query?.data?.data
				?.map((d) => {
					if (["stripe"].includes(d.type)) return d.type
				})
				.filter((d) => d !== undefined) || []
		).length === 0
	return (
		<div className="flex gap-x-5 items-center">
			{noIntegration && query.isSuccess && (
				<div className="text-sm p-1 px-2 bg-blue-50 rounded text-gray-600 flex items-center gap-x-2">
					You must connect your account to Stripe to create products{" "}
					<Button onClick={() => setOpenModal(true)} color="blue" size="xs">
						Connect
					</Button>
				</div>
			)}
			<Button
				disabled={
					noIntegration ||
					(values.type === "membership"
						? values?.recurring_payment?.prices?.length === 0
						: values?.price === 0) ||
					!values.name ||
					!values.image_url
				}
				loading={isLoading}
				onClick={() => mutate()}
			>
				Create product
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
		</div>
	)
}

const ContentTab = () => {
	return <Editor onSave={(value) => console.log(value)} />
}
