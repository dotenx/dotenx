import { getIntegrations, QueryKey } from "../../api"

import { Button, Modal } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { BiPlus } from "react-icons/bi"
import { IntegrationForm } from "./addIntegrationForm"

export default function CheckIntegration() {
	//use this component later for integrations
	const [openModal, setOpenModal] = useState(false)
	const [integration, setIntegration] = useState("")
	const query = useQuery([QueryKey.GetIntegrations], getIntegrations)

	const integrations =
		query?.data?.data
			.map((d) => {
				if (["stripe", "sendGrid"].includes(d.type)) return d.type
			})
			.filter((d) => d !== undefined) || []
	useEffect(() => {
		if (
			!integrations.includes("stripe") ||
			(!integrations.includes("sendGrid") && query.isSuccess)
		)
			setOpenModal(true)
		if (integrations.includes("stripe") && integrations.includes("sendGrid"))
			setOpenModal(false)
	}, [query?.data?.data])
	// console.log(integrations, !integrations.includes("stripe" || "sendGrid"), "integration")
	return (
		<>
			<Modal
				trapFocus={false}
				opened={openModal}
				withCloseButton={false}
				onClose={() => setOpenModal(false)}
			>
				<div>
					<div className="font-normal text-sm">
						In order to be able to use ecommerce features you need to add{" "}
						{integrations.length === 1 ? "this integration" : "these integrations"}:
					</div>
					<div className="flex items-center gap-x-5">
						{!integrations.includes("stripe") && (
							<div
								onClick={() => {
									setOpenModal(false), setIntegration("stripe")
								}}
								className="flex items-center truncate w-[100px] hover:w-[120px] justify-center group  bg-gray-100 p-3 rounded-[10px] mt-4 mb-2 cursor-pointer hover:bg-gray-800 hover:text-white transition-all"
							>
								<BiPlus className="hidden text-white group-hover:block h-5  w-5 mr-[2px] transition-all" />
								Stripe
							</div>
						)}
						{!integrations.includes("sendGrid") && (
							<div
								onClick={() => {
									setOpenModal(false), setIntegration("sendGrid")
								}}
								className="flex items-center truncate w-[100px] hover:w-[120px] justify-center group  bg-gray-100 p-3 rounded-[10px] mt-4 mb-2 cursor-pointer hover:bg-gray-800 hover:text-white transition-all"
							>
								<BiPlus className="hidden text-white group-hover:block h-5  w-5 mr-[2px] transition-all" />
								SendGrid
							</div>
						)}
					</div>
					<div className="w-full flex justify-end">
						<Button size="xs" variant="subtle" onClick={() => setOpenModal(false)}>
							Not Now
						</Button>
					</div>
				</div>
			</Modal>
			<Modal opened={!!integration} onClose={() => setIntegration("")}>
				<IntegrationForm
					onBack={() => {
						setIntegration(""), setOpenModal(true)
					}}
					integrationKind={integration}
					onSuccess={() => alert("Done.")}
				/>
			</Modal>
		</>
	)
}
