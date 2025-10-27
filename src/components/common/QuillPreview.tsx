import { memo, useMemo } from "react";

interface QuillPreviewProps {
  content: string
  className?: string
}

const QuillPreview = memo(({ content, className = "" }: QuillPreviewProps) => {
  const sanitizedContent = useMemo(()=> {
    let htmlContent = null;
    try {
      // Attempt to parse if it's a JSON string from a rich text editor
      const parsed = JSON.parse(content);
      htmlContent = parsed;
    } catch {
      // If parsing fails, assume it's already a valid HTML string
      htmlContent = content;
    }
    return htmlContent;
  }, [content])

  return (
    <div className={`quill-preview ql-editor ${className}`}>
      <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizedContent}} />
    </div>
  )
})

export default QuillPreview;