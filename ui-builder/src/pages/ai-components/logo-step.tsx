import { useState } from 'react'
import { ImageDrop } from '../../features/ui/image-drop'
import { motion } from 'framer-motion'
import useScreenSize from './use-screen-size'
import { useAtomValue, useSetAtom } from 'jotai'
import { formAtom, stepAtom } from '../create-ai-website-page'
import { Tabs, TextInput } from '@mantine/core'

export default function LogoStep() {
	const [logoUrl, setlogoUrl] = useState('')
	const screenSize = useScreenSize()
	const setformAtomValue = useSetAtom(formAtom)
	const formAtomValue = useAtomValue(formAtom)
	const step = useAtomValue(stepAtom)
	return (
		<div className="flex">
			{step === 2 && (
				<motion.div
					initial={{ opacity: 0, transform: 'translate(-100px)' }}
					animate={{ opacity: 1, transform: 'translate(0px)' }}
					transition={{ duration: 0.75, ease: 'easeInOut' }}
				>
					<h1
						style={{
							display: 'inline-block',
							color: '#212529',
							fontSize: `${screenSize === 'desktop' ? 'x-large' : 'medium'}`,
							fontWeight: 300,
							marginBottom: '10px',
						}}
					>
						Upload Your logo
					</h1>
					<ImageDrop onChange={(src) => setlogoUrl(src)} src={logoUrl} />
				</motion.div>
			)}
		</div>
	)
}
