import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDarkContext } from '../../context/DarkContext';
// @ts-ignore
import ImageResize from 'quill-image-resize';

const Image = Quill.import('formats/image');
const ATTRIBUTES = ['height', 'width'];

class ImageWithAttributes extends Image {
  static formats(domNode: HTMLElement) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, super.formats(domNode));
  }

  format(name: string, value: string) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(ImageWithAttributes, true);
Quill.register('modules/imageResize', ImageResize);

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  modules?: object;
}

const InlineQuillEditor = forwardRef(({ value, onChange, placeholder, modules: customModules }: QuillEditorProps, ref) => {
  const { darkMode } = useDarkContext();
  const quillInstanceRef = useRef<ReactQuill>(null);

  useImperativeHandle(ref, () => ({
    getEditor: () => {
      return quillInstanceRef.current?.getEditor();
    },
  }));

  const defaultModules = {
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
  };

  const imageResizerModule = {
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: [ 'Resize', 'DisplaySize', 'Toolbar' ]
    }
  };

  const modules = customModules ? {...customModules, ...imageResizerModule} : {...defaultModules, ...imageResizerModule};

  const formats = [
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'header', 'font', 'size',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background',
    'width', 'height' // Whitelist width and height attributes
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