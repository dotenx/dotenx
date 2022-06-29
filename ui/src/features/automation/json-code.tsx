/* eslint-disable react/jsx-key */
import clsx from 'clsx'
import Highlight, { defaultProps } from 'prism-react-renderer'

export function JsonCode({ code }: { code: string | Record<string, unknown> }) {
	const displayCode = typeof code === 'string' ? code : JSON.stringify(code, null, 2)

	return (
		<main className="overflow-hidden rounded">
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
