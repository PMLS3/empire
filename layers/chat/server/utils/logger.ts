const logLevels = {
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR',
    debug: 'DEBUG',
  }
  const logToFile = (level: string, message: any, peer: { send: (arg0: string) => void } | undefined) => {
    const payload = JSON.stringify({
      type: 'system',
        level: level.toLowerCase(),
        ...message,
        timestamp: new Date().toISOString(),
    })
    console.log('payload ------ logger ', payload)
  
    if (peer)
      peer.send(payload)
  }
  
  const logger = {
    info: (message: any, peer: any) => {
      logToFile(logLevels.info, message, peer)
    },
    text: (message: any, peer: any) => {
      logToFile(logLevels.info, message, peer)
    },
    warn: (message: any, peer: any) => {
      logToFile(logLevels.warn, message, peer)
    },
    error: (message: any, peer: any) => {
      logToFile(logLevels.error, message, peer)
    },
    debug: (message: any, peer: any) => {
      logToFile(logLevels.debug, message, peer)
    },
  }
  
  export default logger