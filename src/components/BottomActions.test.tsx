import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AddMeal } from '../screens/AddMeal'
import { PlanEditor } from '../screens/PlanEditor'
import { SessionScreen } from '../screens/SessionScreen'
import { MonstersScreen } from '../screens/MonstersScreen'
import { defaultData } from '../logic'

describe('bottom navigation', () => {
  it('places a single Back control in the footer, not the page header, on every sub-screen', () => {
    const data = defaultData()
    const noop = () => {}
    const props = { data, setData: noop, onDone: noop }
    const screens = [
      <AddMeal key="food" {...props} />,
      <PlanEditor key="plan" {...props} />,
      <SessionScreen key="session" {...props} day={data.routine[0]} onGuide={noop} />,
      <MonstersScreen key="lair" {...props} />,
    ]
    for (const screen of screens) {
      const html = renderToStaticMarkup(screen)
      expect(html.match(/← Back/g)).toHaveLength(1)
      expect(html).toMatch(/<footer class="screen-footer">[\s\S]*← Back/)
      expect(html.match(/<header[\s\S]*?<\/header>/)?.[0]).not.toContain('← Back')
    }
  })

  it('keeps the Add submit button connected to the food form after moving it', () => {
    const html = renderToStaticMarkup(<AddMeal data={defaultData()} setData={() => {}} onDone={() => {}} />)
    expect(html).toContain('id="add-food"')
    expect(html).toContain('form="add-food"')
  })
})
