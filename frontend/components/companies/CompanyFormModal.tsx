'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { companiesApi, collectionsApi } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { X } from 'lucide-react';

interface Collection {
  id: number;
  name: string;
  pivot?: {
    visible: boolean;
  };
}

interface CompanyFormModalProps {
  company: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompanyFormModal({
  company,
  onClose,
  onSuccess,
}: CompanyFormModalProps) {
  const { t, translateCollection } = useLanguage();
  const isEditing = !!company;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [allCollections, setAllCollections] = useState<Collection[]>([]);

  const [formData, setFormData] = useState({
    name: company?.name || '',
    nit: company?.nit || '',
    address: company?.address || '',
    phone: company?.phone || '',
    email: company?.email || '',
    logo_url: company?.logo_url || '',
    active: company?.active ?? true,
  });

  // Collection visibility state
  const [collectionVisibility, setCollectionVisibility] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    // Initialize collection visibility from company data
    if (company?.collections && allCollections.length > 0) {
      const visibility: Record<number, boolean> = {};
      allCollections.forEach(col => {
        // Find if this collection is configured for this company
        const companyCol = company.collections.find((cc: Collection) => cc.id === col.id);
        // Default to true if not configured
        visibility[col.id] = companyCol ? companyCol.pivot?.visible ?? true : true;
      });
      setCollectionVisibility(visibility);
    } else if (allCollections.length > 0) {
      // For new companies, default all to visible
      const visibility: Record<number, boolean> = {};
      allCollections.forEach(col => {
        visibility[col.id] = true;
      });
      setCollectionVisibility(visibility);
    }
  }, [company, allCollections]);

  const fetchCollections = async () => {
    try {
      const response = await collectionsApi.list();
      setAllCollections(response.data.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCollectionToggle = (collectionId: number) => {
    setCollectionVisibility(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Prepare collections data
      const collections = Object.entries(collectionVisibility).map(([id, visible]) => ({
        id: parseInt(id),
        visible
      }));

      const dataToSend = {
        ...formData,
        collections
      };

      if (isEditing) {
        await companiesApi.update(company.id, dataToSend);
      } else {
        await companiesApi.create(dataToSend);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || t.messages.errorSaving);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? t.companies.editCompany : t.companies.newCompany}
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
                {t.companies.name} *
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
                {t.companies.taxId}
              </label>
              <Input
                name="nit"
                value={formData.nit}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.companies.address}
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.companies.phone}
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.companies.email}
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.companies.logo} (URL)
              </label>
              <Input
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

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
                  {t.companies.active}
                </label>
              </div>
            )}

            {/* Collection Visibility Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-2">{t.companies.collectionsVisibility}</h3>
              <p className="text-sm text-gray-500 mb-4">{t.companies.collectionsVisibilityDescription}</p>

              <div className="grid grid-cols-2 gap-3">
                {allCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      collectionVisibility[collection.id]
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => handleCollectionToggle(collection.id)}
                  >
                    <span className="font-medium">{translateCollection(collection.name)}</span>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      collectionVisibility[collection.id] ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        collectionVisibility[collection.id] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
