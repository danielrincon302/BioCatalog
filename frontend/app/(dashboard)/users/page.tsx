'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { usersApi, companiesApi, rolesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import UserFormModal from '@/components/users/UserFormModal';

interface User {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  whatsapp: string | null;
  active: boolean;
  last_access: string | null;
  role: { id: number; name: string };
  company: { id: number; name: string };
}

interface Company {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

export default function UsersPage() {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const { t, translateRole } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.list();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companiesApi.list();
      setCompanies(response.data.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolesApi.list();
      setRoles(response.data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
    fetchRoles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(t.users.deleteConfirm)) return;

    try {
      await usersApi.delete(id);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || t.messages.errorDeleting);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleOpenEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchUsers();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Only Super Admin and Admin can manage users (not Editor)
  const canManageUsers = isSuperAdmin() || isAdmin();

  // Check if current user can edit a specific user
  const canEditUser = (targetUser: User) => {
    if (isSuperAdmin()) return true;
    if (isAdmin()) {
      // Admin can only edit users from their company, NOT Super Admins
      return targetUser.company.id === user?.company?.id && targetUser.role.id !== 1;
    }
    return false;
  };

  // Check if current user can delete a specific user
  const canDeleteUser = (targetUser: User) => {
    if (targetUser.id === user?.id) return false; // Cannot delete yourself
    if (isSuperAdmin()) return true;
    if (isAdmin()) {
      // Admin can only delete Editors from their company (role id 3)
      return targetUser.company.id === user?.company?.id && targetUser.role.id === 3;
    }
    return false;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.users.title}</h1>
          </div>
          {canManageUsers && (
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t.users.newUser}
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t.common.search + '...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>{t.users.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t.common.noResults}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{t.users.name}</th>
                      <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">{t.users.email}</th>
                      <th className="text-left py-3 px-4 font-medium hidden md:table-cell">{t.users.role}</th>
                      <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">{t.users.company}</th>
                      <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">{t.items.status}</th>
                      {canManageUsers && (
                        <th className="text-right py-3 px-4 font-medium">{t.common.actions}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{u.name}</div>
                          <div className="text-sm text-gray-500 sm:hidden">
                            {u.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {translateRole(u.role.name)}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {u.company.name}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.active ? t.users.active : t.users.inactive}
                          </span>
                        </td>
                        {canManageUsers && (
                          <td className="py-3 px-4">
                            <div className="flex justify-end space-x-2">
                              {canEditUser(u) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEdit(u)}
                                  title={t.common.edit}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDeleteUser(u) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(u.id)}
                                  title={t.common.delete}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <UserFormModal
          user={editingUser}
          companies={companies}
          roles={roles}
          onClose={handleCloseModal}
          onSuccess={handleSaveSuccess}
        />
      )}
    </DashboardLayout>
  );
}
