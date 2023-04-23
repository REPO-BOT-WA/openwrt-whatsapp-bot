import axios from 'axios'
import { execShellCommand, openclashConfig, pingColor, processPhoneNumber } from './utils.js'

// device
const rebootDevice = async () => {
  const result = await execShellCommand('reboot now').then(res => {
    return 'rebooting device...'
  }).catch(error => {
    return `error execute command : \n${error}`
  })
  return result
}
const shutDownDevice = async () => {
  const result = await execShellCommand('poweroff now').then(res => {
    return 'shutting down device...'
  }).catch(error => {
    return `error execute command : \n${error}`
  })
  return result
}
const sysInfo = async () => {
  const result = await execShellCommand('./scripts/sysinfo.sh').catch(error => {
    return `error execute command : \n${error}`
  })
  return result
}
const initApp = async () => {
  const result = await execShellCommand('./scripts/init_app.sh')
  return result
}
const firewallRules = async () => {
  const result = await execShellCommand('./scripts/fwlist.sh').catch(error => {
    return `error execute command : \n${error}`
  })
  return result
}
// open clash
const openClashInfo = async () => {
  const result = await execShellCommand('./scripts/oc.sh').catch(error => {
    return `error execute command : \n${error}`
  })
  return result
}
const openClashProxies = async () => {
  const { ip, port, secret } = await openclashConfig()
  const API_URL = `http://${ip}:${port}/providers/proxies`
  const API_KEY = `Bearer ${secret}`
  return await axios.get(API_URL, { headers: { Authorization: API_KEY } })
    .then((response) => {
      let result = '⏺  Name  |  Type  |  Now  |  Ping  '
      Object.entries(response.data.providers.default.proxies).forEach(
        ([key, value]) => {
          result += `\n➜ ${value.name} | ${value.type} | ${value.now ?? '-'} | ${value.history[-0]?.delay ?? '-'} ms ${pingColor(value.history[-0]?.delay)}`
        }
      )
      return result
    })
    .catch(error => {
      console.log(`openClashProxies(): ${error}`)
      return error
    })
}
const myIp = async () => {
  return await axios.get('http://ip-api.com/json/')
    .then(response => {
      let result = ''
      const data = response.data
      data.ip = data.query
      delete data.query
      delete data.status
      Object.entries(data).forEach(([key, value]) => { result += `➜ nod${key} = ${value}\n` })
      return result
    })
    .catch(error => {
      console.log(`myIp(): ${error}`)
      return error
    })
}
const sidompul = async (number = '6281936994974') => {
  const { success, phoneNumber } = processPhoneNumber(number)
  if (!success || phoneNumber === undefined) {
    return 'Nomor tidak valid.!\nContoh "/sidompul 08123456789" atau "/sidompul 628123456789"'
  }
  const API_URL = `https://sidompul.cloudaccess.host/cek.php?nomor=${phoneNumber}`
  return await axios.get(API_URL)
    .then(response => {
      return response.data
    })
    .catch(error => {
      console.log(`sidompul(): ${error}`)
      return error
    })
}
export {
  myIp,
  sidompul,
  sysInfo,
  rebootDevice,
  shutDownDevice,
  initApp,
  firewallRules,
  openClashInfo,
  openClashProxies
}
