import React, { useEffect, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

type ShapeType = 'circle' | 'square' | 'rectangle';

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  tableNumber: number;
}

const Canvas: React.FC = () => {

    const [showTools, setShowTools] = useState(false);
    const [shapes, setShapes] = useState<Shape[]>(
        [
            {
                "id": "circle-1724365960078",
                "type": "circle",
                "x": 86,
                "y": 33,
                "tableNumber": 1
            },
            {
                "id": "rectangle-1724365961225",
                "type": "rectangle",
                "x": 746,
                "y": 9,
                "tableNumber": 3
            },
            {
                "id": "circle-1724365961773",
                "type": "circle",
                "x": 470,
                "y": 194,
                "tableNumber": 4
            },
            {
                "id": "square-1724365983447",
                "type": "square",
                "x": 361,
                "y": 10,
                "tableNumber": 4
            },
            {
                "id": "square-1724365989809",
                "type": "square",
                "x": 826,
                "y": 192,
                "tableNumber": 5
            },
            {
                "id": "square-1724365990934",
                "type": "square",
                "x": 193,
                "y": 191,
                "tableNumber": 6
            }
        ]
    );

  useEffect(() => {
    console.log(shapes);
    }, [shapes]);

  const handleDrag = (e: DraggableEvent, data: DraggableData, id: string) => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === id ? { ...shape, x: data.x, y: data.y } : shape
      )
    );
  };

const addShape = (type: ShapeType) => {
    const id = `${type}-${Date.now()}`;
    const tableNumber = shapes.length + 1;
    setShapes([...shapes, { id, type, x: 0, y: 0, tableNumber }]);
};

  const removeShape = (id: string) => {
    setShapes(shapes.filter(shape => shape.id !== id));
  };

