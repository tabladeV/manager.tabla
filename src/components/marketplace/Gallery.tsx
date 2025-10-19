import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, Eye } from 'lucide-react'

const Gallery = () => {
  const { t } = useTranslation()
  const [images, setImages] = useState<string[]>([])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target?.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="rounded-[10px] p-6 bg-white dark:bg-bgdarktheme">
      <h2 className="text-xl font-bold mb-4 text-blacktheme dark:text-textdarktheme">
        {t('marketplaceSettings.gallery.title')}
      </h2>
      <p className="text-subblack dark:text-softwhitetheme mb-6">
        {t('marketplaceSettings.gallery.description')}
      </p>

      {/* Upload Section */}
      <div className="mb-8">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-softgreytheme dark:border-darkthemeitems rounded-lg cursor-pointer hover:bg-softgreytheme/10 dark:hover:bg-darkthemeitems/10">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-4 text-subblack dark:text-softwhitetheme" />
            <p className="mb-2 text-sm text-subblack dark:text-softwhitetheme">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-subblack dark:text-softwhitetheme">
              PNG, JPG or WEBP (MAX. 10MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 mr-2"
                >
                  <X size={16} />
                </button>
                <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button className="btn-primary px-6 py-2">
          {t('settingsPage.general.basicInformationForm.buttons.save')}
        </button>
      </div>
    </div>
  )
}

export default Gallery
