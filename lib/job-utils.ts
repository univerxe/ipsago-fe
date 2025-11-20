export interface JobCsvRow {
  company_name: string
  job_title: string
  role_category: string
  job_description?: string
  responsibilities?: string
  required_qualifications?: string
  preferred_qualifications?: string
  skills?: string
  deadline?: string
}

export interface JobPosition {
  id: string
  title: string
  company: string
  description: string
  responsibilities: string[]
  required: string[]
  preferred: string[]
  skills: string[]
  roleCategory: string
  deadline: string
}

export const parseList = (raw?: string) => {
  if (!raw) return []
  return raw
    .split(/\r?\n|•|-/g)
    .map((item) => item.replace(/^[\s•-]+/, '').trim())
    .filter(Boolean)
}

export const parseSkills = (raw?: string) => {
  if (!raw) return []
  return raw
    .split(/,|\n|·/g)
    .map((skill) => skill.trim())
    .filter(Boolean)
}

export const transformRow = (row: JobCsvRow, index: number): JobPosition => ({
  id: String(index),
  title: row.job_title?.trim() ?? 'Job Title',
  company: row.company_name?.trim() ?? 'Company',
  description: row.job_description?.trim() ?? '',
  responsibilities: parseList(row.responsibilities),
  required: parseList(row.required_qualifications),
  preferred: parseList(row.preferred_qualifications),
  skills: parseSkills(row.skills),
  roleCategory: row.role_category?.trim() ?? 'Role',
  deadline: row.deadline?.trim() ?? '채용시 마감',
})

