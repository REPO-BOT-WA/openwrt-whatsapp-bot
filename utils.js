import { exec } from 'child_process'

const generateMessage = (command, body) => {
  const message = `Command "_${command}_" Result:\n==================================\n${body}\n==================================`
  return message
}

const pingColor = (delay) => {
  if (delay === 0) {
    return '⬛️'
  } else if (delay <= 150) {
    return '🟩'
  } else if (delay <= 300) {
    return '🟨'
  } else if (delay <= 350) {
    return '🟧'
  } else if (delay > 350) {
    return '🟥'
  } else {
    return '  '
  }
}

const processPhoneNumber = (number) => {
  const result = {
    success: false,
    phoneNumber: number
  }
  if (number.startsWith('0')) {
    const phoneNumber = `62${number.slice(1)}`
    result.success = true
    result.phoneNumber = phoneNumber
  } else if (number.startsWith('62')) {
    result.success = true
  }
  return result
}

const execShellCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(`execShellCommand(): ${error}`)
        reject(stderr)
      }
      resolve(stdout)
    })
  })
}
const openclashConfig = async () => {
  const ip = await execShellCommand('uci get network.lan.ipaddr')
  const port = await execShellCommand('uci get openclash.config.cn_port')
  const secret = await execShellCommand('uci get openclash.config.dashboard_password')
  return {
    ip: ip.replace('\n', ''),
    port: port.replace('\n', ''),
    secret: secret.replace('\n', '')
  }
}
export {
  execShellCommand,
  pingColor,
  processPhoneNumber,
  generateMessage,
  openclashConfig
}
