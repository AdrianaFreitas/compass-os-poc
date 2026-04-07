import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'
import { generateDossierPDF } from '@/lib/pdf/dossier-pdf'

export async function GET(
  _request: NextRequest,
  { params }: { params: { systemId: string } }
) {
  const { systemId } = params

  const { data: system } = await supabase
    .from('systems')
    .select('*')
    .eq('id', systemId)
    .single()

  if (!system) {
    return NextResponse.json({ error: 'System not found' }, { status: 404 })
  }

  const [evidenceRes, threatRes, lexarchRes] = await Promise.all([
    supabase
      .from('evidence')
      .select('*')
      .eq('system_id', systemId)
      .order('constituent')
      .order('layer'),
    supabase.from('threat_model').select('*').eq('system_id', systemId),
    supabase
      .from('lexarch_results')
      .select('*')
      .eq('system_id', systemId)
      .order('created_at', { ascending: false }),
  ])

  let friaContext = null
  let friaScenarios: unknown[] = []
  let friaDeployment = null

  if (system.fria_opted_in) {
    const [ctxRes, scenRes, depRes] = await Promise.all([
      supabase.from('fria_context').select('*').eq('system_id', systemId).single(),
      supabase.from('fria_scenarios').select('*').eq('system_id', systemId).order('created_at'),
      supabase.from('fria_deployment').select('*').eq('system_id', systemId).single(),
    ])
    friaContext = ctxRes.data ?? null
    friaScenarios = scenRes.data ?? []
    friaDeployment = depRes.data ?? null
  }

  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const pdfBuffer = await generateDossierPDF({
    system,
    evidence: evidenceRes.data ?? [],
    threats: threatRes.data ?? [],
    lexarch: lexarchRes.data ?? [],
    friaContext,
    friaScenarios: friaScenarios as Parameters<typeof generateDossierPDF>[0]['friaScenarios'],
    friaDeployment,
    generatedDate,
  })

  const safeName = system.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `${safeName}-dossier-${dateStr}.pdf`

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
