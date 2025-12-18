'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { itemsApi, getImageUrl } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { X, Plus, Trash2, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface ItemFormModalProps {
  item: any;
  collections: { id: number; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemImage {
  id?: number;
  file_url: string;
  description?: string;
  isNew?: boolean;
  file?: File;
  previewUrl?: string;
}

export default function ItemFormModal({
  item,
  collections,
  onClose,
  onSuccess,
}: ItemFormModalProps) {
  const { t, translateCollection } = useLanguage();
  const isEditing = !!item;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Images state
  const [images, setImages] = useState<ItemImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [imageError, setImageError] = useState('');
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const [formData, setFormData] = useState({
    id_collection: item?.collection?.id || '',
    scientific_name: item?.scientific_name || '',
    common_name: item?.common_name || '',
    description: item?.description || '',
    history: item?.history || '',
    notes: item?.notes || '',
    location_detail: item?.location_detail || '',
    coordinates: item?.coordinates || '',
    quantity: item?.quantity || 1,
    planting_date: item?.planting_date || '',
    germination_date: item?.germination_date || '',
    additional_info_url: item?.additional_info_url || '',
    status: item?.status || 'VISIBLE',
    taxonomy: {
      kingdom: item?.taxonomy?.kingdom || '',
      phylum: item?.taxonomy?.phylum || '',
      class: item?.taxonomy?.class || '',
      order: item?.taxonomy?.order || '',
      family: item?.taxonomy?.family || '',
      genus: item?.taxonomy?.genus || '',
      species: item?.taxonomy?.species || '',
    },
  });

  // Load existing images when editing
  useEffect(() => {
    if (item?.images && item.images.length > 0) {
      setImages(item.images.map((img: any) => ({
        id: img.id,
        file_url: img.file_url,
        description: img.description,
        isNew: false,
      })));
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('taxonomy.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        taxonomy: { ...prev.taxonomy, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Image handling functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setImageError('');

    const currentCount = images.length;
    const availableSlots = MAX_IMAGES - currentCount;

    if (availableSlots <= 0) {
      setImageError(t.items.maxImagesError || `Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToAdd = Array.from(files).slice(0, availableSlots);
    const newImages: ItemImage[] = [];

    for (const file of filesToAdd) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setImageError(t.items.fileTooLarge || `File "${file.name}" exceeds 2MB limit`);
        continue;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageError(t.items.invalidFileType || `File "${file.name}" is not an image`);
        continue;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        file_url: previewUrl,
        previewUrl: previewUrl,
        file: file,
        isNew: true,
      });
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      setSelectedImageIndex(currentCount);
    }

    // Reset input
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];

    // Revoke preview URL to free memory
    if (imageToRemove.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    if (imageToRemove.id) {
      setImagesToDelete((prev) => [...prev, imageToRemove.id!]);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
    if (selectedImageIndex >= images.length - 1) {
      setSelectedImageIndex(Math.max(0, images.length - 2));
    }
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let itemId = item?.id;

      if (isEditing) {
        await itemsApi.update(item.id, formData);
      } else {
        const response = await itemsApi.create(formData);
        itemId = response.data.data.id;
      }

      // Delete removed images
      for (const imageId of imagesToDelete) {
        try {
          await itemsApi.deleteImage(itemId, imageId);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }

      // Add new images (files)
      const newImages = images.filter((img) => img.isNew && img.file);
      if (newImages.length > 0) {
        const files = newImages.map((img) => img.file!);
        await itemsApi.addImages(itemId, files);
      }

      // Clean up preview URLs
      images.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || t.messages.errorSaving);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the selected collection is Herbarium (id 6)
  const isHerbarium = formData.id_collection == 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? t.items.editItem : t.items.newItem}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="px-6 py-4 space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t.items.basicInfo}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.items.collection} *
                  </label>
                  <select
                    name="id_collection"
                    value={formData.id_collection}
                    onChange={handleChange}
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">{t.items.select}</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {translateCollection(col.name)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.items.status}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="VISIBLE">{t.items.visible}</option>
                    <option value="NOT_VISIBLE">{t.items.notVisible}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.items.scientificName} *
                  </label>
                  <Input
                    name="scientific_name"
                    value={formData.scientific_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.items.commonName}
                  </label>
                  <Input
                    name="common_name"
                    value={formData.common_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {t.items.description}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Taxonomy */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t.items.taxonomy}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.kingdom}</label>
                  <Input
                    name="taxonomy.kingdom"
                    value={formData.taxonomy.kingdom}
                    onChange={handleChange}
                    placeholder="Animalia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.phylum}</label>
                  <Input
                    name="taxonomy.phylum"
                    value={formData.taxonomy.phylum}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.class}</label>
                  <Input
                    name="taxonomy.class"
                    value={formData.taxonomy.class}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.order}</label>
                  <Input
                    name="taxonomy.order"
                    value={formData.taxonomy.order}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.family}</label>
                  <Input
                    name="taxonomy.family"
                    value={formData.taxonomy.family}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.genus}</label>
                  <Input
                    name="taxonomy.genus"
                    value={formData.taxonomy.genus}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.species}</label>
                  <Input
                    name="taxonomy.species"
                    value={formData.taxonomy.species}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.quantity}</label>
                  <Input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Herbarium Dates */}
            {isHerbarium && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t.items.herbariumDates}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.items.plantingDate}
                    </label>
                    <Input
                      type="date"
                      name="planting_date"
                      value={formData.planting_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.items.germinationDate}
                    </label>
                    <Input
                      type="date"
                      name="germination_date"
                      value={formData.germination_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t.items.location}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.items.locationDetail}
                  </label>
                  <Input
                    name="location_detail"
                    value={formData.location_detail}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.items.coordinates}
                  </label>
                  <Input
                    name="coordinates"
                    value={formData.coordinates}
                    onChange={handleChange}
                    placeholder="3.4516, -76.5320"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t.items.additionalInfo}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.items.additionalInfoUrl}
                  </label>
                  <Input
                    name="additional_info_url"
                    value={formData.additional_info_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.history}</label>
                  <textarea
                    name="history"
                    value={formData.history}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.items.notes}</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                <ImageIcon className="inline h-5 w-5 mr-2" />
                {t.items.images}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({images.length}/{MAX_IMAGES})
                </span>
              </h3>

              {/* Image error message */}
              {imageError && (
                <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">
                  {imageError}
                </div>
              )}

              {/* Add image input */}
              <div className="mb-4">
                <label className="block">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    disabled={images.length >= MAX_IMAGES}
                    className="hidden"
                    id="image-upload"
                  />
                  <div
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      images.length >= MAX_IMAGES
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:border-primary hover:bg-primary/5 text-gray-600'
                    }`}
                    onClick={() => {
                      if (images.length < MAX_IMAGES) {
                        document.getElementById('image-upload')?.click();
                      }
                    }}
                  >
                    <Plus className="h-5 w-5" />
                    <span>
                      {images.length >= MAX_IMAGES
                        ? t.items.maxImagesReached || 'Maximum images reached'
                        : t.items.selectImages || 'Select images'}
                    </span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  {t.items.imageRequirements || 'JPG, PNG, GIF or WebP. Max 2MB per image.'}
                </p>
              </div>

              {/* Images display */}
              {images.length > 0 ? (
                <div className="space-y-3">
                  {/* Main image (large) */}
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={images[selectedImageIndex]?.previewUrl || getImageUrl(images[selectedImageIndex]?.file_url)}
                      alt={`Image ${selectedImageIndex + 1}`}
                      className="w-full h-64 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12">Error</text></svg>';
                      }}
                    />

                    {/* Navigation arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(selectedImageIndex)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Image counter */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </div>

                  {/* Thumbnails (smaller images) */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                            index === selectedImageIndex
                              ? 'border-primary ring-2 ring-primary/30'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={img.previewUrl || getImageUrl(img.file_url)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect fill="%23f3f4f6" width="64" height="64"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="8">Error</text></svg>';
                            }}
                          />
                          {img.isNew && (
                            <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded-bl">
                              {t.items.newLabel || 'New'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>{t.items.noImages}</p>
                  <p className="text-sm mt-1">{t.items.addImageHint || 'Add image URLs above'}</p>
                </div>
              )}
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
