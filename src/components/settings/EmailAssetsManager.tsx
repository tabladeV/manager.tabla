import { useState, useEffect, useRef } from 'react';
import { useList, useDelete, BaseKey, useApiUrl } from '@refinedev/core';
import { useTranslation } from 'react-i18next';
import { X, Upload, Trash2 } from 'lucide-react';
import { useDarkContext } from '../../context/DarkContext';
import BaseBtn from '../common/BaseBtn';
import Portal from '../common/Portal';
import { httpClient } from "../../services/httpClient"

interface Asset {
  id: BaseKey;
  file: string;
  absolute_url: string;
  uploaded_at: string;
}

interface AssetsApiResponse {
  results: Asset[];
  count: number;
}

interface EmailAssetsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (url: string) => void;
}

const EmailAssetsManager = ({ isOpen, onClose, onSelectAsset }: EmailAssetsManagerProps) => {
  const { t } = useTranslation();
  const { darkMode } = useDarkContext();
  const [assets, setAssets] = useState<Asset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = useApiUrl();
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, isError, refetch } = useList({
    resource: 'api/v1/bo/email/assets/',
    pagination: { pageSize: 100 },
    queryOptions: { enabled: isOpen },
  });

  const { mutate: deleteAsset } = useDelete();

  useEffect(() => {
    if ((data?.data as any as AssetsApiResponse)?.results) {
      setAssets((data?.data as any as AssetsApiResponse).results);
    }
  }, [data]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      setIsUploading(true);
      try {
        await httpClient.post(`${apiUrl}/api/v1/bo/email/assets/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        refetch();
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = (id: BaseKey) => {
    deleteAsset(
      {
        resource: 'api/v1/bo/email/assets',
        id: id+'/',
      },
      {
        onSuccess: () => {
          setAssets((prev) => prev.filter((asset) => asset.id !== id));
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`w-full max-w-4xl h-[80vh] rounded-lg p-6 flex flex-col ${darkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{t('settingsPage.messagingTemplates.assetManager')}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="flex justify-end mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <BaseBtn
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              loading={isUploading}
              disabled={isUploading}
            >
              <Upload size={20} className="mr-2" />
              {isUploading ? t('common.uploading') : t('common.upload')}
            </BaseBtn>
          </div>

          <div className="flex-grow overflow-y-auto">
            {isLoading && <div>{t('settingsPage.messagingTemplates.loadingAssets')}</div>}
            {isError && <div>{t('settingsPage.messagingTemplates.errorFetchingAssets')}</div>}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="relative group aspect-square">
                  <img
                    src={asset.absolute_url}
                    alt="asset"
                    className="w-full h-full object-cover rounded-md cursor-pointer border border-gray-200 dark:border-gray-700"
                    onClick={() => onSelectAsset(asset.absolute_url)}
                  />
                  <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default EmailAssetsManager;