/* eslint-disable react/jsx-key */
import clsx from 'clsx'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { IoCheckmark, IoCopy } from 'react-icons/io5'
import useCopyClipboard from 'react-use-clipboard'

export function JsonCode({ code }: { code: string | Record<string, unknown> }) {
	const displayCode = typeof code === 'string' ? code : JSON.stringify(code, null, 2)
	const [isCopied, setCopied] = useCopyClipboard(displayCode, { successDuration: 3000 })

	return (
		<main className="relative overflow-hidden rounded">
			<button
				className="absolute p-2 text-white transition rounded right-2 top-2 hover:bg-gray-50/25"
				type="button"
				onClick={setCopied}
				title="Copy to Clipboard"
			>
				{isCopied ? <IoCheckmark /> : <IoCopy />}
			</button>
			<Highlight {...defaultProps} code={displayCode} language="json">
				{({ className, style, tokens, getLineProps, getTokenProps }) => (
					<pre className={clsx('p-2', className)} style={style}>
						{tokens.map((line, i) => (
							<div {...getLineProps({ line, key: i })}>
								{line.map((token, key) => (
									<span {...getTokenProps({ token, key })} />
								))}
							</div>
						))}
					</pre>
				)}
			</Highlight>
		</main>
	)
}
