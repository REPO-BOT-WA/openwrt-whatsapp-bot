import { exec } from 'child_process'
import axios from 'axios'

const generateMessage = (command, body) => {
  const message = `Command " _${command}_ " Result:\n==================================\n${body}\n==================================`
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

const lanNetworkInfo = async () => {
  const ip = await execShellCommand('uci get network.lan.ipaddr')
  return {
    ip: ip.replace('\n', '')
  }
}
const openclashNetworkInfo = async () => {
  const ip = await execShellCommand('uci get network.lan.ipaddr')
  const port = await execShellCommand('uci get openclash.config.cn_port')
  const secret = await execShellCommand('uci get openclash.config.dashboard_password')
  return {
    ip: ip.replace('\n', ''),
    port: port.replace('\n', ''),
    secret: secret.replace('\n', '')
  }
}
const secondToHourAndMinute = (second) => {
  const totalMinutes = Math.floor(second / 60)

  const seconds = second % 60
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return { h: hours, m: minutes, s: seconds }
}
const deviceNetworkInterfacesName = async () => {
  let interfacesName = await execShellCommand('ubus list network.interface.*')
  interfacesName = interfacesName.split('\n')
  return interfacesName.filter(elm => elm)
}

const deviceNetworkInterfaces = async () => {
  const interfaceData = []
  const interfacesName = await deviceNetworkInterfacesName()
  for (const interfaceName of interfacesName) {
    let detail = await execShellCommand(`ubus call ${interfaceName} status`)
    detail = JSON.parse(detail)
    detail.name = interfaceName
    interfaceData.push(detail)
  }
  return interfaceData
}

const removeHTMLTags = (str) => {
  if ((str === null) || (str === '')) { return false } else { str = str.toString() }
  return str.replace(/(<([^>]+)>)/ig, '')
}

const LibernetConnectionText = (status) => {
  switch (status) {
    case 0:
      return 'ready'
    case 1:
      return 'connecting'
    case 2:
      return 'connected'
    case 3:
      return 'stopping'
  }
}

const libernetConfigs = async () => {
  const { ip } = await lanNetworkInfo()
  const LIBERNET_API_URL = `http://${ip}/libernet/api.php`
  const CONFIG_TYPE = {
    OpenVPN: 'get_openvpn_configs',
    SSH: 'get_ssh_configs',
    SSH_SSL: 'get_sshl_configs',
    SSH_WS_CDN: 'get_sshwscdn_configs',
    Shadowshocks: 'get_shadowsocks_configs',
    Trojan: 'get_trojan_configs',
    V2Ray: 'get_v2ray_configs'
  }
  const configs = {}
  for (const [key, value] of Object.entries(CONFIG_TYPE)) {
    await axios.post(LIBERNET_API_URL, {
      action: value
    }).then((res) => {
      configs[key] = res.data.data
    })
  }
  return configs
}
export {
  execShellCommand,
  pingColor,
  processPhoneNumber,
  generateMessage,
  openclashNetworkInfo,
  secondToHourAndMinute,
  deviceNetworkInterfaces,
  removeHTMLTags,
  LibernetConnectionText,
  libernetConfigs,
  lanNetworkInfo
}
