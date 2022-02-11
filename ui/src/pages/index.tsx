import { css, Theme } from '@emotion/react'
import { Layout } from '../components/layout'
import { ActionBar } from '../containers/action-bar'
import { Flow } from '../containers/flow'
import { PipelineSelect } from '../containers/pipeline-select'
import { Sidebar } from '../containers/sidebar'

const borderRight = (theme: Theme) => ({ borderRight: '1px solid', borderColor: theme.color.text })
const center = css({ display: 'flex', alignItems: 'center', padding: '10px 20px' })

function Home() {
	return (
		<Layout>
			<div
				css={(theme) => ({
					height: '100vh',
					display: 'flex',
					flexDirection: 'column',
					color: theme.color.text,
				})}
			>
				<div
					css={(theme) => ({
						borderBottom: '1px solid',
						borderColor: theme.color.text,
						display: 'flex',
					})}
				>
					<h1 css={[borderRight, center, { fontWeight: 100 }]}>Automated Ops</h1>
					<div
						css={[
							{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								flexGrow: 1,
							},
							borderRight,
							center,
						]}
					>
						<PipelineSelect />
						<ActionBar />
					</div>
					<div css={center}>
						<Sidebar />
					</div>
				</div>

				<div css={{ display: 'flex', flexGrow: '1', gap: 6 }}>
					<div css={{ flexGrow: '1' }}>
						<Flow />
					</div>
				</div>
			</div>
		</Layout>
	)
}

export default Home
