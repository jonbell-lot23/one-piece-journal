import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'

export async function GET() {
  try {
    const progressData = readFileSync(join(process.cwd(), 'data/progress.yaml'), 'utf8')
    const progress = yaml.load(progressData)
    
    return Response.json(progress)
  } catch (error) {
    return Response.json({ error: 'Failed to load progress data' }, { status: 500 })
  }
}