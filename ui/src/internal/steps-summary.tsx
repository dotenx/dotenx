import { Code } from '@mantine/core'
import { Step } from './task-builder'

export function StepsSummary({ steps, prefixNumber }: { steps: Step[]; prefixNumber: string }) {
	return (
		<div className="mx-1 my-0.5 px-1 py-0.5 text-sm font-medium bg-slate-900 text-slate-50 rounded">
			{steps.map((step, index) => {
				const number = `${prefixNumber}${index + 1}.`
				return (
					<div key={index} className="p-0.5 flex gap-1">
						{/* <span>{number}</span> */}
						{step.type === 'var_declaration' && (
							<div>
								<span className="italic">declare</span>{' '}
								<Code>{step.params.name.data}</Code>
							</div>
						)}
						{step.type === 'assignment' && (
							<div>
								<span className="italic">assign</span>{' '}
								<Code>{step.params.name.data}</Code> to{' '}
								<Code>{step.params.value.data}</Code>
							</div>
						)}
						{step.type === 'function_call' && (
							<div>
								<span className="italic">call function</span>{' '}
								<Code>{step.params.fnName}</Code>{' '}
								{step.params.arguments?.length > 0 && 'with arguments '}
								{step.params.arguments?.map((arg, index) => (
									<span key={index}>
										<Code>{arg.data}</Code>
										{index !== step.params.arguments.length - 1 && ', '}
									</span>
								))}
							</div>
						)}
						{step.type === 'output' && (
							<div>
								<span className="italic">output</span>{' '}
								<Code>{step.params.value.data}</Code>
							</div>
						)}
						{step.type === 'foreach' && (
							<div>
								<span className="italic">foreach</span> item in{' '}
								<Code>{step.params.collection.data}</Code> as{' '}
								<Code>{step.params.iterator.data}</Code>
								<StepsSummary steps={step.params.body} prefixNumber={number} />
							</div>
						)}
						{step.type === 'repeat' && (
							<div>
								<span className="italic">repeat</span>{' '}
								<Code>{step.params.count.data}</Code> times as{' '}
								<Code>{step.params.iterator.data}</Code>
								<StepsSummary steps={step.params.body} prefixNumber={number} />
							</div>
						)}
						{step.type === 'if' && (
							<div>
								{step.params.branches.map((branch, index) => (
									<div key={index}>
										<div>
											<span className="italic">
												{index === 0 ? 'if' : 'else if'}
											</span>{' '}
											<Code>{branch.condition.data}</Code> then
										</div>
										<StepsSummary steps={branch.body} prefixNumber={number} />
									</div>
								))}
								{step.params.elseBranch.length !== 0 && (
									<div>
										<span className="italic">else</span>
										<StepsSummary
											steps={step.params.elseBranch}
											prefixNumber={number}
										/>
									</div>
								)}
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}
