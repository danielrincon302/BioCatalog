'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { companiesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import CompanyFormModal from '@/components/companies/CompanyFormModal';

interface Company {
  id: number;
  name: string;
  nit: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  active: boolean;
}

export default function CompaniesPage() {
  const { isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const fetchCompanies = async () => {
    try {
      const response = await companiesApi.list();
      setCompanies(response.data.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(t.companies.deleteConfirm)) return;

    try {
      await companiesApi.delete(id);
      fetchCompanies();
    } catch (error: any) {
      alert(error.response?.data?.message || t.messages.errorDeleting);
    }
  };

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setShowModal(true);
  };

  const handleOpenEdit = (company: Company) => {
    setEditingCompany(company);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchCompanies();
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.nit && c.nit.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.companies.title}</h1>
          </div>
          {isSuperAdmin() && (
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t.companies.newCompany}
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

        {/* Companies List */}
        <Card>
          <CardHeader>
            <CardTitle>{t.companies.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t.common.noResults}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{t.companies.name}</th>
                      <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">{t.companies.taxId}</th>
                      <th className="text-left py-3 px-4 font-medium hidden md:table-cell">{t.companies.phone}</th>
                      <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">{t.companies.email}</th>
                      <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">{t.items.status}</th>
                      {isSuperAdmin() && (
                        <th className="text-right py-3 px-4 font-medium">{t.common.actions}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-gray-500 sm:hidden">
                            {company.nit}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          {company.nit || '-'}
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          {company.phone || '-'}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {company.email || '-'}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            company.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {company.active ? t.users.active : t.users.inactive}
                          </span>
                        </td>
                        {isSuperAdmin() && (
                          <td className="py-3 px-4">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(company)}
                                title={t.common.edit}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(company.id)}
                                title={t.common.delete}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
        <CompanyFormModal
          company={editingCompany}
          onClose={handleCloseModal}
          onSuccess={handleSaveSuccess}
        />
      )}
    </DashboardLayout>
  );
}
