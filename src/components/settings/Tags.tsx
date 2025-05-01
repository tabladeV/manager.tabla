"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import ActionPopup from "../popup/ActionPopup"
import { Info, X } from "lucide-react"
import { BaseRecord, useCreate, useDelete, useList, useUpdate } from "@refinedev/core"
import { set } from "date-fns"

interface Tag {
  id: number
  name: string
}

const Tags = () => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const [tags, setTags] = useState<Tag[]>([
    { id: 1, name: "Restaurant" },
    { id: 2, name: "Terrace" },
    { id: 3, name: "Bar" },
    { id: 4, name: "Cafe" },
    { id: 5, name: "Club" },
    { id: 6, name: "Lounge" },
    { id: 7, name: "Pub" },
    { id: 8, name: "Rooftop" },
    { id: 9, name: "Garden" },
  ])

  interface TagsAPI {
    results: Tag[]
    count: number
  }
  const [tagsAPI, setTagsAPI] = useState<TagsAPI>()

  const { data: tagsDada, isLoading, error } = useList({
      resource: "api/v1/bo/tags/",
      filters: [
        {
          field: "page",
          operator: "eq",
          value: 1,
        },
        {
          field: "page_size",
          operator: "eq",
          value: 100,
        },
      ],
      queryOptions:{
          onSuccess(data){
              console.log('tags data',data)
              setTagsAPI(data.data as unknown as TagsAPI)
          },
          onError(error){
              console.log(error)
          }

      },
      errorNotification(error, values, resource) {
          return {
            type: 'error',
            message: error?.formattedMessage,
          };
        },
  });

  const { mutate: createTag } = useCreate({
      errorNotification(error, values, resource) {
          return {
            type: 'error',
            message: error?.formattedMessage,
          };
        },
  });

  const { mutate: deleteTag } = useDelete();

  const {mutate: updateTag} = useUpdate();
  

  useEffect(() => {
    if (tagsAPI) {
      setTags(tagsAPI.results)
    }
  }, [tagsAPI])


  const [inputValue, setInputValue] = useState("")
  const [editTagId, setEditTagId] = useState<number | null>(null)
  const [showInfoTip, setShowInfoTip] = useState(true)

  const [showPopup, setShowPopup] = useState(false)
  const [action, setAction] = useState<"delete" | "update" | "create" | "confirm">("delete")
  const [message, setMessage] = useState<string>("")
  const [tagIndex, setTagIndex] = useState<number>()

  // Focus input when editing
  useEffect(() => {
    if (editTagId !== null && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editTagId])

  // Set input value when editing
  useEffect(() => {
    if (editTagId !== null) {
      const tagToEdit = tags.find((tag) => tag.id === editTagId)
      setInputValue(tagToEdit?.name || "")
    }
  }, [editTagId, tags])

  const saveTag = () => {
    if (inputValue.trim() === "") return

    if (editTagId !== null) {
      setTags(tags.map((tag) => (tag.id === editTagId ? { ...tag, name: inputValue.trim() } : tag)))
      updateTag({
        resource: "api/v1/bo/tags",
        id: editTagId+'/',
        values: {
          name: inputValue.trim(),
        },
      })
      setEditTagId(null)
    } else {
      const newTag = {
        id: Math.max(0, ...tags.map((t) => t.id)) + 1,
        name: inputValue.trim(),
      }
      createTag({
        resource: "api/v1/bo/tags/",
        values: {
          name: newTag.name,
          grouping_field: 'default_group', // add this
        },
    })
    
      setTags([...tags, newTag])
    }

    setInputValue("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveTag()
    } else if (e.key === "Escape" && editTagId !== null) {
      setEditTagId(null)
      setInputValue("")
    }
  }

  const handleToDropTag = (id: number) => {
    setAction("delete")
    setTagIndex(id)
    setMessage(t("settingsPage.tags.deleteTag"))
    setShowPopup(true)
  }

  const dropTag = () => {
    if (tagIndex !== undefined) {
      setTags(tags.filter((tag) => tag.id !== tagIndex))
      deleteTag({
        resource: "api/v1/bo/tags",
        id: tagIndex+'/',
        metaData: {
          action: "delete",
        }
      })
      setTagIndex(undefined)
        
    }
  }

  const handleEditTag = (id: number) => {
    if (editTagId === id) return
    setEditTagId(id)
  }

  const cancelEdit = () => {
    setEditTagId(null)
    setInputValue("")
  }

  return (
    <div className="rounded-lg flex flex-col p-6 w-full dark:bg-bgdarktheme bg-white">
      <ActionPopup
        action={action}
        message={message}
        actionFunction={dropTag}
        showPopup={showPopup}
        setShowPopup={setShowPopup}
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold dark:text-textdarktheme">{t("settingsPage.tags.title")}</h2>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="tag" className="font-medium ml-2 dark:text-textdarktheme">
              {editTagId !== null ? "Editing tag" : t("settingsPage.tags.label")}
            </label>

            {editTagId !== null && (
              <button onClick={cancelEdit} className="text-sm text-redtheme hover:underline">
                Cancel editing
              </button>
            )}
          </div>

          <div className="flex gap-2 lt-sm:flex-col">
            <input
              ref={inputRef}
              type="text"
              id="tag"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("settingsPage.tags.placeHolder")}
              className="inputs flex-1 px-4 py-2 rounded-lg border border-softgreytheme dark:border-darkthemeitems dark:bg-darkthemeitems dark:text-textdarktheme focus:outline-none focus:ring-2 focus:ring-greentheme"
            />

            <button
              onClick={saveTag}
              disabled={inputValue.trim() === ""}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                inputValue.trim() === ""
                  ? "bg-softgreytheme text-greytheme cursor-not-allowed dark:bg-darkthemeitems dark:text-textdarktheme opacity-50"
                  : "bg-greentheme text-white hover:bg-opacity-90"
              }`}
            >
              {editTagId !== null ? "Update" : t("settingsPage.tags.buttons.save")}
            </button>
          </div>

          <div className="mt-3">
            <button
              onClick={() => setShowInfoTip(!showInfoTip)}
              className="flex items-center gap-2 text-sm text-greentheme hover:underline"
            >
              <Info className="w-4 h-4" />
              <span>{showInfoTip ? "Hide tip" : "Show tip"}</span>
            </button>

            {showInfoTip && (
              <div className="flex items-center gap-2 mt-2 p-3 bg-softgreentheme text-greentheme rounded-md">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  You can edit a tag by clicking on it, and save to return to adding new ones
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-3 dark:text-textdarktheme">Your Tags</h3>

          {tags.length === 0 ? (
            <div className="text-center py-6 bg-softgreytheme dark:bg-darkthemeitems rounded-lg">
              <p className="text-greytheme dark:text-textdarktheme">No tags added yet</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={`flex items-center rounded-lg px-3 py-2 transition-colors ${
                    editTagId === tag.id
                      ? "bg-softgreentheme text-greentheme border border-greentheme"
                      : "dark:bg-bgdarktheme2 dark:text-textdarktheme bg-softgreytheme text-greytheme hover:bg-opacity-80"
                  }`}
                >
                  <span className="text-sm cursor-pointer mr-2" onClick={() => handleEditTag(tag.id)}>
                    {tag.name}
                  </span>

                  <button
                    onClick={() => handleToDropTag(tag.id)}
                    className="flex items-center justify-center w-4 h-4 rounded-full bg-softwhitetheme bg-opacity-40 hover:bg-opacity-80 transition-colors"
                    aria-label="Delete tag"
                  >
                    <X className="text-greytheme" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tags
