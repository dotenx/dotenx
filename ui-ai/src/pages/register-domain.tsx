import { Button, TextInput } from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { z } from "zod"
import { addDomain } from "../api"
import { QueryKey } from "../api/types"
import { useGetProjectTag } from "../features/hooks/use-project-query"
import useScreenSize from "../features/hooks/use-screen-size"
import { ContentWrapper, Header } from "../features/ui/header"
import { Loader } from "../features/ui/loader"

export function RegisterDomain() {
	const { projectTag, projectName, isLoading: projectTagLoading } = useGetProjectTag()

	const client = useQueryClient()
	const schema = z.object({
		external_domain: z
			.string()
			.regex(/^[a-zA-Z0-9]*[a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, {
				message: "Please add a valid domain.",
			}),
	})
	const { onSubmit, ...form } = useForm({
		validate: zodResolver(schema),
	})
	const { mutate, isLoading } = useMutation(
		addDomain
		//     , {
		// 	onSuccess: () => client.invalidateQueries([QueryKey.GetDomains]),
		// 	onError: (e: any) => {
		// 		toast(e.response.data.message || "Something went wrong!", {
		// 			type: "error",
		// 			autoClose: 2000,
		// 		})
		// 	},
		// }
	)
	const navigate = useNavigate()

	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"
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
							} font-medium border-2  rounded-md p-3 bg-white`}
						>
							<p className="my-2 ">You have not added any domains yet.</p>
							<form
								onSubmit={onSubmit((domainName) =>
									mutate(
										{ projectTag: projectTag, domainName: domainName },
										{
											onSuccess: () => {
												navigate(`/${projectName}/domains`)
											},
											onError: (e: any) => {
												{
													toast(
														e.response.data.message ||
															"Something went wrong!",
														{
															type: "error",
															autoClose: 2000,
														}
													),
														navigate(`/${projectName}/domains`)
												}
											},
										}
									)
								)}
							>
								<TextInput
									label="Add your domain"
									type="text"
									required
									placeholder="www.example.com"
									className="pt-1 pb-2"
									{...form.getInputProps("external_domain")}
								/>
								<div className="flex gap-4 justify-end mt-8">
									<Button
										component={Link}
										to={`/${projectName}/domains`}
										variant={"default"}
									>
										Back
									</Button>
									<Button loading={isLoading} type="submit">
										Add domain
									</Button>
								</div>
							</form>
						</div>
					)}
				</motion.div>
			</ContentWrapper>
		</div>
	)
}
