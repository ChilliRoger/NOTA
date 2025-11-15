// Device fingerprinting utility to prevent multiple votes from same device
import crypto from 'crypto'

// Extend Navigator interface to include non-standard properties
interface ExtendedNavigator extends Navigator {
  deviceMemory?: number
}

export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return ''

  const components: string[] = []
  const nav = navigator as ExtendedNavigator

  // Browser information
  components.push(nav.userAgent)
  components.push(nav.language)
  components.push(nav.hardwareConcurrency?.toString() || '')
  components.push(nav.deviceMemory?.toString() || '')
  components.push(nav.platform)

  // Screen information
  components.push(screen.width.toString())
  components.push(screen.height.toString())
  components.push(screen.colorDepth.toString())
  components.push(window.devicePixelRatio.toString())

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)
  components.push(new Date().getTimezoneOffset().toString())

  // Canvas fingerprint (more unique)
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(0, 0, 125, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Device Fingerprint', 2, 2)
      components.push(canvas.toDataURL())
    }
  } catch {
    // Canvas fingerprint failed, continue with other components
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      }
    }
  } catch {
    // WebGL fingerprint failed, continue
  }

  // Combine all components and hash
  const fingerprint = components.join('|')
  const hash = crypto.createHash('sha256').update(fingerprint).digest('hex')
  
  return hash
}

// Store device fingerprint in localStorage for consistency
export function getStoredDeviceFingerprint(): string {
  if (typeof window === 'undefined') return ''
  
  const stored = localStorage.getItem('device_fingerprint')
  if (stored) return stored

  const fingerprint = generateDeviceFingerprint()
  localStorage.setItem('device_fingerprint', fingerprint)
  return fingerprint
}

// Server-side hashing function
export function hashDeviceFingerprint(fingerprint: string): string {
  return crypto.createHash('sha256').update(fingerprint).digest('hex')
}
