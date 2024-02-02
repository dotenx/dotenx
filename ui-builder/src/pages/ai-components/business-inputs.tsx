import { useEffect, useState } from 'react'
import { Autocomplete, TextInput } from '@mantine/core'
import { useAtomValue, useSetAtom } from 'jotai'
import { TbSelector } from 'react-icons/tb'
import { formAtom, stepAtom } from '../create-ai-website-page'
import { motion } from 'framer-motion'
import useScreenSize from './use-screen-size'

export default function BusinessInputs() {
	const step = useAtomValue(stepAtom)
	const formAtomValue = useAtomValue(formAtom)
	const setformAtomValue = useSetAtom(formAtom)
	const [businessTypeValue, setBusinessTypeValue] = useState('')
	const [businessSubTypeValue, setBusinessSubTypeValue] = useState('')
	const businessTypes = ['Plubmer', 'Electrician', 'Barber', 'Mechanic']
	const [businessSubTypeData, setBusinessSubTypeData] = useState([''])
	const screenSize = useScreenSize()

	useEffect(() => {
		setBusinessSubTypeValue('')
		switch (businessTypeValue) {
			case 'Plubmer':
				setBusinessSubTypeData(['home', 'internal', 'outside'])
				break
			case 'Electrician':
				setBusinessSubTypeData(['Wind turbine', 'Solar Technician', 'Highway Systems'])
				break
			case 'Barber':
				setBusinessSubTypeData(['Private', 'Public', 'outside'])
				break
			case 'Mechanic':
				setBusinessSubTypeData([
					'Car',
					'Airplane',
					'Airplane',
					'Airplane',
					'Airplane',
					'Airplane',
				])
				break
			default:
				setBusinessSubTypeData([''])
				break
		}
	}, [businessTypeValue])
	useEffect(() => {
		setformAtomValue({
			...formAtomValue,
			business_type: businessTypeValue,
			business_sub_type: businessSubTypeValue,
		})
	}, [businessTypeValue, businessSubTypeValue])

	return (
		<div className="flex">
			{step === 0 && (
				<motion.div
					initial={{ opacity: 0, transform: 'translate(-100px)' }}
					animate={{ opacity: 1, transform: 'translate(0px)' }}
					transition={{ duration: 0.75, ease: 'easeInOut' }}
				>
					<TextInput
						size={'lg'}
						styles={{
							input: {
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								width: `${screenSize === 'desktop' ? '40vw' : '80vw'}`,
								marginTop: '10px',
							},
							label: {
								fontSize: `${screenSize === 'desktop' ? 'x-large' : 'medium'}`,
								fontWeight: 300,
							},
						}}
						label="Enter your business name"
						value={formAtomValue.business_name}
						onChange={(event) =>
							setformAtomValue({
								...formAtomValue,
								business_name: event.currentTarget.value,
							})
						}
					/>
				</motion.div>
			)}
			{step === 1 && (
				<motion.div
					initial={{ opacity: 0, transform: 'translate(-100px)' }}
					animate={{ opacity: 1, transform: 'translate(0px)' }}
					transition={{ duration: 0.75, ease: 'easeInOut' }}
					className={`${
						screenSize === 'desktop' ? 'flex' : ''
					}  gap-x-3 mt-10 md:mt-0 items-end h-[220px] md:h-fit`}
				>
					<Autocomplete
						label="Enter your business type"
						size={'lg'}
						styles={{
							input: {
								fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								width: `${screenSize === 'desktop' ? '26vw' : '80vw'}`,
								marginTop: '10px',
							},
							label: {
								fontSize: `${screenSize === 'desktop' ? 'x-large' : 'medium'}`,
								fontWeight: 300,
							},
							dropdown: {
								fontSize: '10px',
							},
						}}
						rightSection={<TbSelector className="w-5 h-5" />}
						placeholder="Select or add your business type"
						value={businessTypeValue}
						data={businessTypes}
						maxDropdownHeight={`${screenSize === 'desktop' ? 300 : 150}`}
						onChange={setBusinessTypeValue}
					/>
					<Autocomplete
						disabled={!businessTypeValue}
						size={'lg'}
						styles={{
							input: {
								fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								width: `${screenSize === 'desktop' ? '26vw' : '80vw'}`,
								marginTop: '10px',
							},
						}}
						rightSection={<TbSelector className="w-5 h-5" />}
						placeholder="Select or add your business sub-type"
						value={businessSubTypeValue}
						data={businessSubTypeData}
						maxDropdownHeight={`${screenSize === 'desktop' ? 300 : 150}`}
						onChange={setBusinessSubTypeValue}
					/>
				</motion.div>
			)}
		</div>
	)
}
