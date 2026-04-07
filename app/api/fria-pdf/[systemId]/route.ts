import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'
import { generateFRIAPDF } from '@/lib/pdf/fria-pdf'

export async function GET(
  _request: NextRequest,
  { params }: { params: { systemId: string } }
) {
  const { systemId } = params

  const { data: system } = await supabase
    .from('systems')
    .select('id, name, fria_opted_in')
    .eq('id', systemId)
    .single()

  if (!system) {
    return NextResponse.json({ error: 'System not found' }, { status: 404 })
  }

  if (!system.fria_opted_in) {
    return NextResponse.json({ error: 'FRIA not enabled for this system' }, { status: 403 })
  }

  const [contextRes, scenariosRes, mitigationsRes, deploymentRes, stakeholdersRes] = await Promise.all([
    supabase.from('fria_context').select('*').eq('system_id', systemId).single(),
    supabase.from('fria_scenarios').select('*').eq('system_id', systemId).order('scenario_number').order('created_at'),
    supabase.from('fria_mitigations').select('*').eq('system_id', systemId).order('created_at'),
    supabase.from('fria_deployment').select('*').eq('system_id', systemId).single(),
    supabase.from('fria_stakeholders').select('*').eq('system_id', systemId).order('created_at'),
  ])

  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const pdfBuffer = await generateFRIAPDF({
    systemName: system.name,
    generatedDate,
    context: contextRes.data ?? null,
    scenarios: scenariosRes.data ?? [],
    mitigations: mitigationsRes.data ?? [],
    deployment: deploymentRes.data ?? null,
    stakeholders: stakeholdersRes.data ?? [],
  })

  const safeName = system.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `${safeName}-fria-${dateStr}.pdf`

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
