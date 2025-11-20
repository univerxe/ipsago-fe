import { promises as fs } from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { JobCsvRow, JobPosition, transformRow } from './job-utils'

export async function loadJobs(limit?: number): Promise<JobPosition[]> {
  const csvPath = path.join(process.cwd(), 'public', 'jobs-db.csv')
  const csvContent = await fs.readFile(csvPath, 'utf-8')

  return new Promise<JobPosition[]>((resolve, reject) => {
    Papa.parse<JobCsvRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const jobs = results.data
          .filter((row) => row.job_title && row.company_name)
          .map((row, index) => transformRow(row, index))
        resolve(typeof limit === 'number' ? jobs.slice(0, limit) : jobs)
      },
      error: (error) => reject(error),
    })
  })
}

export async function loadJobById(id: string) {
  const jobs = await loadJobs()
  return jobs.find((job) => job.id === id)
}

