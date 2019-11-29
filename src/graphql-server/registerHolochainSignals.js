import { onSignal } from './holochainClient'

export default function registerHolochainSignals () {
  onSignal(signal => {
    switch (signal.name) {
      case 'new_post':
        console.log('new_post signal:', signal)
        break
    }
  })
}
