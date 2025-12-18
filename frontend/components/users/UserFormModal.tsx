'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { X } from 'lucide-react';

interface UserFormModalProps {
  user: any;
  companies: { id: number; name: string }[];
  roles: { id: number; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({
  user,
  companies,
  roles,
  onClose,
  onSuccess,
}: UserFormModalProps) {
  const { t, translateRole } = useLanguage();
  const { isSuperAdmin, isAdmin } = useAuth();
  const isEditing = !!user;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    mobile: user?.mobile || '',
    whatsapp: user?.whatsapp || '',
    id_role: user?.role?.id || (isAdmin() ? 3 : ''),
    id_company: user?.company?.id || '',
    active: user?.active ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const dataToSend: any = { ...formData };

      // Remove password if empty (for editing)
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      if (isEditing) {
        await usersApi.update(user.id, dataToSend);
      } else {
        await usersApi.create(dataToSend);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || t.messages.errorSaving);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter roles based on current user permissions
  const availableRoles = isAdmin()
    ? roles.filter(r => r.id === 3) // Only Editor for Admin
    : roles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? t.users.editUser : t.users.newUser}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.users.name} *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.users.email} *
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.auth.password} {!isEditing && '*'}
              </label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                placeholder={isEditing ? '(Leave blank to keep current)' : ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.users.mobile}
                </label>
                <Input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.users.whatsapp}
                </label>
                <Input
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.users.role} *
              </label>
              <select
                name="id_role"
                value={formData.id_role}
                onChange={handleChange}
                required
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                disabled={isAdmin()}
              >
                <option value="">{t.items.select}</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {translateRole(role.name)}
                  </option>
                ))}
              </select>
            </div>

            {isSuperAdmin() && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.users.company} *
                </label>
                <select
                  name="id_company"
                  value={formData.id_company}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">{t.items.select}</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isEditing && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="active" className="ml-2 text-sm font-medium">
                  {t.users.active}
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t.items.saving : isEditing ? t.items.update : t.items.create}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
