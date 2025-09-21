import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface MenuCategory {
  id: number
  name: string
  items: MenuItem[]
}

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category_id: number
}

const MenuPricing = () => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [averagePrice, setAveragePrice] = useState<string>('')
  const [newCategoryName, setNewCategoryName] = useState<string>('')
  const [showCategoryForm, setShowCategoryForm] = useState<boolean>(false)

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: MenuCategory = {
        id: Date.now(),
        name: newCategoryName,
        items: []
      }
      setCategories(prev => [...prev, newCategory])
      setNewCategoryName('')
      setShowCategoryForm(false)
    }
  }

  const deleteCategory = (categoryId: number) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
  }

  return (
    <div className="rounded-[10px] p-6 bg-white dark:bg-bgdarktheme">
      <h2 className="text-xl font-bold mb-4 text-blacktheme dark:text-textdarktheme">
        {t('marketplaceSettings.menu.title')}
      </h2>
      <p className="text-subblack dark:text-softwhitetheme mb-6">
        {t('marketplaceSettings.menu.description')}
      </p>

      {/* Average Price Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-blacktheme dark:text-textdarktheme">
          Average Price Range
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g., 150-300 DH"
            className="inputs dark:bg-darkthemeitems bg-white"
            value={averagePrice}
            onChange={(e) => setAveragePrice(e.target.value)}
          />
          <button className="btn-primary px-4">
            {t('settingsPage.general.basicInformationForm.buttons.save')}
          </button>
        </div>
      </div>

      {/* Menu Categories Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme">
            Menu Categories
          </h3>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {/* Add Category Form */}
        {showCategoryForm && (
          <div className="bg-softgreytheme dark:bg-darkthemeitems p-4 rounded-lg mb-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Category Name"
                className="inputs dark:bg-bgdarktheme bg-white flex-1"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
              <button
                onClick={addCategory}
                className="btn-primary px-4"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCategoryForm(false)
                  setNewCategoryName('')
                }}
                className="btn border border-softgreytheme dark:border-darkthemeitems px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border border-softgreytheme dark:border-darkthemeitems rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-blacktheme dark:text-textdarktheme">
                    {category.name}
                  </h4>
                  <p className="text-sm text-subblack dark:text-softwhitetheme">
                    {category.items.length} items
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-softgreytheme dark:hover:bg-darkthemeitems rounded">
                    <Edit size={16} className="text-subblack dark:text-softwhitetheme" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="p-2 hover:bg-softgreytheme dark:hover:bg-darkthemeitems rounded"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-subblack dark:text-softwhitetheme">
            <p>No categories added yet</p>
            <p className="text-sm mt-1">Add your first category to get started</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary px-6 py-2">
          {t('settingsPage.general.basicInformationForm.buttons.save')}
        </button>
      </div>
    </div>
  )
}

export default MenuPricing
