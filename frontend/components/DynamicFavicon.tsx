'use client';

import { useEffect, useState } from 'react';
import { settingsApi, getImageUrl } from '@/lib/api';

export default function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const response = await settingsApi.get();
        if (response.data.success && response.data.data.favicon_url) {
          setFaviconUrl(response.data.data.favicon_url);
        }
      } catch (error) {
        console.error('Error loading favicon:', error);
      }
    };

    loadFavicon();
  }, []);

  useEffect(() => {
    if (faviconUrl) {
      const fullUrl = getImageUrl(faviconUrl);

      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());

      // Add new favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = fullUrl;
      document.head.appendChild(link);

      // Also add for apple-touch-icon
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = fullUrl;
      document.head.appendChild(appleLink);
    }
  }, [faviconUrl]);

  return null;
}
