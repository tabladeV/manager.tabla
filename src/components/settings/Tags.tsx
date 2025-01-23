import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Tags = () => {
  const [tags, setTags] = useState([
    'Restaurant',
    'Terrace',
    'Bar',
    'Cafe',
    'Club',
    'Lounge',
    'Pub',
    'Rooftop',
    'Garden',
  ]);

  const dropTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const saveTag = () => {
    const tagInput = document.getElementById('tag') as HTMLInputElement;
    if (tagInput && tagInput.value.trim()) {
      setTags([...tags, tagInput.value.trim()]);
      tagInput.value = '';
    }
  };

  const {t}=useTranslation();

  return (
    <div className={`rounded-lg flex flex-col items-center p-6 w-full ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
      <div>
        <h2>{t('settingsPage.tags.title')}</h2>
      </div>
      <div className="flex gap-4">
        <div className="w-[40vw] lt-sm:w-full">
          <p className=" mb-2 ml-2">{t('settingsPage.tags.label')}</p>
          <input type="text" placeholder={t('settingsPage.tags.placeHolder')} id="tag" className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`} />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={` flex items-center  rounded-lg px-2 py-1 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2 text-white' : 'bg-softgreytheme text-greytheme'}`}>
                  {tag}
                  <div
                    onClick={() => dropTag(index)}
                    className="text-subblack ml-3 cursor-pointer bg-[#ffffff40] rounded-full p-1 hover:bg-[#ffffff80] hover:text-subblack"
                  >
                    <svg width="10" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M54.5657 50.1217C55.1558 50.7117 55.4872 51.5119 55.4872 52.3463C55.4872 53.1807 55.1558 53.9809 54.5657 54.5709C53.9757 55.1609 53.1755 55.4924 52.3411 55.4924C51.5068 55.4924 50.7065 55.1609 50.1165 54.5709L33.5 37.9492L16.8782 54.5657C16.2882 55.1557 15.488 55.4871 14.6536 55.4871C13.8193 55.4871 13.019 55.1557 12.429 54.5657C11.839 53.9757 11.5076 53.1755 11.5076 52.3411C11.5076 51.5067 11.839 50.7065 12.429 50.1165L29.0508 33.4999L12.4343 16.8782C11.8443 16.2882 11.5128 15.488 11.5128 14.6536C11.5128 13.8192 11.8443 13.019 12.4343 12.429C13.0243 11.839 13.8245 11.5075 14.6589 11.5075C15.4933 11.5075 16.2935 11.839 16.8835 12.429L33.5 29.0507L50.1218 12.4263C50.7118 11.8363 51.512 11.5049 52.3464 11.5049C53.1808 11.5049 53.981 11.8363 54.571 12.4263C55.161 13.0163 55.4924 13.8166 55.4924 14.651C55.4924 15.4853 55.161 16.2856 54.571 16.8756L37.9492 33.4999L54.5657 50.1217Z"
                        fill="#333333"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary mx-auto submit mt-4 lt-sm:w-full" onClick={saveTag}>
            {t('settingsPage.tags.buttons.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tags;
