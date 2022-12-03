import { Button, JsonInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { atom, useAtom } from 'jotai'
import _ from 'lodash'
import { useGetPageModeStates } from './use-get-states'

export const statesDefaultValuesAtom = atom<Record<string, string>>({})

export function StatesDefaultValuesForm() {
	const [statesDefaultValues, setStatesDefaultValues] = useAtom(statesDefaultValuesAtom)
	const states = useGetPageModeStates()
	const stateNames = states.map((state) => state.name)
	const form = useForm({
		initialValues: _.fromPairs(
			stateNames.map((state) => [dotsToDashes(state), statesDefaultValues[state] ?? ''])
		),
	})
	const onSubmit = form.onSubmit((values) => {
		setStatesDefaultValues(formValuesToStates(values))
		closeAllModals()
	})

	if (states.length === 0) return <p className="text-xs">No state is defined yet</p>

	return (
		<form onSubmit={onSubmit}>
			{states.map((state) => (
				<JsonInput
					key={state.name}
					size="xs"
					label={state.name}
					placeholder="Default value"
					my="xs"
					{...form.getInputProps(dotsToDashes(state.name))}
				/>
			))}
			<Button type="submit" size="xs" fullWidth mt="xl">
				Save
			</Button>
		</form>
	)
}

const dotsToDashes = (str: string) => str.replaceAll('.', '-')

const formValuesToStates = (formValues: Record<string, string>) =>
	_.fromPairs(_.toPairs(formValues).map(([key, value]) => [key.replaceAll('-', '.'), value]))
