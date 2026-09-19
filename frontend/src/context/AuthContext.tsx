import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import api from '../services/api'

type User = {
  userId: number
  username: string
  fullName: string
  role: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (username: any, password: any) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const saved = localStorage.getItem('user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      api.get('/auth/me')
        .then((res) => {
          const u = {
            userId: res.data.id,
            username: res.data.username,
            fullName: res.data.fullName,
            role: res.data.role,
          }
          setUser(u)
          localStorage.setItem('user', JSON.stringify(u))
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: any, password: any) => {
    const { data } = await api.post('/auth/login', { username, password })
    const u = {
      userId: data.userId,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
