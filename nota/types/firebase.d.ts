// Firebase types
import { User, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth'

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
  }
}

export type FirebaseUser = User | null
export type FirebaseConfirmationResult = ConfirmationResult | null
