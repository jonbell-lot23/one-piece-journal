import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'

export async function GET() {
  try {
    const journeyData = readFileSync(join(process.cwd(), 'data/journey.yaml'), 'utf8')
    const entries = yaml.load(journeyData)
    
    return Response.json(entries)
  } catch (error) {
    return Response.json({ error: 'Failed to load journey data' }, { status: 500 })
  }
}