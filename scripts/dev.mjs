import net from 'node:net'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const isWindows = process.platform === 'win32'

const processes = []

function isPortOpen(port) {
  return new Promise((resolvePort) => {
    const socket = net.createConnection({ host: '127.0.0.1', port })
    socket.once('connect', () => {
      socket.end()
      resolvePort(true)
    })
    socket.once('error', () => resolvePort(false))
    socket.setTimeout(600, () => {
      socket.destroy()
      resolvePort(false)
    })
  })
}

function log(scope, message) {
  process.stdout.write(`[${scope}] ${message}`)
}

function spawnService(scope, command, args, cwd) {
  const useShell = isWindows && command.toLowerCase().endsWith('.cmd')
  const child = spawn(command, args, {
    cwd,
    shell: useShell,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' }
  })

  child.stdout.on('data', (chunk) => log(scope, chunk.toString()))
  child.stderr.on('data', (chunk) => log(scope, chunk.toString()))
  child.on('exit', (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`\n[${scope}] exited with code ${code}`)
    }
  })
  processes.push(child)
  return child
}

function runSetup(scope, command, args, cwd) {
  console.log(`[${scope}] ${command} ${args.join(' ')}`)
  const useShell = isWindows && command.toLowerCase().endsWith('.cmd')
  const result = spawnSync(command, args, {
    cwd,
    shell: useShell,
    stdio: 'inherit',
    env: process.env
  })
  return result.status === 0
}

function createBackendVenv(backendDir) {
  if (existsSync(backendPython)) return true
  console.log('[backend] virtual environment missing; creating backend\\.venv...')
  if (isWindows && runSetup('backend', 'py', ['-3', '-m', 'venv', '.venv'], backendDir)) return true
  return runSetup('backend', 'python', ['-m', 'venv', '.venv'], backendDir)
}

function ensureBackendDeps(backendDir) {
  const uvicornExe = join(backendDir, '.venv', 'Scripts', 'uvicorn.exe')
  if (existsSync(uvicornExe)) return true
  console.log('[backend] installing Python dependencies...')
  return runSetup('backend', backendPython, ['-m', 'pip', 'install', '-r', 'requirements.txt'], backendDir)
}

function ensureFrontendDeps(frontendDir) {
  if (existsSync(join(frontendDir, 'node_modules'))) return true
  console.log('[frontend] node_modules missing; running npm install...')
  return runSetup('frontend', npmCmd, npmArgs(['install']), frontendDir)
}

let shuttingDown = false

function shutdown() {
  shuttingDown = true
  for (const child of processes) {
    if (!child.killed) child.kill(isWindows ? undefined : 'SIGTERM')
  }
  setTimeout(() => process.exit(0), 250)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

const backendDir = join(root, 'backend')
const frontendDir = join(root, 'frontend')
const backendPython = join(backendDir, '.venv', 'Scripts', 'python.exe')
const npmCmd = isWindows ? (process.env.ComSpec || 'cmd.exe') : 'npm'
const npmArgs = (args) => isWindows ? ['/d', '/s', '/c', 'npm', ...args] : args

console.log('Starting ShelfMind AI...')

if (!ensureFrontendDeps(frontendDir)) {
  console.error('[frontend] dependency install failed')
  process.exit(1)
}

if (!createBackendVenv(backendDir) || !ensureBackendDeps(backendDir)) {
  console.error('[backend] setup failed')
  process.exit(1)
}

if (await isPortOpen(8000)) {
  console.log('[backend] already running at http://127.0.0.1:8000')
} else {
  spawnService('backend', backendPython, ['-B', '-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], backendDir)
}

if (await isPortOpen(3000)) {
  console.log('[frontend] already running at http://127.0.0.1:3000')
} else {
  spawnService('frontend', npmCmd, npmArgs(['run', 'dev']), frontendDir)
}

console.log('\nShelfMind AI URLs:')
console.log('  Frontend: http://127.0.0.1:3000/dashboard')
console.log('  Backend:  http://127.0.0.1:8000/docs')
console.log('\nPress Ctrl+C to stop servers started by this command.\n')

if (processes.length === 0) {
  setInterval(() => {}, 1_000_000)
}
