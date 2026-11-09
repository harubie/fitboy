import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { defaultData } from '../logic'
import { SettingsScreen } from './SettingsScreen'

it('offers a labelled kJ to kcal converter without changing the daily goal', () => {
  const data = defaultData()
  const goal = data.settings.calorieGoal
  const html = renderToStaticMarkup(<SettingsScreen data={data} setData={() => { throw new Error('Must not update goals') }} />)
  expect(html).toContain('kJ to calories')
  expect(html).toContain('Kilojoules (kJ)')
  expect(html).toContain('Calories (kcal)')
  expect(html).toContain('1 kcal = 4.184 kJ')
  expect(data.settings.calorieGoal).toBe(goal)
})
