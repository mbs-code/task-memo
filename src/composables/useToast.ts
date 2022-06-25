import { useToast as useToastOrigin } from 'primevue/usetoast'

export const useToast = () => {
  const toast = useToastOrigin()

  const info = (message: string, title = 'Info message') => {
    toast.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000,
    })
  }

  const success = (message: string, title = 'Success message') => {
    toast.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000,
    })
  }

  const warn = (message: string, title = 'Warn message') => {
    toast.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 5000,
    })
  }

  const error = (message: string, title = 'Error message') => {
    toast.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: null,
    })
  }

  const catchError = (err: Error, title = 'Error thrown') => {
    error(err.name + ': ' + err.message, title)
  }

  return {
    info,
    success,
    warn,
    error,
    catchError,
  }
}
