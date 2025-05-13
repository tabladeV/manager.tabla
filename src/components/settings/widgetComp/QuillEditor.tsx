import { useEffect, useRef, useState } from "react"

interface QuillEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  modules?: Record<string, any>
}


const QuillEditor = ({
    value,
    onChange,
    placeholder = "Write something...",
    className = "",
    readOnly = false,
    modules = {},
    ...props
  }: QuillEditorProps) => {
    const [isMounted, setIsMounted] = useState(false)
    const [quill, setQuill] = useState<any>(null)
    const editorRef = useRef<HTMLDivElement>(null)
    const toolbarRef = useRef<HTMLDivElement>(null)
  
    // Initialize Quill on the client side only
    useEffect(() => {
      if (typeof window !== "undefined") {
        // Dynamically import Quill
        import("quill").then((Quill) => {
          if (!quill && editorRef.current && toolbarRef.current) {
            const editor = new Quill.default(editorRef.current, {
              modules: {
                toolbar: toolbarRef.current,
                ...modules,
              },
              placeholder,
              readOnly,
              theme: "snow",
            })
  
            // Set initial content
            if (value) {
              editor.clipboard.dangerouslyPasteHTML(value)
            }
  
            // Handle content changes
            editor.on("text-change", () => {
              const html = editorRef.current?.querySelector(".ql-editor")?.innerHTML
              if (html) {
                onChange(html)
              }
            })
  
            setQuill(editor)
          }
        })
      }
      setIsMounted(true)
    }, [])
  
    // Update content when value prop changes
    useEffect(() => {
      if (quill && value !== quill.root.innerHTML) {
        quill.clipboard.dangerouslyPasteHTML(value)
      }
    }, [quill, value])
  
    // Import Quill styles on the client side
    useEffect(() => {
      if (typeof window !== "undefined") {
        import("quill/dist/quill.snow.css")
      }
    }, [])
  
    if (!isMounted) {
      return null
    }
  
    return (
      <div className={`quill-editor ${className}`} {...props}>
        <div ref={toolbarRef}>
          <span className="ql-formats">
            <select className="ql-font"></select>
            <select className="ql-size"></select>
          </span>
          <span className="ql-formats">
            <button className="ql-bold"></button>
            <button className="ql-italic"></button>
            <button className="ql-underline"></button>
            <button className="ql-strike"></button>
          </span>
          <span className="ql-formats">
            <select className="ql-color"></select>
            <select className="ql-background"></select>
          </span>
          <span className="ql-formats">
            <button className="ql-script" value="sub"></button>
            <button className="ql-script" value="super"></button>
          </span>
          <span className="ql-formats">
            <button className="ql-header" value="1"></button>
            <button className="ql-header" value="2"></button>
            <button className="ql-blockquote"></button>
            <button className="ql-code-block"></button>
          </span>
          <span className="ql-formats">
            <button className="ql-list" value="ordered"></button>
            <button className="ql-list" value="bullet"></button>
            <button className="ql-indent" value="-1"></button>
            <button className="ql-indent" value="+1"></button>
          </span>
          <span className="ql-formats">
            <button className="ql-direction" value="rtl"></button>
            <select className="ql-align"></select>
          </span>
          <span className="ql-formats">
            <button className="ql-link"></button>
            <button className="ql-image"></button>
            <button className="ql-video"></button>
          </span>
          <span className="ql-formats">
            <button className="ql-clean"></button>
          </span>
        </div>
        <div ref={editorRef} className="max-h-[300px] min-h-[200px] overflow-y-scroll border" />
      </div>
  )
}

export default QuillEditor
