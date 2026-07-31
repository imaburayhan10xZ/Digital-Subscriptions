import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';

export const SiteSettingsSync: React.FC = () => {
  const { settings } = useAuth();

  useEffect(() => {
    if (settings) {
      document.title = settings.siteName || 'ApexBoost';
      
      // Sync promoPrefix
      const promoPrefixMeta = document.querySelector("meta[name='promo-prefix']") as HTMLMetaElement;
      if (promoPrefixMeta) {
        promoPrefixMeta.content = settings.promoPrefix || 'APEX';
      }
    }
  }, [settings]);

  return null;
};
