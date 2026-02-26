export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.xn--bgtt50a8xt.cn/',
    getApiUrl() {
      return `${this.baseUrl}/api`
    },
    getMusicUrl(filename: string) {
      return `${this.baseUrl}/api/music/${encodeURIComponent(filename.trim())}`
    },
    getLrcUrl(filename: string) {
      return `${this.baseUrl}/api/lrc/${encodeURIComponent(filename.trim())}`
    }
  },
  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL || 'luoqing5203789@outlook.com'
  },
  links: {
    rainyun: import.meta.env.VITE_RAINYUN_URL || 'https://www.rainyun.com/luoqing_',
    deepseek: import.meta.env.VITE_DEEPSEEK_URL || 'https://chat.deepseek.com'
  }
}

export const musicPlayerConstants = {
  scrollDelay: 80,
  errorRetryDelay: 500,
  defaultVolume: 0.7
}
