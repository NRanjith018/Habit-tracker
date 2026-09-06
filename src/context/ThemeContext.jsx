import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ht-theme') || 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const applyDark = () => root.classList.add('dark')
    const applyLight = () => root.classList.remove('dark')

    if (theme === 'dark') {
      applyDark()
    } else if (theme === 'light') {
      applyLight()
    } else {
      // system
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.matches ? applyDark() : applyLight()
      const handler = e => e.matches ? applyDark() : applyLight()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const setAndSave = (val) => {
    setTheme(val)
    localStorage.setItem('ht-theme', val)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setAndSave }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
