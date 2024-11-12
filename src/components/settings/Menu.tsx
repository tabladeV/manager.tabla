'use client'

import { useState } from "react"
import { Pencil, Trash2, ChevronDown, Plus, Check } from "lucide-react"

interface MenuItem {
  id: string
  foodName: string
  price: string
  category: string
}

interface MenuSection {
  id: string
  name: string
  items: MenuItem[]
}

export default function Component() {
  const [menuSections, setMenuSections] = useState<MenuSection[]>([
    {
      id: '1',
      name: 'Menu Name',
      items: [{
        id: '1-0',
        foodName: '',
        price: '',
        category: ''
      }]
    }
  ])
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionName, setEditingSectionName] = useState<string>('')

  const addMenuSection = () => {
    const newSection: MenuSection = {
      id: Date.now().toString(),
      name: 'Menu Name',
      items: [{
        id: `${Date.now()}-0`,
        foodName: '',
        price: '',
        category: ''
      }]
    }
    setMenuSections([...menuSections, newSection])
  }

  const updateMenuItem = (sectionId: string, itemId: string, field: keyof MenuItem, value: string) => {
    setMenuSections(sections => 
      sections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? { ...item, [field]: value }
                  : item
              )
            }
          : section
      )
    )
  }

  const deleteMenuItem = (sectionId: string, itemId: string) => {
    setMenuSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, items: section.items.filter(item => item.id !== itemId) }
          : section
      )
    )
  }

  const addMenuItem = (sectionId: string) => {
    setMenuSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: [
                ...section.items,
                {
                  id: `${Date.now()}-${section.items.length}`,
                  foodName: '',
                  price: '',
                  category: ''
                }
              ]
            }
          : section
      )
    )
  }

  const deleteMenuSection = (sectionId: string) => {
    setMenuSections(sections => sections.filter(section => section.id !== sectionId))
  }

  const startEditingSection = (sectionId: string, sectionName: string) => {
    setEditingSectionId(sectionId)
    setEditingSectionName(sectionName)
  }

  const saveEditingSection = () => {
    if (editingSectionId) {
      setMenuSections(sections =>
        sections.map(section =>
          section.id === editingSectionId
            ? { ...section, name: editingSectionName }
            : section
        )
      )
      setEditingSectionId(null)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-medium text-center mb-8">Menu</h1>

      <div className="space-y-8">
        {menuSections.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className="flex items-center gap-2">
              {editingSectionId === section.id ? (
                <>
                  <input
                    type="text"
                    value={editingSectionName}
                    onChange={(e) => setEditingSectionName(e.target.value)}
                    className="inputs-unique text-[#2B5219] font-medium px-2 py-1 border rounded"
                  />
                  <button
                    onClick={saveEditingSection}
                    className="p-2 rounded bg-softgreentheme text-greentheme hover:bg-[#88AB6130] transition-colors"
                    aria-label="Save section name"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-[#2B5219] font-medium">{section.name}</h2>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditingSection(section.id, section.name)}
                      className="p-2 rounded bg-softgreentheme text-greentheme hover:bg-[#88AB6130] transition-colors"
                      aria-label="Edit section"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteMenuSection(section.id)}
                      className="p-2 rounded bg-softredtheme text-redtheme hover:bg-red-200 transition-colors"
                      aria-label="Delete section"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {section.items.map((item) => (
              <div key={item.id} className="flex gap-4 w-full flex-wrap justify-center items-center">
                <input
                  type="text"
                  placeholder="Food name"
                  className="inputs-unique  flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-greentheme"
                  value={item.foodName}
                  onChange={(e) => updateMenuItem(section.id, item.id, 'foodName', e.target.value)}
                />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Price"
                    className="inputs-unique w-32 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-greentheme"
                    value={item.price}
                    onChange={(e) => updateMenuItem(section.id, item.id, 'price', e.target.value)}
                  />
                  <span className="absolute right-3 top-3 text-[#2B5219]">DH</span>
                </div>
                <div className="relative w-48">
                  <select
                    className="inputs-unique w-full appearance-none px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-greentheme bg-white"
                    value={item.category}
                    onChange={(e) => updateMenuItem(section.id, item.id, 'category', e.target.value)}
                  >
                    <option value="">Category</option>
                    <option value="appetizer">Appetizer</option>
                    <option value="main">Main Course</option>
                    <option value="dessert">Dessert</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => deleteMenuItem(section.id, item.id)}
                  className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  aria-label="Delete item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addMenuItem(section.id)}
              className="flex items-center gap-2 text-[#2B5219] hover:text-[#1a310f] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        ))}

        <button
          onClick={addMenuSection}
          className="flex items-center gap-2 text-[#2B5219] hover:text-[#1a310f] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Menu
        </button>

        <div className="flex justify-center gap-4 pt-4">
          <button
            className="btn-primary"
            onClick={() => console.log('Saving menu:', menuSections)}
          >
            Save
          </button>
          <button
            className="btn-secondary hover:bg-[#88AB6150] hover:text-greentheme transition-colors"
            onClick={() => setMenuSections([{
              id: '1',
              name: 'Menu Name',
              items: [{
                id: '1-0',
                foodName: '',
                price: '',
                category: ''
              }]
            }])}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}