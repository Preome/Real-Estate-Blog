import toast from 'react-hot-toast'

export const handleApiError = (error, customMessage = null) => {
  // Log error for debugging
  console.error('API Error:', error)

  // Network error
  if (!error.response) {
    toast.error('Network error. Please check your internet connection.')
    return
  }

  // Server error responses
  const { status, data } = error.response

  switch (status) {
    case 400:
      toast.error(data?.error || 'Invalid request. Please check your input.')
      break
    case 401:
      toast.error('Session expired. Please login again.')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
      break
    case 403:
      toast.error('You do not have permission to perform this action.')
      break
    case 404:
      toast.error(data?.error || 'Resource not found.')
      break
    case 409:
      toast.error('Conflict. This resource may already exist.')
      break
    case 429:
      toast.error('Too many requests. Please try again later.')
      break
    case 500:
      toast.error('Server error. Please try again later.')
      break
    default:
      toast.error(customMessage || data?.error || 'An unexpected error occurred.')
  }
}

export const validateForm = (data, rules) => {
  const errors = {}

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]

    if (rule.required && !value) {
      errors[field] = `${field} is required`
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`
    }

    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${field} must not exceed ${rule.maxLength} characters`
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} is invalid`
    }
  }

  return errors
}