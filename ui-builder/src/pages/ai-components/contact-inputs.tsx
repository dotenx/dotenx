import { useEffect, useState } from 'react'
import { Autocomplete, Select, Textarea, TextInput, Transition } from '@mantine/core'
import { useAtomValue, useSetAtom } from 'jotai'
import { IoLocationOutline } from 'react-icons/io5'
import { FaXTwitter } from 'react-icons/fa6'
import { IoLogoInstagram } from 'react-icons/io5'
import { SlSocialFacebook } from 'react-icons/sl'
import { AiOutlinePhone } from 'react-icons/ai'
import { MdOutlineMail } from 'react-icons/md'
import { formAtom, stepAtom } from '../create-ai-website-page'
import { motion } from 'framer-motion'
import useScreenSize from './use-screen-size'

import _ from 'lodash'
export default function ContactInputs() {
	const step = useAtomValue(stepAtom)
	const formAtomValue = useAtomValue(formAtom)
	const setformAtomValue = useSetAtom(formAtom)
	const [countryValue, setCountryValue] = useState<string | null>('Australia')
	const [stateValue, setStateValue] = useState<string | null>('SA')
	const screenSize = useScreenSize()

	useEffect(() => {
		setformAtomValue({
			...formAtomValue,
			contact_info: {
				...formAtomValue?.contact_info,
				country: countryValue ?? '',
				state: stateValue ?? '',
			},
		})
	}, [countryValue, stateValue])
	return (
		<div className="flex flex-col">
			<motion.h2
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, ease: 'easeInOut', delay: 0.25 }}
				className="font-light text-lg md:text-2xl mb-5"
			>
				Enter your contact info
			</motion.h2>
			{step === 3 && (
				<motion.div
					initial={{ opacity: 0, transform: 'translate(-100px)' }}
					animate={{ opacity: 1, transform: 'translate(0px)' }}
					transition={{ duration: 0.75, ease: 'easeInOut' }}
					className="flex flex-col gap-x-3 w-full items-start gap-5 h-fit"
				>
					<Textarea
						required
						minRows={2}
						maxRows={4}
						label="Address line 1"
						size={'lg'}
						styles={{
							input: {
								fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								marginTop: '10px',
								width: `${screenSize === 'desktop' ? '47vw' : '80vw'}`,
							},
							label: {
								fontSize: `${screenSize === 'desktop' ? 'large' : 'medium'}`,

								fontWeight: 300,
							},
						}}
						rightSection={<IoLocationOutline className="w-5 h-5" />}
						value={formAtomValue.contact_info.address1}
						onChange={(event) =>
							setformAtomValue({
								...formAtomValue,
								contact_info: {
									...formAtomValue.contact_info,
									address1: event.target.value,
								},
							})
						}
					/>
					<Textarea
						minRows={2}
						maxRows={4}
						label="Address line 2"
						size={'lg'}
						styles={{
							input: {
								fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								marginTop: '10px',
								width: `${screenSize === 'desktop' ? '47vw' : '80vw'}`,
							},
							label: {
								fontSize: `${screenSize === 'desktop' ? 'large' : 'medium'}`,
								fontWeight: 300,
							},
						}}
						rightSection={<IoLocationOutline className="w-5 h-5" />}
						value={formAtomValue.contact_info.address2}
						onChange={(event) =>
							setformAtomValue({
								...formAtomValue,
								contact_info: {
									...formAtomValue.contact_info,
									address2: event.target.value,
								},
							})
						}
					/>
					<div className="flex  gap-x-3 w-[80vw] md:w-[47vw] gap-5 h-fit">
						<Select
							defaultValue={'Australia'}
							searchable
							disabled
							required
							label="Country"
							size={'lg'}
							styles={{
								input: {
									fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
									border: 'none',
									borderBottom: '1px solid gray',
									borderRadius: '0px',
									marginTop: '10px',
									width: 'full',
								},
								label: {
									fontSize: `${screenSize === 'desktop' ? 'large' : 'medium'}`,
									fontWeight: 300,
								},
							}}
							data={['Australia', 'Iran', 'USA', 'Japan']}
							value={countryValue}
							onChange={setCountryValue}
						/>
						<Select
							defaultValue={'SA'}
							label="State"
							size={'lg'}
							styles={{
								input: {
									fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
									border: 'none',
									borderBottom: '1px solid gray',
									borderRadius: '0px',
									marginTop: '10px',
									width: 'full',
								},
								label: {
									fontSize: `${screenSize === 'desktop' ? 'large ' : 'medium'}`,
									fontWeight: 300,
								},
							}}
							data={['SA', 'TAS', 'VIC', 'WA', 'NSW', 'QLD']}
							value={stateValue}
							onChange={setStateValue}
						/>
						<TextInput
							type={'number'}
							label="Postcode"
							size={'lg'}
							styles={{
								input: {
									fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
									border: 'none',
									borderBottom: '1px solid gray',
									borderRadius: '0px',
									marginTop: '10px',
									width: 'full',
								},
								label: {
									fontSize: `${screenSize === 'desktop' ? 'large ' : 'medium'}`,
									fontWeight: 300,
								},
							}}
							value={formAtomValue.contact_info.postcode}
							onChange={(event) =>
								setformAtomValue({
									...formAtomValue,
									contact_info: {
										...formAtomValue.contact_info,
										postcode: _.toNumber(event.currentTarget.value),
									},
								})
							}
						/>
					</div>
				</motion.div>
			)}
			{step === 4 && (
				<motion.div
					initial={{ opacity: 0, transform: 'translate(-100px)' }}
					animate={{ opacity: 1, transform: 'translate(0px)' }}
					transition={{ duration: 0.75, ease: 'easeInOut' }}
					className="flex flex-col gap-x-3 w-full items-start gap-5 h-fit"
				>
					<TextInput
						type={'number'}
						label="Tel"
						size={'lg'}
						styles={{
							input: {
								fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								marginTop: '10px',
								width: `${screenSize === 'desktop' ? '40vw' : '80vw'}`,
							},
							label: {
								fontSize: `${screenSize === 'desktop' ? 'large ' : 'medium'}`,
								fontWeight: 300,
							},
						}}
						rightSection={<AiOutlinePhone className="w-5 h-5" />}
						value={formAtomValue.contact_info.phone_number}
						onChange={(event) =>
							setformAtomValue({
								...formAtomValue,
								contact_info: {
									...formAtomValue.contact_info,
									phone_number: _.toNumber(event.target.value),
								},
							})
						}
					/>
					<TextInput
						type={'email'}
						label="Email"
						size={'lg'}
						styles={{
							input: {
								fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								marginTop: '10px',
								width: `${screenSize === 'desktop' ? '40vw' : '80vw'}`,
							},
							label: {
								fontSize: `${screenSize === 'desktop' ? 'large ' : 'medium'}`,
								fontWeight: 300,
							},
						}}
						rightSection={<MdOutlineMail className="w-5 h-5" />}
						value={formAtomValue.contact_info.email}
						onChange={(event) =>
							setformAtomValue({
								...formAtomValue,
								contact_info: {
									...formAtomValue.contact_info,
									email: event.target.value,
								},
							})
						}
					/>
				</motion.div>
			)}
			{step === 5 && (
				<motion.div
					initial={{ opacity: 0, transform: 'translate(-100px)' }}
					animate={{ opacity: 1, transform: 'translate(0px)' }}
					transition={{ duration: 0.75, ease: 'easeInOut' }}
					className="flex flex-col gap-x-3 w-full items-start gap-5 h-fit"
				>
					<TextInput
						label="Instagram"
						size={'lg'}
						styles={{
							input: {
								fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								marginTop: '10px',
								width: `${screenSize === 'desktop' ? '40vw' : '80vw'}`,
							},
							label: {
								fontSize: `${screenSize === 'desktop' ? 'large ' : 'medium'}`,
								fontWeight: 300,
							},
						}}
						rightSection={<IoLogoInstagram className="w-5 h-5" />}
						value={formAtomValue.contact_info.instagram_link}
						onChange={(event) =>
							setformAtomValue({
								...formAtomValue,
								contact_info: {
									...formAtomValue.contact_info,
									instagram_link: event.target.value,
								},
							})
						}
					/>
					<TextInput
						label="Facebook"
						size={'lg'}
						styles={{
							input: {
								fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								marginTop: '10px',
								width: `${screenSize === 'desktop' ? '40vw' : '80vw'}`,
							},
							label: {
								fontSize: `${screenSize === 'desktop' ? 'large ' : 'medium'}`,
								fontWeight: 300,
							},
						}}
						rightSection={<SlSocialFacebook className="w-5 h-5" />}
						value={formAtomValue.contact_info.facebook_link}
						onChange={(event) =>
							setformAtomValue({
								...formAtomValue,
								contact_info: {
									...formAtomValue.contact_info,
									facebook_link: event.target.value,
								},
							})
						}
					/>
					<TextInput
						label="X"
						size={'lg'}
						styles={{
							input: {
								fontSize: `${screenSize === 'desktop' ? 'medium' : 'small'}`,
								border: 'none',
								borderBottom: '1px solid gray',
								borderRadius: '0px',
								marginTop: '10px',
								width: `${screenSize === 'desktop' ? '40vw' : '80vw'}`,
							},
							label: {
								fontSize: `${screenSize === 'desktop' ? 'large ' : 'medium'}`,
								fontWeight: 300,
							},
						}}
						rightSection={<FaXTwitter className="w-5 h-5" />}
						value={formAtomValue.contact_info.x_link}
						onChange={(event) =>
							setformAtomValue({
								...formAtomValue,
								contact_info: {
									...formAtomValue.contact_info,
									x_link: event.target.value,
								},
							})
						}
					/>
				</motion.div>
			)}
		</div>
	)
}
