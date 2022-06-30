import { nanoid } from 'nanoid'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoTrash } from 'react-icons/io5'
import { Field, NewSelect } from '../ui'

export default function QueryConditions() {
	const [conditions, setConditions] = useState<string[]>([])

	const deleteCondition = (id: string) =>
		setConditions((conditions) => conditions.filter((condition) => condition !== id))
	const addCondition = () => setConditions((conditions) => [...conditions, nanoid()])

	return (
		<div className="p-4 border rounded-2xl">
			<p>Select records from this table</p>
			{conditions.length === 0 && (
				<p className="mt-3.5 text-xs text-slate-500">
					No filter conditions are applied to this table
				</p>
			)}
			<div className="mt-6 space-y-4">
				{conditions.map((id, index) => (
					<Condition
						key={id}
						chained={index !== 0}
						onDelete={() => deleteCondition(id)}
					/>
				))}
			</div>
			<button
				className="mt-6 font-semibold transition hover:text-slate-900 text-slate-600"
				type="button"
				onClick={addCondition}
			>
				+ Add condition
			</button>
		</div>
	)
}

const chainedConditionOptions = [
	{ label: 'and', value: 'and' },
	{ label: 'or', value: 'or' },
]

function Condition({ onDelete, chained }: { onDelete: () => void; chained: boolean }) {
	const form = useForm({ defaultValues: { condition: 'and' } })

	return (
		<div className="flex items-center grid-cols-4 gap-2 px-4">
			<div className="w-16">
				{!chained && <p className="text-center">Where</p>}
				{chained && (
					<NewSelect
						name="condition"
						options={chainedConditionOptions}
						control={form.control}
					/>
				)}
			</div>
			<div className="grow">
				<NewSelect name="attribute" placeholder="column" control={form.control} />
			</div>
			<div className="grow">
				<NewSelect name="action" placeholder="action" control={form.control} />
			</div>
			<div className="grow">
				<Field name="value" placeholder="value" control={form.control} />
			</div>
			<button
				className="p-2 transition rounded hover:bg-gray-50"
				type="button"
				onClick={onDelete}
			>
				<IoTrash />
			</button>
		</div>
	)
}