//   for saving the layout
  const saveLayout = async () => {
    const response = await fetch('/api/save-layout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shapes),
    });
  
    if (response.ok) {
      console.log('Layout saved successfully!');
    } else {
      console.error('Failed to save layout.');
    }
  };

  const [showActions, setShowActions] = useState(false);

    const clearCanvas = () => {
        setShapes([]);
    };

  return (
    <div className=" p-4  w-full h-full mx-auto">
      {/* Toolbox */}
      <div className='flex justify-between'>
        <div className=" p-2 ">
            <button onClick={()=>{setShowTools(!showTools)}} className="text-lg bg-white mb-1 items-center text-greentheme font-[600] p-2 rounded-[10px] border border-transparent hover:border-softgreentheme duration-200 gap-3 flex">
                <div className='text-greentheme bg-softgreentheme w-[2em] h-[2em] rounded-[10px] items-center flex justify-center'>+</div>
                <p>Add Table</p>
                
            </button>
            {showTools && <div className='absolute z-30 rounded-[10px] flex-col gap-2 bg-white p-3'>
                <button
                onClick={() => addShape('circle')}
                className="btn flex w-full mb-2 items-center gap-2 "
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="6" cy="6" r="5.5" stroke="#88AB61"/>
                    </svg>
                    Circle Table
                </button>
                <button
                onClick={() => addShape('square')}
                className="btn flex w-full mb-2 items-center gap-2"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="11" height="11" stroke="#88AB61"/>
                    </svg>
                    Square Table
                </button>
                <button
                onClick={() => addShape('rectangle')}
                className="btn flex w-full items-center gap-2"
                >

                    <svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="18" height="11" stroke="#88AB61"/>
                    </svg>
                    Rectangle Table
                </button>
            </div>}
            
        </div>
        <div className="flex gap-2 p-4">
            <button onClick={saveLayout} className="btn-primary">Save Layout</button>
            <button onClick={clearCanvas} className="btn">Clear Canvas</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative h-[400px]  ">
        {shapes.map(({ id, type, x, y , tableNumber}) => (
          <Draggable
          key={id}
          position={{ x, y }}
          onDrag={(e, data) => handleDrag(e, data, id)}
        >
          <div className="justify-center flex">
            {/* Shape container */}
            <div
              className={`absolute left-0  flex items-center justify-center border cursor-grab ${getShapeStyle(
                type
              )}`}
              onMouseOver={()=> {setShowActions(true)}}
                
            >
                <div className='text-greentheme font-bold'>T-{tableNumber}</div>
                {showActions && <div
                onClick={() => removeShape(id)}
                className="fixed text-center left-[-40px] bg-softgreentheme p-2 rounded-[5px] cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.85409 1.25C3.85409 1.16712 3.88701 1.08763 3.94561 1.02903C4.00422 0.970424 4.08371 0.9375 4.16659 0.9375H5.83325C5.91613 0.9375 5.99562 0.970424 6.05422 1.02903C6.11283 1.08763 6.14575 1.16712 6.14575 1.25V1.5625H7.91659C7.99947 1.5625 8.07895 1.59542 8.13756 1.65403C8.19616 1.71263 8.22909 1.79212 8.22909 1.875C8.22909 1.95788 8.19616 2.03737 8.13756 2.09597C8.07895 2.15458 7.99947 2.1875 7.91659 2.1875H2.08325C2.00037 2.1875 1.92089 2.15458 1.86228 2.09597C1.80368 2.03737 1.77075 1.95788 1.77075 1.875C1.77075 1.79212 1.80368 1.71263 1.86228 1.65403C1.92089 1.59542 2.00037 1.5625 2.08325 1.5625H3.85409V1.25Z" fill="#88AB61"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.59989 3.31042C2.60553 3.25944 2.62978 3.21234 2.66799 3.17812C2.7062 3.14391 2.75569 3.125 2.80698 3.125H7.19281C7.2441 3.125 7.29359 3.14391 7.33179 3.17812C7.37 3.21234 7.39425 3.25944 7.39989 3.31042L7.48323 4.06083C7.63369 5.41375 7.63369 6.77917 7.48323 8.13208L7.47489 8.20583C7.44846 8.44539 7.34289 8.66929 7.17491 8.8421C7.00692 9.01492 6.7861 9.12679 6.54739 9.16C5.52073 9.30366 4.47906 9.30366 3.45239 9.16C3.21361 9.12687 2.9927 9.01504 2.82463 8.84222C2.65656 8.66939 2.55093 8.44545 2.52448 8.20583L2.51614 8.13208C2.36571 6.77931 2.36571 5.41403 2.51614 4.06125L2.59989 3.31042ZM4.47906 4.75C4.47906 4.66712 4.44614 4.58763 4.38753 4.52903C4.32893 4.47042 4.24944 4.4375 4.16656 4.4375C4.08368 4.4375 4.00419 4.47042 3.94559 4.52903C3.88698 4.58763 3.85406 4.66712 3.85406 4.75V7.66667C3.85406 7.74955 3.88698 7.82903 3.94559 7.88764C4.00419 7.94624 4.08368 7.97917 4.16656 7.97917C4.24944 7.97917 4.32893 7.94624 4.38753 7.88764C4.44614 7.82903 4.47906 7.74955 4.47906 7.66667V4.75ZM6.14573 4.75C6.14573 4.66712 6.1128 4.58763 6.0542 4.52903C5.99559 4.47042 5.91611 4.4375 5.83323 4.4375C5.75035 4.4375 5.67086 4.47042 5.61226 4.52903C5.55365 4.58763 5.52073 4.66712 5.52073 4.75V7.66667C5.52073 7.74955 5.55365 7.82903 5.61226 7.88764C5.67086 7.94624 5.75035 7.97917 5.83323 7.97917C5.91611 7.97917 5.99559 7.94624 6.0542 7.88764C6.1128 7.82903 6.14573 7.74955 6.14573 7.66667V4.75Z" fill="#88AB61"/>
                    </svg>

                </div>}
               
            </div>
        
            {/* Delete button */}
          </div>
        </Draggable>
        
        ))}
      </div>
      
    </div>
  );
};



const getShapeStyle = (type: ShapeType) => {
  switch (type) {
    case 'circle':
      return 'w-[100px] h-[100px] rounded-full bg-white shadow-[0px 10px 13px rgba(0,0,0,0.1)]';
    case 'square':
      return 'w-[100px] h-[100px] rounded-[10px] bg-white shadow-[0px 10px 13px rgba(0,0,0,0.1)]';
    case 'rectangle':
      return 'w-[200px] h-[100px] rounded-[10px] bg-white shadow-[0px 10px 13px rgba(0,0,0,0.1)]';
    default:
      return '';
  }
};

export default Canvas;
