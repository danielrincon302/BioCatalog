'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { itemsApi, collectionsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import ItemFormModal from '@/components/items/ItemFormModal';

interface Item {
  id: number;
  scientific_name: string;
  common_name: string;
  slug: string;
  status: string;
  collection: { id: number; name: string };
  company: { id: number; name: string };
  user: { id: number; name: string };
  images: any[];
}

interface Collection {
  id: number;
  name: string;
}

export default function ItemsPage() {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const { t, translateCollection } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const fetchItems = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCollection) params.id_collection = selectedCollection;

      const response = await itemsApi.list(params);
      setItems(response.data.data.data || response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await collectionsApi.list();
      setCollections(response.data.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [search, selectedCollection]);

  const handleDelete = async (id: number) => {
    if (!confirm(t.items.deleteConfirm)) return;

    try {
      await itemsApi.delete(id);
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.message || t.items.deleteError);
    }
  };

  const canEditItem = (item: Item) => {
    if (isSuperAdmin() || isAdmin()) return true;
    return item.user.id === user?.id;
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: Item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchItems();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.items.title}</h1>
            <p className="text-gray-500">{t.items.subtitle}</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t.items.newItem}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t.items.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">{t.items.allCollections}</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {translateCollection(col.name)}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>{t.items.itemsList}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t.items.noItemsFound}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{t.items.scientificName}</th>
                      <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">{t.items.commonName}</th>
                      <th className="text-left py-3 px-4 font-medium hidden md:table-cell">{t.items.collection}</th>
                      <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">{t.items.status}</th>
                      <th className="text-right py-3 px-4 font-medium">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{item.scientific_name}</div>
                          <div className="text-sm text-gray-500 sm:hidden">
                            {item.common_name}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          {item.common_name || '-'}
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {translateCollection(item.collection.name)}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.status === 'VISIBLE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status === 'VISIBLE' ? t.items.visible : t.items.notVisible}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/catalog/${item.slug}`, '_blank')}
                              title={t.items.viewInCatalog}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEditItem(item) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEdit(item)}
                                  title={t.common.edit}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(item.id)}
                                  title={t.common.delete}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
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
        <ItemFormModal
          item={editingItem}
          collections={collections}
          onClose={handleCloseModal}
          onSuccess={handleSaveSuccess}
        />
      )}
    </DashboardLayout>
  );
}
