#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import process from 'node:process'

const supportedCommands = new Set(['dev', 'build', 'start'])

async function run() {
  const command = process.argv[2] ?? ''

  if (!supportedCommands.has(command)) {
    const available = Array.from(supportedCommands).join(', ')
    console.error(`Unsupported Next.js command "${command}". Available commands: ${available}.`)
    process.exitCode = 1
    return
  }

  const require = createRequire(import.meta.url)

  let nextBinaryPath
  try {
    nextBinaryPath = require.resolve('next/dist/bin/next')
  } catch {
    console.log(`[skip] Next.js not installed yet; skipping "next ${command}" until the app scaffolding is added.`)
    return
  }

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [nextBinaryPath, command], {
      stdio: 'inherit',
      env: process.env,
    })

    child.on('error', (error) => {
      reject(error)
    })

    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal)
        resolve()
        return
      }

      process.exitCode = code ?? 0
      resolve()
    })
  })
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
