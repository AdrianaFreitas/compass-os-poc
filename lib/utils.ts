import type { Layer, Constituent } from './data/compass-controls'

export interface ScoredItem {
  evidence_type: string
  retest_frequency: string
  checked: boolean
  last_tested: string | null
  layer: string
  constituent: string
}

export type MaturityLevel = 'ml1' | 'ml2' | 'ml3'

export function isStale(item: ScoredItem): boolean {
  if (!item.checked || !item.last_tested || item.evidence_type !== 'poe') return false
  const daysSince = (Date.now() - new Date(item.last_tested).getTime()) / (1000 * 60 * 60 * 24)
  if (item.retest_frequency === 'monthly') return daysSince > 45
  if (item.retest_frequency === 'quarterly') return daysSince > 100
  return daysSince > 400
}

export function calculateLayerMaturity(items: ScoredItem[]): MaturityLevel {
  const eoe = items.filter(i => i.evidence_type === 'eoe')
  const poe = items.filter(i => i.evidence_type === 'poe')
  const checkedEoe = eoe.filter(i => i.checked)
  const checkedPoe = poe.filter(i => i.checked)

  if (checkedEoe.length === 0) return 'ml1'

  const eoePct = eoe.length > 0 ? checkedEoe.length / eoe.length : 0
  if (eoePct < 0.5 || checkedPoe.length === 0) return 'ml2'

  const hasStale = checkedPoe.some(i => isStale(i))
  if (hasStale) return 'ml2'

  return 'ml3'
}

export function buildHeatmap(
  items: ScoredItem[],
  layers: Layer[],
  constituents: Constituent[]
): Record<string, { maturity: MaturityLevel; hasStale: boolean; total: number; checked: number }> {
  const map: Record<string, { maturity: MaturityLevel; hasStale: boolean; total: number; checked: number }> = {}

  for (const constituent of constituents) {
    for (const layer of layers) {
      const cell = items.filter(i => i.constituent === constituent && i.layer === layer)
      if (cell.length === 0) continue
      map[`${constituent}:${layer}`] = {
        maturity: calculateLayerMaturity(cell),
        hasStale: cell.some(i => isStale(i)),
        total: cell.length,
        checked: cell.filter(i => i.checked).length,
      }
    }
  }

  return map
}

export function calculateSystemMaturity(items: ScoredItem[], layers: Layer[]): MaturityLevel {
  const scores = layers.map(layer => {
    const layerItems = items.filter(i => i.layer === layer)
    return layerItems.length > 0 ? calculateLayerMaturity(layerItems) : 'ml1'
  })
  if (scores.every(s => s === 'ml3')) return 'ml3'
  if (scores.some(s => s === 'ml2' || s === 'ml3')) return 'ml2'
  return 'ml1'
}
