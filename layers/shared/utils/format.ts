export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date()
  const past = new Date(date)
  const diffTime = Math.abs(now.getTime() - past.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export const getFileIcon = (type: string): string => {
  const icons = {
    pdf: '/img/icons/files/pdf.svg',
    doc: '/img/icons/files/doc-2.svg',
    docx: '/img/icons/files/doc-2.svg',
    xls: '/img/icons/files/sheet.svg',
    xlsx: '/img/icons/files/sheet.svg',
    txt: '/img/icons/files/txt.svg'
  }
  return icons[type.toLowerCase()] || '/img/icons/files/file.svg'
}

export const getModelAvatar = (model: string): string => {
  const avatars = {
    'gpt-4': '/img/avatars/gpt4.svg',
    'claude-3': '/img/avatars/claude.svg',
    'gemini-pro': '/img/avatars/gemini.svg'
  }
  return avatars[model] || '/img/avatars/ai.svg'
} 