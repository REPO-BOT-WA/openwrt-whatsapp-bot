import { Boom } from '@hapi/boom'
import { createRequire } from 'module'
import { generateMessage } from './utils.js'
import { firewallRules, initApp, myIp, openClashInfo, openClashProxies, rebootDevice, shutDownDevice, sidompul, sysInfo } from './functions.js'
import { networkInterfaces } from 'os'
const require = createRequire(import.meta.url)
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@adiwajshing/baileys')

const session = 'baileys_auth_info'
async function whatsappService () {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state
  })
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect.error).output.statusCode
      if (reason === DisconnectReason.badSession) {
        console.log(
          `Bad Session File, Please Delete ${session} and Scan Again`
        )
        sock.logout()
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log('Connection closed, reconnecting....')
        whatsappService()
      } else if (reason === DisconnectReason.connectionLost) {
        console.log('Connection Lost from Server, reconnecting...')
        whatsappService()
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          'Connection Replaced, Another New Session Opened, Please Close Current Session First'
        )
        sock.logout()
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(
          `Device Logged Out, Please Delete ${session} and Scan Again.`
        )
        sock.logout()
      } else if (reason === DisconnectReason.restartRequired) {
        console.log('Restart Required, Restarting...')
        whatsappService()
      } else if (reason === DisconnectReason.timedOut) {
        console.log('Connection TimedOut, Reconnecting...')
        whatsappService()
      } else {
        sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`)
      }
    } else if (connection === 'open') {
      console.log('opened connection')
    }
  })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify') {
      if (!messages[0].key.fromMe) {
        const senderMessage = messages[0].message.conversation.toLowerCase()
        const senderNumber = messages[0].key.remoteJid

        let reply = ''
        if (senderMessage === '/my_ip') {
          reply = generateMessage(senderMessage, await myIp())
        } else if (senderMessage.includes('/sidompul')) {
          // eslint-disable-next-line no-unused-vars
          const [command, number] = senderMessage.split(' ')
          const result = await sidompul(number)
          reply = generateMessage(senderMessage, result)
        } else if (senderMessage === '/sysinfo') {
          reply = generateMessage(senderMessage, await sysInfo())
        } else if (senderMessage === '/reboot') {
          reply = generateMessage(senderMessage, await rebootDevice())
        } else if (senderMessage === '/shutdown') {
          reply = generateMessage(senderMessage, await shutDownDevice())
        } else if (senderMessage === '/init_app') {
          reply = generateMessage(senderMessage, await initApp())
        } else if (senderMessage === '/firewall_rules') {
          reply = generateMessage(senderMessage, await firewallRules())
        } else if (senderMessage === '/interfaces') {
          reply = generateMessage(senderMessage, await networkInterfaces())
        } else if (senderMessage === '/openclash_info') {
          reply = generateMessage(senderMessage, await openClashInfo())
        } else if (senderMessage === '/openclash_proxies') {
          reply = generateMessage(senderMessage, await openClashProxies())
        } else {
          reply = generateMessage(senderMessage, 'Command Not Found.!')
        }
        await sock.sendMessage(
          senderNumber,
          { text: reply },
          { quoted: messages[0] }
        )
      }
    }
  })
}
whatsappService()
