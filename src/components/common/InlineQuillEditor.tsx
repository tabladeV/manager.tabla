import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDarkContext } from '../../context/DarkContext';
// @ts-ignore
import ImageResize from 'quill-image-resize';

// Allow inline styles for alignment, size, and font
const AlignStyle = Quill.import('attributors/style/align');
const SizeStyle = Quill.import('attributors/style/size');
const FontStyle = Quill.import('attributors/style/font');
Quill.register(AlignStyle, true);
Quill.register(SizeStyle, true);
Quill.register(FontStyle, true);
Quill.register('modules/imageResize', ImageResize);

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const InlineQuillEditor = forwardRef(({ value, onChange, placeholder }: QuillEditorProps, ref) => {
  const { darkMode } = useDarkContext();
  const quillInstanceRef = useRef<ReactQuill>(null);

  // Expose the getEditor method to the parent component via the ref
  useImperativeHandle(ref, () => ({
    getEditor: () => {
      return quillInstanceRef.current?.getEditor();
    },
  }));

const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: [ 
        'Resize', 
        'DisplaySize',
        'Toolbar'
       ]
    }
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'header', 'font', 'size',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background'
  ];

  return (
    <div className={darkMode ? 'dark-quill' : ''}>
      <ReactQuill
        ref={quillInstanceRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
});

export default InlineQuillEditor;