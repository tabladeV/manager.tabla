'use client'

import { useState } from "react"
import { Upload, Plus, X, AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function Photos() {
  const [images, setImages] = useState<string[]>([])
  const maxImages = 10

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const remainingSlots = maxImages - images.length
      const newImages = Array.from(files)
        .slice(0, remainingSlots)
        .map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const {t}= useTranslation();

  return (
    <div className="bg-white rounded-lg flex gap-3 flex-col items-center p-6 w-full">
      <div >
        <h2>{t('settingsPage.photos.title')}</h2>
      </div>
      <div className="space-y-6 w-full">
        <div className="flex justify-center">
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              id="image-upload"
              onChange={handleFileUpload}
              disabled={images.length >= maxImages}
            />
            <label
              htmlFor="image-upload"
              className={`flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors ${
                images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>{t('settingsPage.photos.buttons.uploadPhoto')} ({images.length}/{maxImages})</span>
            </label>
          </div>
        </div>

        {images.length >= maxImages && (
          <div className="flex items-center justify-center text-amber-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{t('settingsPage.photos.warning')}</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(maxImages)].map((_, index) => (
            <div
              key={index}
              className="aspect-square relative bg-gray-50 rounded-lg border border-gray-200"
            >
              {images[index] ? (
                <>
                  <img
                    src={images[index]}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                </>
              ) :  null}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            className="btn-primary"
            onClick={() => console.log('Saving images:', images)}
          >
            {t('settingsPage.photos.buttons.save')}
          </button>
          <button
            className="btn-secondary hover:bg-[#88AB6150] hover:text-greentheme transition-colors"
            onClick={() => setImages([])}
          >
            {t('settingsPage.photos.buttons.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}