import { Button, Select, TextInput } from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { FaChevronRight, FaStripe } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { z } from "zod"
import { purchaseDomain } from "../api"
import { QueryKey } from "../api/types"
import { useGetProjectTag } from "../features/hooks/use-project-query"
import useScreenSize from "../features/hooks/use-screen-size"
import { ContentWrapper, Header } from "../features/ui/header"
import { Loader } from "../features/ui/loader"

export function PurchaseDomain() {
	const { projectTag, projectName, isLoading: projectTagLoading } = useGetProjectTag()

	const client = useQueryClient()

	const navigate = useNavigate()

	const { onSubmit, ...form } = useForm({
		initialValues: {
			external_domain: "",
			first_name: "",
			last_name: "",
			city: "",
			au_id_number: "",
			au_id_type: "",
		},
		validate: {
			first_name: (value) => (value.length < 2 ? "Name must have at least 2 letters" : null),
			last_name: (value) => (value.length < 2 ? "Name must have at least 2 letters" : null),
			au_id_number: (value, values) =>
				values?.external_domain.endsWith(".com.au")
					? value.length < 2
						? "au id number must have at least 2 letters"
						: null
					: null,
			au_id_type: (value, values) =>
				values?.external_domain.endsWith(".com.au")
					? value.length < 2
						? "au id type must have at least 2 letters"
						: null
					: null,
			external_domain: (value) =>
				/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(
					value
				)
					? null
					: "Invalid domain",
		},
	})
	// const { onSubmit, ...form } = useForm()

	const { mutate, isLoading } = useMutation(purchaseDomain)
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"
	const isAu = form?.values?.external_domain?.endsWith(".com.au")
	// console.log({ projectTag: projectTag, ...form?.values })
	return (
		<div>
			<Header title={"Domains"} />
			<ContentWrapper>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ type: "spring", duration: 0.7 }}
					className={`${smallScreen ? " " : "px-20 max-w-4xl"} mx-auto py-10    `}
				>
					{projectTagLoading ? (
						<Loader className="mx-auto mt-16" />
					) : (
						<div
							className={`${
								smallScreen ? "p-3" : "p-5"
							} font-medium border-2  rounded-md  bg-white`}
						>
							<h1 className="my-2 text-2xl ">Purchase domain</h1>
							<form
								onSubmit={onSubmit((values) => {
									mutate(
										{ projectTag: projectTag, ...values }
										// {
										// 	onSuccess: () => {
										// 		navigate(`/${projectName}/domains`)
										// 	},
										// 	onError: (e: any) => {
										// 		{
										// 			toast(
										// 				e.response.data.message ||
										// 					"Something went wrong!",
										// 				{
										// 					type: "error",
										// 					autoClose: 2000,
										// 				}
										// 			),
										// 				navigate(`/${projectName}/domains`)
										// 		}
										// 	},
										// }
									)
								})}
							>
								<TextInput
									label="Add your domain"
									type="text"
									required
									placeholder="www.example.com"
									className="pt-1 pb-2"
									{...form.getInputProps("external_domain")}
								/>
								<div className="grid grid-cols-3 gap-5">
									<TextInput
										label="First name"
										type="text"
										required
										placeholder=""
										className="pt-1 pb-2"
										{...form.getInputProps("first_name")}
									/>
									<TextInput
										label="Last name"
										type="text"
										required
										placeholder=""
										className="pt-1 pb-2"
										{...form.getInputProps("last_name")}
									/>
									<TextInput
										label="City"
										type="text"
										required
										placeholder=""
										className="pt-1 pb-2"
										{...form.getInputProps("city")}
									/>
									{isAu && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ type: "spring", duration: 0.7 }}
										>
											<TextInput
												label="AU id number"
												type="text"
												required
												placeholder=""
												className="pt-1 pb-2"
												{...form.getInputProps("au_id_number")}
											/>
										</motion.div>
									)}
									{isAu && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ type: "spring", duration: 0.7 }}
										>
											<Select
												data={["ABN", "ACN", "TM"]}
												label="AU id type"
												type="text"
												required
												placeholder=""
												className="pt-1 pb-2"
												{...form.getInputProps("au_id_type")}
											/>
										</motion.div>
									)}
								</div>
								<div className="flex justify-end mt-10">
									<div className="flex items-center gap-x-3">
										<div className="cursor-default flex items-center  p-3 py-1	 text-sm text-slate-800 rounded gap-x-1 ">
											Powered by <FaStripe className="w-10 h-10 " />
										</div>
										<Button
											component={Link}
											to={`/${projectName}/domains`}
											variant={"default"}
										>
											Back
										</Button>
										<Button
											rightIcon={<FaChevronRight className="w-4 h-4" />}
											loading={isLoading}
											type="submit"
										>
											Purchase
										</Button>
									</div>
								</div>
							</form>
						</div>
					)}
				</motion.div>
			</ContentWrapper>
		</div>
	)
}
