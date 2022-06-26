/* eslint-disable react/jsx-key */
import clsx from 'clsx'
import Highlight, { defaultProps } from 'prism-react-renderer'

export function InteractionResponse({ code }: { code: string }) {
	return (
		<main className="overflow-hidden rounded">
			<Highlight {...defaultProps} code={code} language="json">
				{({ className, style, tokens, getLineProps, getTokenProps }) => (
					<pre className={clsx('p-4', className)} style={style}>
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
