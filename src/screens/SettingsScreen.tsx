import { defaultData } from '../logic'
import { loadData, STORAGE_KEY } from '../store'
import { Meters } from '../components/Meters'
import type { AppData, MeterStyle, ScreenProps } from '../types'

const METER_STYLES: [MeterStyle, string][] = [
  ['pixel', 'Pixel dial'],
  ['bars', 'Stat bars'],
  ['classic', 'Classic'],
]

export function SettingsScreen({ data, setData }: ScreenProps) {
  const setSettings = (patch: Partial<AppData['settings']>) =>
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fitboy-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData
      if (!Array.isArray(parsed.meals) || !Array.isArray(parsed.routine)) throw new Error('bad file')
      if (!confirm('Replace all current data with this backup?')) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      setData(() => loadData())
    } catch {
      alert('That file is not a valid Fitboy backup.')
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Gear</h1>
      </header>

      <section className="card form">
        <h2>Daily goals</h2>
        <div className="row gap">
          <label className="grow">
            Protein (g)
            <input
              inputMode="numeric"
              value={data.settings.proteinGoal || ''}
              onChange={(e) => setSettings({ proteinGoal: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="grow">
            Calories
            <input
              inputMode="numeric"
              value={data.settings.calorieGoal || ''}
              onChange={(e) => setSettings({ calorieGoal: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        <label>
          Weight unit
          <select value={data.settings.unit} onChange={(e) => setSettings({ unit: e.target.value as 'kg' | 'lb' })}>
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </label>
      </section>

      <section className="card">
        <h2>Meter style</h2>
        <div className="seg-picker" role="radiogroup" aria-label="Meter style">
          {METER_STYLES.map(([value, label]) => (
            <button
              key={value}
              role="radio"
              aria-checked={data.settings.meterStyle === value}
              className={data.settings.meterStyle === value ? 'active' : ''}
              onClick={() => setSettings({ meterStyle: value })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="meter-preview">
          <Meters
            style={data.settings.meterStyle}
            protein={{ value: Math.round(data.settings.proteinGoal * 0.6), goal: data.settings.proteinGoal }}
            calories={{ value: Math.round(data.settings.calorieGoal * 0.4), goal: data.settings.calorieGoal }}
          />
        </div>
      </section>

      <section className="card">
        <h2>Backup</h2>
        <p className="muted small">Your data lives only on this phone. Export a backup now and then.</p>
        <div className="row gap">
          <button className="secondary grow" onClick={exportData}>
            Export
          </button>
          <label className="secondary grow file-btn">
            Import
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
            />
          </label>
        </div>
        <button
          className="reset-button"
          aria-label="Reset all data"
          onClick={() => {
            if (confirm('Erase ALL data and start fresh?')) setData(() => defaultData())
          }}
        >
          Reset
        </button>
      </section>
    </>
  )
}
