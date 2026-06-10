'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText,
  File,
  Users, 
  Search, 
  Shield,
  Mail,
  Calendar,
  Heart,
  MessageSquare,
} from 'lucide-react'
import { t } from '@/lib/translations'

export default function UserManagement() {
  const [language, setLanguage] = useState('cs')
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [userStats, setUserStats] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'cs'
    setLanguage(savedLanguage)

    // Listen for language changes
    const handleLanguageChange = (e) => {
      if (e.detail) setLanguage(e.detail)
      else if (e.newValue) setLanguage(e.newValue)
    }

    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('storage', handleLanguageChange)

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('storage', handleLanguageChange)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to load users')
      }

      setUsers(result.users || [])
      setUserStats(result.stats || {})
    } catch (error) {
      console.error('Error loading users:', error)
      setError(error.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.details || result.error || 'Failed to update user role')
      }

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      alert('User role updated successfully!')
    } catch (error) {
      console.error('Error updating user role:', error)
      alert(error.message || 'Failed to update user role')
    }
  }

  const getUserActivity = (userId) => {
    const stats = userStats[userId] || { favorites: 0, savedSearches: 0, inquiries: 0, forms: 0, webinars: 0, documents: 0 }
    return stats.favorites + stats.savedSearches + stats.inquiries + stats.forms + stats.webinars + stats.documents
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.users.title', language)}</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.users.title', language)}</h1>
          <p className="text-gray-600 mt-1">{users.length} {t('admin.users.totalUsers', language)}</p>
        </div>
        <Button onClick={loadUsers}>
          <Users className="h-4 w-4 mr-2" />
          {t('admin.users.refreshUsers', language)}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('admin.users.searchPlaceholder', language)}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">{t('admin.users.allRoles', language)}</option>
                <option value="user">{t('admin.users.users', language)}</option>
                <option value="admin">{t('admin.users.admins', language)}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-gray-600">{t('admin.users.totalUsersCard', language)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-slate-800 mx-auto mb-2" />
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
            <div className="text-sm text-gray-600">{t('admin.users.adminsCard', language)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{users.filter(u => {
              const dayAgo = new Date()
              dayAgo.setDate(dayAgo.getDate() - 1)
              return new Date(u.createdAt) > dayAgo
            }).length}</div>
            <div className="text-sm text-gray-600">{t('admin.users.newLast24h', language)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{users.filter(u => getUserActivity(u.id) > 0).length}</div>
            <div className="text-sm text-gray-600">{t('admin.users.activeUsers', language)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.allUsers', language)}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const stats = userStats[user.id] || { favorites: 0, savedSearches: 0, inquiries: 0 }
                const totalActivity = getUserActivity(user.id)
                
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{user.name || t('admin.users.unknownUser', language)}</h3>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email || `ID: ${user.id.substring(0, 8)}...`}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      {/* Activity Stats */}
                      <div className="hidden md:flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="flex items-center text-red-600">
                            <Heart className="h-3 w-3 mr-1" />
                            <span className="font-medium">{stats.favorites}</span>
                          </div>
                          <div className="text-xs text-gray-500">{t('admin.users.favorites', language)}</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center text-blue-600">
                            <Search className="h-3 w-3 mr-1" />
                            <span className="font-medium">{stats.savedSearches}</span>
                          </div>
                          <div className="text-xs text-gray-500">{t('admin.users.searches', language)}</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center text-slate-800">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            <span className="font-medium">{stats.inquiries}</span>
                          </div>
                          <div className="text-xs text-gray-500">{t('admin.users.inquiries', language)}</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center text-orange-600">
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="font-medium">{stats.forms}</span>
                          </div>
                          <div className="text-xs text-gray-500">{t('admin.users.forms', language)}</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center text-blue-500">
                            <File className="h-3 w-3 mr-1" />
                            <span className="font-medium">{stats.documents}</span>
                          </div>
                          <div className="text-xs text-gray-500">{t('admin.users.docs', language)}</div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="user">{t('admin.users.users', language)}</option>
                          <option value="admin">{t('admin.users.admins', language)}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.users.noUsersFound', language)}</h3>
              <p className="text-gray-600">{t('admin.users.adjustFilters', language)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> {t('admin.users.demoNote', language)}
        </AlertDescription>
      </Alert>
    </div>
  )
}
