'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { catalogApi, getImageUrl } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { languages, Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Search, Filter, Globe, ChevronDown } from 'lucide-react';

interface Item {
  id: number;
  scientific_name: string;
  common_name: string;
  slug: string;
  description: string;
  collection: { id: number; name: string };
  company: { id: number; name: string };
  images: { file_url: string }[];
}

interface Collection {
  id: number;
  name: string;
  items_count: number;
}

interface Company {
  id: number;
  name: string;
  items_count: number;
}

export default function CatalogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { language, setLanguage, t, translateCollection } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  const currentLang = languages.find(l => l.code === language);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCollection) params.id_collection = selectedCollection;
      if (selectedCompany) params.id_company = selectedCompany;

      const response = await catalogApi.list(params);
      setItems(response.data.data.data || response.data.data);
    } catch (error) {
      console.error('Error fetching catalog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [colRes, compRes] = await Promise.all([
        catalogApi.collections(),
        catalogApi.companies(),
      ]);
      setCollections(colRes.data.data);
      setCompanies(compRes.data.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [search, selectedCollection, selectedCompany]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/catalog" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">BioCatalog</span>
            </Link>
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700 hidden sm:inline">{currentLang?.flag} {currentLang?.name}</span>
                  <span className="text-sm text-gray-700 sm:hidden">{currentLang?.flag}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[140px] z-20">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          language === lang.code ? 'bg-gray-50 text-primary' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  {t.auth.login}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t.catalog.title}</h1>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            {t.catalog.subtitle}
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder={t.catalog.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-gray-900"
            />
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filter Toggle (Mobile) */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-between"
          >
            <span className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              {t.catalog.filters}
            </span>
            <span className="text-xs text-gray-500">
              {selectedCollection || selectedCompany ? t.catalog.filtersActive : ''}
            </span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-24">
              <CardContent className="pt-6 space-y-6">
                {/* Collections */}
                <div>
                  <h3 className="font-semibold mb-3">{t.catalog.collections}</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCollection('')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        !selectedCollection
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {t.catalog.all}
                    </button>
                    {collections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => setSelectedCollection(String(col.id))}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between ${
                          selectedCollection === String(col.id)
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span>{translateCollection(col.name)}</span>
                        <span className="text-xs opacity-70">{col.items_count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Companies */}
                {companies.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">{t.catalog.companies}</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCompany('')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          !selectedCompany
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {t.catalog.all}
                      </button>
                      {companies.map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => setSelectedCompany(String(comp.id))}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between ${
                            selectedCompany === String(comp.id)
                              ? 'bg-primary text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <span>{comp.name}</span>
                          <span className="text-xs opacity-70">{comp.items_count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Items Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">{t.catalog.loadingCatalog}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600">{t.catalog.noItemsFound}</h3>
                <p className="text-gray-500">{t.catalog.tryDifferentFilters}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Link key={item.id} href={`/catalog/${item.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="aspect-video bg-gray-100 relative">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.images[0].file_url)}
                            alt={item.scientific_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="h-16 w-16 text-gray-300" />
                          </div>
                        )}
                        <span className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                          {translateCollection(item.collection.name)}
                        </span>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-lg italic">
                          {item.scientific_name}
                        </h3>
                        {item.common_name && (
                          <p className="text-gray-600">{item.common_name}</p>
                        )}
                        <p className="text-sm text-gray-400 mt-2">
                          {item.company.name}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-6 w-6" />
            <span className="font-bold">BioCatalog</span>
          </div>
          <p className="text-gray-400 text-sm">
            {t.catalog.footerDescription}
          </p>
        </div>
      </footer>
    </div>
  );
}
