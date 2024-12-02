import React, { useEffect, useState } from 'react';
import { Stage, Layer, Text } from 'react-konva';
import Rectangle from './Rectangle';
import CircleShape from './CircleShape';
import { useTranslation } from 'react-i18next';

const initialShapes = [
    {
        "x": 248.99999999999994,
        "y": 69.99999999999999,
        "width": 217.00000000000003,
        "height": 99.99999999999986,
        "id": "T-01",
        "type": "rectangle"
    },
    {
        "x": 107,
        "y": 122,
        "radius": 50,
        "id": "T-02",
        "type": "circle"
    },
    {
        "id": "T3",
        "x": 45.99999999999997,
        "y": 219.99999999999997,
        "type": "rectangle",
        "width": 99.99999999999997,
        "height": 171.00000000000006
    },
    {
        "id": "T4",
        "x": 249.89485159562548,
        "y": 222.75538049542064,
        "type": "rectangle",
        "width": 99.99999999999991,
        "height": 100.00000000000031
    }

];

const DesignCanvas: React.FC = () => {
  const [shapes, setShapes] = useState(initialShapes);
  const [selectedId, selectShape] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    console.log(shapes)
  }, [shapes])

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const {t} = useTranslation(); 

  const addShape = (type: 'rectangle' | 'circle') => {
    const newShape = {
      id: `T${shapes.length + 1}`,
      x: 50,
      y: 50,
      type,
      ...(type === 'rectangle' ? { width: 100, height: 100 } : { radius: 50 }),
    };
    setShapes([...shapes, newShape]);
  };

  const deleteShape = () => {
    // prompt('Are you sure you want to delete this table?');
    if (!confirm('Are you sure you want to delete this table?') ) {
      return;
    }
    if (selectedId) {
      const newShapes = shapes.filter(shape => shape.id !== selectedId);
      setShapes(newShapes);
      selectShape(null); // Deselect after deletion
    }
  };

  const changingName = () => {
    return (
    <div>
      <div className='overlay'></div>
      <form className='popup'>
        <h1>Change Table Name</h1>
        <input type="text" placeholder='Table Name' />
        <button>Save</button>
      </form>
    </div>
    );
  }
  const editShape = () => {

    if(selectedId) {
      if( shapes.filter(shape => shape.id !== selectedId).length > 0){
        changingName();

        
      }
      }
    console.log('Edit Shape');
  }

  const saveLayout = () => {
    console.log(shapes);
    //we will send this to the server
  };
  const resetLayout = () => {
    setShapes(initialShapes);
    //we will send this to the server
  };

  return (
    <>
      <div className='flex justify-between gap-5 my-4'>
        <div className="p-2 flex bg-white rounded-[10px] gap-2">
          <button onClick={() => setShowTools(!showTools)} className="text-lg items-center py-2 text-greentheme font-[600] px-2 rounded-[10px] border border-transparent hover:border-softgreentheme duration-200 gap-3 flex">
            <div className='text-greentheme bg-softgreentheme w-[2em] h-[2em] rounded-[10px] items-center flex justify-center'>+</div>
            <p>{t('editPlace.buttons.addTable')} {showTools?  '   <':'   >'}</p>
          </button>

          {showTools && (
            <div className='flex gap-2'>
              <button className='btn' onClick={() => addShape('rectangle')}>{t('editPlace.buttons.rectangleTable')}</button>
              <button className='btn' onClick={() => addShape('circle')}>{t('editPlace.buttons.circleTable')}</button>
            </div>
          )}
          <div className="flex items-center">
            {selectedId && (
              <div className='flex'>
                {/* <button onClick={editShape} className="text-lg items-center py-2 text-greentheme font-[600] px-2 rounded-[10px] border border-transparent hover:border-softgreentheme duration-200 gap-3 flex">
                  <div className='text-greentheme bg-softgreentheme w-[2em] h-[2em] rounded-[10px] items-center flex justify-center'>-</div>
                  <p>Edit Table</p>
                </button> */}
                <button onClick={deleteShape} className="text-lg items-center py-2 text-redtheme font-[600] px-2 rounded-[10px] border border-transparent hover:border-softredtheme duration-200 gap-3 flex">
                <svg className='text-redtheme p-2 bg-softredtheme rounded-[10px] items-center flex justify-center' width="35" height="35" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.85409 1.25C3.85409 1.16712 3.88701 1.08763 3.94561 1.02903C4.00422 0.970424 4.08371 0.9375 4.16659 0.9375H5.83325C5.91613 0.9375 5.99562 0.970424 6.05422 1.02903C6.11283 1.08763 6.14575 1.16712 6.14575 1.25V1.5625H7.91659C7.99947 1.5625 8.07895 1.59542 8.13756 1.65403C8.19616 1.71263 8.22909 1.79212 8.22909 1.875C8.22909 1.95788 8.19616 2.03737 8.13756 2.09597C8.07895 2.15458 7.99947 2.1875 7.91659 2.1875H2.08325C2.00037 2.1875 1.92089 2.15458 1.86228 2.09597C1.80368 2.03737 1.77075 1.95788 1.77075 1.875C1.77075 1.79212 1.80368 1.71263 1.86228 1.65403C1.92089 1.59542 2.00037 1.5625 2.08325 1.5625H3.85409V1.25Z" fill="#FF4B4B"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.59989 3.31042C2.60553 3.25944 2.62978 3.21234 2.66799 3.17812C2.7062 3.14391 2.75569 3.125 2.80698 3.125H7.19281C7.2441 3.125 7.29359 3.14391 7.33179 3.17812C7.37 3.21234 7.39425 3.25944 7.39989 3.31042L7.48323 4.06083C7.63369 5.41375 7.63369 6.77917 7.48323 8.13208L7.47489 8.20583C7.44846 8.44539 7.34289 8.66929 7.17491 8.8421C7.00692 9.01492 6.7861 9.12679 6.54739 9.16C5.52073 9.30366 4.47906 9.30366 3.45239 9.16C3.21361 9.12687 2.9927 9.01504 2.82463 8.84222C2.65656 8.66939 2.55093 8.44545 2.52448 8.20583L2.51614 8.13208C2.36571 6.77931 2.36571 5.41403 2.51614 4.06125L2.59989 3.31042ZM4.47906 4.75C4.47906 4.66712 4.44614 4.58763 4.38753 4.52903C4.32893 4.47042 4.24944 4.4375 4.16656 4.4375C4.08368 4.4375 4.00419 4.47042 3.94559 4.52903C3.88698 4.58763 3.85406 4.66712 3.85406 4.75V7.66667C3.85406 7.74955 3.88698 7.82903 3.94559 7.88764C4.00419 7.94624 4.08368 7.97917 4.16656 7.97917C4.24944 7.97917 4.32893 7.94624 4.38753 7.88764C4.44614 7.82903 4.47906 7.74955 4.47906 7.66667V4.75ZM6.14573 4.75C6.14573 4.66712 6.1128 4.58763 6.0542 4.52903C5.99559 4.47042 5.91611 4.4375 5.83323 4.4375C5.75035 4.4375 5.67086 4.47042 5.61226 4.52903C5.55365 4.58763 5.52073 4.66712 5.52073 4.75V7.66667C5.52073 7.74955 5.55365 7.82903 5.61226 7.88764C5.67086 7.94624 5.75035 7.97917 5.83323 7.97917C5.91611 7.97917 5.99559 7.94624 6.0542 7.88764C6.1128 7.82903 6.14573 7.74955 6.14573 7.66667V4.75Z" fill="#FF4B4B"/>
                </svg>

                {t('editPlace.buttons.delete')}
                </button>
                <button onClick={editShape} className="text-lg items-center py-2 text-greentheme ml-3  font-[600] px-2 rounded-[10px] border border-transparent hover:border-softredtheme duration-200 gap-3 flex">
                  <svg width="35" height="35" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="19" height="19" rx="3" fill="#88AB61" fill-opacity="0.1"/>
                    <path d="M6.45833 11.5786L6 13.412L7.83333 12.9536L13.1436 7.64339C13.3154 7.47149 13.412 7.23837 13.412 6.9953C13.412 6.75224 13.3154 6.51912 13.1436 6.34722L13.0647 6.26839C12.8928 6.09654 12.6597 6 12.4167 6C12.1736 6 11.9405 6.09654 11.7686 6.26839L6.45833 11.5786Z" stroke="#88AB61" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6.45833 11.5786L6 13.412L7.83333 12.9536L12.4167 8.3703L11.0417 6.9953L6.45833 11.5786Z" fill="#88AB61"/>
                    <path d="M11.0417 6.9953L12.4167 8.3703M10.125 13.412H13.7917" stroke="#88AB61" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>

                  {t('editPlace.buttons.edit')}
                </button>

              </div>
            )}
          </div>
        </div>
        <div className='flex gap-2 py-3'>
          <button className='btn-primary ' onClick={saveLayout}>{t('editPlace.buttons.save')}</button>
          <button className='btn-secondary' onClick={resetLayout}>{t('editPlace.buttons.reset')}</button>
        </div>
      </div>

      <div className=''>
        <Stage
          width={window.innerWidth-window.innerWidth/5.5}
          height={390}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            
            {shapes.map((shape, i) => {
              if (shape.type === 'rectangle') {
                return (
                  <Rectangle
                    key={shape.id}
                    shapeProps={shape}
                    isSelected={shape.id === selectedId}
                    onSelect={() => selectShape(shape.id)}
                    onChange={(newAttrs) => {
                      const newShapes = shapes.slice();
                      newShapes[i] = newAttrs;
                      setShapes(newShapes);
                    }}
                  />
                );
              } else if (shape.type === 'circle') {
                return (
                  <CircleShape
                    key={shape.id}
                    shapeProps={shape}
                    isSelected={shape.id === selectedId}
                    onSelect={() => selectShape(shape.id)}
                    onChange={(newAttrs) => {
                      const newShapes = shapes.slice();
                      newShapes[i] = newAttrs;
                      setShapes(newShapes);
                    }}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    </>
  );
};

export default DesignCanvas;
