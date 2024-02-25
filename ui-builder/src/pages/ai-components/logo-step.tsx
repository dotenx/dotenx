import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useScreenSize from './use-screen-size'
import { useAtomValue, useSetAtom } from 'jotai'
import { formAtom, stepAtom } from '../create-ai-website-page'
import { LogoDrop } from './logo-drop'

export default function LogoStep() {
	const formAtomValue = useAtomValue(formAtom)
	const [logoUrl, setLogoUrl] = useState(formAtomValue.logo_url)
	const [logoKey, setLogoKey] = useState(formAtomValue.logo_key)
	const screenSize = useScreenSize()
	const setformAtomValue = useSetAtom(formAtom)
	const step = useAtomValue(stepAtom)
	useEffect(() => {
		setformAtomValue({
			...formAtomValue,
			logo_key: logoKey,
			logo_url: logoUrl,
		})
	}, [logoUrl, logoKey])
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
					<LogoDrop
						onChange={(src) => {
							setLogoKey(src.key), setLogoUrl(src.url)
						}}
						src={formAtomValue.logo_url}
					/>
				</motion.div>
			)}
		</div>
	)
}
