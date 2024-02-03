import { FaAngleLeft } from 'react-icons/fa6'
import { FaAngleRight } from 'react-icons/fa6'
import { Button } from '@mantine/core'
import { stepAtom } from '../create-ai-website-page'
import { useAtom } from 'jotai'
import { PiMagicWandLight } from 'react-icons/pi'

export default function NavigationButtons() {
	const [step, setStep] = useAtom(stepAtom)
	return (
		<div className="flex bg-[#f9fafb] w-full md:w-[70%] justify-end pb-5 md:mb-5  md:absolute right-10 bottom-12 gap-x-3">
			<Button
				disabled={step === 0}
				onClick={() => {
					setStep((prev) => prev - 1)
				}}
				leftIcon={<FaAngleLeft />}
				variant={'default'}
			>
				Prev
			</Button>
			{step < 5 ? (
				<Button
					onClick={() => {
						setStep((prev) => prev + 1)
					}}
					rightIcon={<FaAngleRight />}
					variant={'default'}
				>
					Next
				</Button>
			) : (
				<Button rightIcon={<PiMagicWandLight />} color={'dark'}>
					Create
				</Button>
			)}
		</div>
	)
}
