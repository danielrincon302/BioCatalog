'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { catalogApi, getImageUrl } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, ArrowLeft, MapPin, Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface Item {
  id: number;
  scientific_name: string;
  common_name: string;
  slug: string;
  description: string;
  history: string;
  notes: string;
  location_detail: string;
  coordinates: string;
  quantity: number;
  planting_date: string;
  germination_date: string;
  additional_info_url: string;
  collection: { id: number; name: string };
  company: { id: number; name: string };
  user: { id: number; name: string };
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  images: { id: number; file_url: string; description: string }[];
  qr_image: { qr_image_url: string; barcode_number: string } | null;
}

export default function ItemDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { t, language, translateCollection } = useLanguage();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await catalogApi.get(slug);
        setItem(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || t.catalog.itemNotFound);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchItem();
    }
  }, [slug, t.catalog.itemNotFound]);

  const nextImage = () => {
    if (item && item.images.length > 0) {
      setCurrentImage((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item && item.images.length > 0) {
      setCurrentImage((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Leaf className="h-16 w-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-600 mb-2">{t.catalog.itemNotFound}</h1>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link href="/catalog">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.catalog.backToCatalog}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/catalog" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">BioCatalog</span>
            </Link>
            <Link href="/catalog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.catalog.back}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                {item.images && item.images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(item.images[currentImage].file_url)}
                      alt={item.scientific_name}
                      className="w-full h-full object-contain"
                    />
                    {item.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                          {item.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImage(index)}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImage ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="h-24 w-24 text-gray-300" />
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnails */}
            {item.images && item.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                {item.images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      index === currentImage ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getImageUrl(img.file_url)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Information */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm mb-2">
                {translateCollection(item.collection.name)}
              </span>
              <h1 className="text-3xl font-bold italic">{item.scientific_name}</h1>
              {item.common_name && (
                <p className="text-xl text-gray-600 mt-1">{item.common_name}</p>
              )}
              <p className="text-sm text-gray-400 mt-2">
                {t.catalog.by} {item.company.name}
              </p>
            </div>

            {/* Description */}
            {item.description && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-semibold mb-2">{t.items.description}</h2>
                  <p className="text-gray-600 whitespace-pre-line">{item.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Taxonomy */}
            {item.taxonomy && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-semibold mb-4">{t.catalog.taxonomicClassification}</h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {item.taxonomy.kingdom && (
                      <div>
                        <span className="text-gray-500">{t.items.kingdom}:</span>{' '}
                        <span className="font-medium">{item.taxonomy.kingdom}</span>
                      </div>
                    )}
                    {item.taxonomy.phylum && (
                      <div>
                        <span className="text-gray-500">{t.items.phylum}:</span>{' '}
                        <span className="font-medium">{item.taxonomy.phylum}</span>
                      </div>
                    )}
                    {item.taxonomy.class && (
                      <div>
                        <span className="text-gray-500">{t.items.class}:</span>{' '}
                        <span className="font-medium">{item.taxonomy.class}</span>
                      </div>
                    )}
                    {item.taxonomy.order && (
                      <div>
                        <span className="text-gray-500">{t.items.order}:</span>{' '}
                        <span className="font-medium">{item.taxonomy.order}</span>
                      </div>
                    )}
                    {item.taxonomy.family && (
                      <div>
                        <span className="text-gray-500">{t.items.family}:</span>{' '}
                        <span className="font-medium">{item.taxonomy.family}</span>
                      </div>
                    )}
                    {item.taxonomy.genus && (
                      <div>
                        <span className="text-gray-500">{t.items.genus}:</span>{' '}
                        <span className="font-medium italic">{item.taxonomy.genus}</span>
                      </div>
                    )}
                    {item.taxonomy.species && (
                      <div>
                        <span className="text-gray-500">{t.items.species}:</span>{' '}
                        <span className="font-medium italic">{item.taxonomy.species}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            {(item.location_detail || item.coordinates) && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-semibold mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {t.items.location}
                  </h2>
                  {item.location_detail && (
                    <p className="text-gray-600">{item.location_detail}</p>
                  )}
                  {item.coordinates && (
                    <p className="text-sm text-gray-400 mt-1">
                      {t.items.coordinates}: {item.coordinates}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Herbarium Dates */}
            {(item.planting_date || item.germination_date) && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-semibold mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t.catalog.dates}
                  </h2>
                  <div className="space-y-1 text-sm">
                    {item.planting_date && (
                      <p>
                        <span className="text-gray-500">{t.catalog.planting}:</span>{' '}
                        {new Date(item.planting_date).toLocaleDateString(language === 'es' ? 'es-CO' : 'en-US')}
                      </p>
                    )}
                    {item.germination_date && (
                      <p>
                        <span className="text-gray-500">{t.catalog.germination}:</span>{' '}
                        {new Date(item.germination_date).toLocaleDateString(language === 'es' ? 'es-CO' : 'en-US')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History */}
            {item.history && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-semibold mb-2">{t.items.history}</h2>
                  <p className="text-gray-600 whitespace-pre-line">{item.history}</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Link */}
            {item.additional_info_url && (
              <a
                href={item.additional_info_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t.catalog.moreInformation}
              </a>
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
