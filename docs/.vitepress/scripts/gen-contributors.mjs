import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(currentDirectory, '..', '..', '..')
const docsRoot = resolve(repoRoot, 'docs')
const outputFile = resolve(currentDirectory, '..', 'contributors.json')
const mappingFile = resolve(currentDirectory, '..', 'contributors-mapping.json')

function markdownFiles(directory) {
  const files = []
  for (const entry of readdirSync(directory)) {
    if (entry === '.vitepress' || entry === 'public' || entry.startsWith('.')) continue
    const file = resolve(directory, entry)
    const stats = statSync(file)
    if (stats.isDirectory()) files.push(...markdownFiles(file))
    else if (extname(entry) === '.md') files.push(file)
  }
  return files
}

function loadMapping() {
  try {
    return JSON.parse(readFileSync(mappingFile, 'utf8'))
  } catch {
    return {}
  }
}

function githubFromEmail(email) {
  const match = email.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i)
  return match?.[1]
}

function mappedIdentity(mapping, name, emails) {
  const candidates = [name, ...emails]
  for (const candidate of candidates) {
    const key = Object.keys(mapping).find((entry) => entry.toLowerCase() === candidate.toLowerCase())
    if (!key) continue
    const value = mapping[key]
    return typeof value === 'string' ? { github: value } : value
  }
  return {}
}

function contributorsFor(file, mapping) {
  const gitPath = relative(repoRoot, file).replace(/\\/g, '/')
  let output
  try {
    output = execFileSync('git', ['log', '--follow', '--format=%an%x00%ae', '--', gitPath], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    })
  } catch {
    return []
  }

  const contributors = new Map()
  for (const line of output.trim().split('\n').filter(Boolean)) {
    const [name, email] = line.split('\0')
    if (!name || !email) continue
    const key = name.toLowerCase()
    const contributor = contributors.get(key) ?? { name, emails: new Set(), commits: 0 }
    contributor.emails.add(email.toLowerCase())
    contributor.commits++
    contributors.set(key, contributor)
  }

  return Array.from(contributors.values())
    .sort((first, second) => second.commits - first.commits)
    .map((contributor) => {
      const emails = Array.from(contributor.emails)
      const mapped = mappedIdentity(mapping, contributor.name, emails)
      const github = mapped.github || emails.map(githubFromEmail).find(Boolean)
      return {
        name: contributor.name,
        ...(github ? { github } : {}),
        ...(mapped.avatar ? { avatar: mapped.avatar } : {}),
        commits: contributor.commits,
      }
    })
}

function main() {
  if (!existsSync(resolve(repoRoot, '.git'))) {
    writeFileSync(outputFile, '{}\n')
    console.log('No Git repository found; generated empty contributors data')
    return
  }

  const mapping = loadMapping()
  const result = {}
  for (const file of markdownFiles(docsRoot)) {
    const key = relative(docsRoot, file).replace(/\\/g, '/')
    const contributors = contributorsFor(file, mapping)
    if (contributors.length) result[key] = contributors
  }

  writeFileSync(outputFile, `${JSON.stringify(result, null, 2)}\n`)
  console.log(`Generated contributors data for ${Object.keys(result).length} files`)
}

main()
