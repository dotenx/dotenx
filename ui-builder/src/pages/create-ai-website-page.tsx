import { useEffect, useState } from 'react'
import { Stepper } from '@mantine/core'
import { FaWandMagicSparkles } from 'react-icons/fa6'
import BusinessInputs from './ai-components/business-inputs'
import NavigationButtons from './ai-components/navigation-buttons'
import { atom, useAtom } from 'jotai'
import LogoStep from './ai-components/logo-step'
import ContactInputs from './ai-components/contact-inputs'
import useScreenSize from './ai-components/use-screen-size'
import { motion } from 'framer-motion'

export const stepAtom = atom<number>(0)
export const formAtom = atom<{
	business_name: string
	business_type: string
	business_sub_type: string
	logo_url: string
	description: string
	contact_info: {
		country: string
		email: string
		state: string
		postcode: number | string
		x_link: string
		address1: string
		address2: string
		phone_number: number | string
		facebook_link: string
		instagram_link: string
	}
}>({
	business_name: '',
	business_type: '',
	business_sub_type: '',
	logo_url: '',
	description: '',
	contact_info: {
		country: 'Australia',
		email: '',
		state: '',
		postcode: '',
		x_link: '',
		address1: '',
		address2: '',
		phone_number: '',
		facebook_link: '',
		instagram_link: '',
	},
})
export default function CreateAIWebsitePage() {
	const [active, setActive] = useState(0)
	const [step] = useAtom(stepAtom)
	const screenSize = useScreenSize()
	useEffect(() => {
		switch (step) {
			case 0 | 1:
				setActive(0)
				break
			case 2:
				setActive(1)
				break
			case 3:
				setActive(2)
				break
		}
	}, [step])

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.75, ease: 'easeInOut' }}
		>
			<div className="pb-0 p-3 md:p-7 md:pb-0">
				<h2 className="mb-5 mt-5 md:mt-0 md:mb-10 font-medium text-lg md:text-xl flex items-center gap-2 mr-5">
					Create New Website
					<FaWandMagicSparkles />
				</h2>
				<Stepper
					styles={{
						root: {
							display: `${screenSize === 'desktop' ? 'flex' : 'block'}`,
							height: `${screenSize === 'desktop' && '80vh'}`,
						},
						steps: {
							width: `${screenSize === 'desktop' ? '20%' : '100%'}`,
						},
						step: { height: `${screenSize === 'desktop' ? '100px' : 'fit-content'}` },
						separator: { display: 'none' },
						content: {
							backgroundColor: 'rgb(249 250 251)',
							width: `${screenSize === 'desktop' ? '75%' : '100%'}`,
							overflow: 'hidden',
							minHeight: `${screenSize === 'desktop' ? '100vh' : '45vh'}`,
							position: `${screenSize === 'desktop' ? 'absolute' : 'static'}`,
							left: '25%',
							top: '0px',
							padding: `${screenSize === 'desktop' ? '40px' : '15px'}`,
						},
					}}
					active={active}
					onStepClick={setActive}
					orientation="vertical"
				>
					<Stepper.Step
						allowStepSelect={false}
						label="Business Information"
						description="What you want to share about your business?"
					>
						<div className="w-full h-full flex pt-10 md:pt-20 justify-start md:pl-10">
							<BusinessInputs />
						</div>
					</Stepper.Step>
					<Stepper.Step
						allowStepSelect={false}
						label="Upload Logo"
						description="We will put it on your website,you can change it anytime."
					>
						<div className="h-full w-[80vw] md:w-[40vw]  pb-5 pt-5 md:pt-16 justify-start md:pl-10">
							<LogoStep />
						</div>
					</Stepper.Step>
					<Stepper.Step
						allowStepSelect={false}
						label="Contact Info"
						description="How your visitors can reach you?"
					>
						<div className="h-full  pb-5 pt-16 justify-start md:pl-10">
							<ContactInputs />
						</div>
					</Stepper.Step>
				</Stepper>
				<NavigationButtons />
			</div>
		</motion.div>
	)
}
