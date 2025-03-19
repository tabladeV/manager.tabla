import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Stage, Layer } from 'react-konva';
import Rectangle from './Rectangle';
import CircleShape from './CircleShape';
import { useTranslation } from 'react-i18next';
import { BaseKey, BaseRecord, useList } from '@refinedev/core';
import { generateRandomNumber } from '../../../utils/helpers';
import Konva from 'konva';
import ZoomControls from '../ZoomControls';
import dataProvider from '@refinedev/simple-rest';
import axiosInstance from '../../../providers/axiosInstance';
import { off } from 'process';
import BaseBtn from '../../common/BaseBtn';
import { useDarkContext } from '../../../context/DarkContext';

const MAX_ZOOM = 0.9; // maximum scale allowed
const MIN_ZOOM = 0.4; // minimum scale allowed

interface Table extends BaseRecord {
  id: BaseKey | undefined;
  rotation: number;
  name: string;
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
  max: number;
  min: number;
  floor: BaseKey;
  reservations: BaseKey[];
}

interface CanvasTypes {
  focusedRoofId: BaseKey | undefined | null;
  tables: Table[];
  onSave: (table: Table[]) => void;
  isLoading: boolean;
}

const DesignCanvas: React.FC<CanvasTypes> = (props) => {
  const { darkMode } = useDarkContext();
  const [shapes, setShapes] = useState<Table[]>([]);
  const [selectedId, selectShape] = useState<BaseKey | null>(null);
  const [showTools, setShowTools] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAddShape, setLoadingAddShape] = useState(false);

  // Stage pan and zoom state
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [isShapeDragging, setIsShapeDragging] = useState(false);

  // Container measurements for responsive stage
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const stageHeight = 390;

  const { t } = useTranslation();

  // Update shapes when focusedRoofId changes
  useEffect(() => {
    if (props.focusedRoofId) {
      setShapes(props.tables);
      
      // Auto focus when tables are loaded
      if (props.tables.length > 0) {
        // Use setTimeout to ensure the stage is ready
        setTimeout(() => focusAll(), 100);
      }
    }
  }, [props.focusedRoofId, props.tables]);

  // Set container width on mount and window resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Memoize deselect callback to avoid inline recreations
  const checkDeselect = useCallback((e: any) => {
    if (e.target.name() === 'stage') {
      selectShape(null);
    }
  }, []);

  const { data: foundTables, isLoading: loadingCheckTableName, error, refetch } = useList<Table>({
    resource: "api/v1/bo/tables/",
    pagination: {
      mode: "off",
    },
    queryOptions:{
      enabled: false,
    },
    filters: [
      {
        field: "search",
        operator: "null",
        value: "",
      }
    ]
  });


  const deleteShape = useCallback(() => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    if (selectedId) {
      setShapes((prevShapes) =>
        prevShapes.filter((shape) => shape.id !== selectedId)
      );
      selectShape(null);
    }
  }, [selectedId]);

  // Save if window pathname changes
  useEffect(() => {
    if (
      window.location.pathname !== '/places/design' &&
      !props.isLoading &&
      props.tables !== shapes
    ) {
      if (confirm('Save before switching to another floor!')) {
        console.log('this line was causing issue with duplicate tables props.onSave(shapes as Table[])')
        // props.onSave(shapes as Table[]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.pathname]);

  // Extracted changing name component to memoize its internals
  const ChangingName = useCallback(
    ({ id }: { id: number }) => {
      const shape = shapes.find((s) => s.id === id);
      if (!shape) return null;
      return (
        <div>
          <form
            className="popup bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme rounded-[10px]"
            onSubmit={async (e) => {
              e.preventDefault();
              const newName = (e.target as any).elements[0].value;
              const newMax = (e.target as any).elements[1].value;
              const newMin = (e.target as any).elements[2].value;
              
              if(newName === shape.name){
                setShowEdit(false);
                return;
              }

              if (
                !!shapes.find(
                  (s) => s.name === newName && s.id !== id
                ) || await checkTableExists(newName)
              ) {
                alert('Table name already exists');
                return;
              }
              setShapes((prev) =>
                prev.map((s) =>
                  s.id === id ? { ...s, name: newName, max: newMax, min: newMin } : s
                )
              );
              setShowEdit(false);
            }}
          >
            <h1>Edit {shape.name}</h1>
            <p>Change Table Name</p>
            <input
              type="text"
              defaultValue={shape.name}
              className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme"
            />
            <p>Change maximum capacity</p>
            <input
              type="text"
              defaultValue={shape.max}
              className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme"
            />
            <p>Change minimum capacity</p>
            <input
              type="text"
              defaultValue={shape.min}
              className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme"
            />
            <button type="submit" className="btn-primary mt-2">
              Save
            </button>
          </form>
        </div>
      );
    },
    [shapes]
  );

  // Extracted changing name component to memoize its internals
  const AddTable = useCallback(
    () => {
      return (
        <div>
          <form
            className="popup bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme rounded-[10px]"
            onSubmit={async (e) => {
              e.preventDefault();
              const newName = (e.target as any).elements[0].value;
              const newMax = (e.target as any).elements[1].value;
              const newMin = (e.target as any).elements[2].value;

              if (!!shapes.find((s) => s.name === newName ) || await checkTableExists(newName)) {
                alert('Table name already exists');
                return;
              }
              addShape(showAdd === 'RECTANGLE'?'RECTANGLE':'CIRCLE', newName, newMax, newMin);
              setShowAdd(null);
            }}
          >
            <h1>Add <span className='capitalize'>{showAdd === 'RECTANGLE'?'Rectangle':'circle'}</span> Table</h1>
            <p>Table Name</p>
            <input
              type="text"
              className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme"
            />
            <p>Maximum capacity</p>
            <input
              type="text"
              defaultValue={6}
              className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme"
            />
            <p>Minimum capacity</p>
            <input
              type="text"
              defaultValue={1}
              className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme"
            />
            <button type="submit" className="btn-primary mt-2">
              Add
            </button>
          </form>
        </div>
      );
    },
    [shapes, showAdd]
  );

  const editShape = useCallback(() => {
    if (selectedId) {
      setShowEdit(true);
      setShowTools(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (selectedId) {
      setShowTools(false);
    }
  }, [selectedId]);

  const saveLayout = useCallback(() => {
    props.onSave(shapes as Table[]);
  }, [props, shapes]);

  const resetLayout = useCallback(() => {
    setShapes(props.tables);
  }, [props.tables]);

  // --- Zoom & Pan Logic ---
  const stageRef = useRef<any>(null);

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const scaleBy = 1.05;
    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.min(MAX_ZOOM, Math.max(newScale, MIN_ZOOM));

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    setStageScale(newScale);
    setStagePosition(newPos);
  }, [stageScale, stagePosition]);

  const lastDist = useRef<number | null>(null);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: any) => {
    if (e.evt.touches && e.evt.touches.length === 2) {
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const dist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastDist.current = dist;
      lastCenter.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: any) => {
    if (e.evt.touches && e.evt.touches.length === 2) {
      e.evt.preventDefault();
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const newDist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const newCenter = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
      if (!lastDist.current) {
        lastDist.current = newDist;
        return;
      }
      const scaleFactor = newDist / lastDist.current;
      const oldScale = stageScale;
      let newScale = oldScale * scaleFactor;
      newScale = Math.min(MAX_ZOOM, Math.max(newScale, MIN_ZOOM));
      const stage = stageRef.current;
      if (stage) {
        const pointer = newCenter;
        const mousePointTo = {
          x: (pointer.x - stagePosition.x) / oldScale,
          y: (pointer.y - stagePosition.y) / oldScale,
        };
        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        stage.scale({ x: newScale, y: newScale });
        stage.position(newPos);
        setStageScale(newScale);
        setStagePosition(newPos);
      }
      lastDist.current = newDist;
    }
  }, [stageScale, stagePosition]);

  const handleTouchEnd = useCallback((e: any) => {
    if (e.evt.touches.length < 2) {
      lastDist.current = null;
      lastCenter.current = null;
    }
  }, []);

  const zoomIn = useCallback(() => {
    const stage = stageRef.current;
    if (stage) {
      const oldScale = stageScale;
      const scaleBy = 1.2;
      let newScale = oldScale * scaleBy;
      newScale = Math.min(MAX_ZOOM, newScale);
      const stageCenter = { x: containerWidth / 2, y: stageHeight / 2 };
      const mousePointTo = {
        x: (stageCenter.x - stagePosition.x) / oldScale,
        y: (stageCenter.y - stagePosition.y) / oldScale,
      };
      const newPos = {
        x: stageCenter.x - mousePointTo.x * newScale,
        y: stageCenter.y - mousePointTo.y * newScale,
      };
      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      setStageScale(newScale);
      setStagePosition(newPos);
    }
  }, [stageScale, stagePosition, containerWidth]);

  const zoomOut = useCallback(() => {
    const stage = stageRef.current;
    if (stage) {
      const oldScale = stageScale;
      const scaleBy = 1.2;
      let newScale = oldScale / scaleBy;
      newScale = Math.max(newScale, MIN_ZOOM);
      const stageCenter = { x: containerWidth / 2, y: stageHeight / 2 };
      const mousePointTo = {
        x: (stageCenter.x - stagePosition.x) / oldScale,
        y: (stageCenter.y - stagePosition.y) / oldScale,
      };
      const newPos = {
        x: stageCenter.x - mousePointTo.x * newScale,
        y: stageCenter.y - mousePointTo.y * newScale,
      };
      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      setStageScale(newScale);
      setStagePosition(newPos);
    }
  }, [stageScale, stagePosition, containerWidth]);

  const focusAll = useCallback(() => {
    if (shapes.length === 0) return;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    shapes.forEach((shape) => {
      minX = Math.min(minX, shape.x);
      minY = Math.min(minY, shape.y);
      maxX = Math.max(maxX, shape.x + shape.width);
      maxY = Math.max(maxY, shape.y + shape.height);
    });
    const boundingBoxWidth = maxX - minX;
    const boundingBoxHeight = maxY - minY;
    const stage = stageRef.current;
    if (stage) {
      const margin = 20;
      const scaleX = containerWidth / (boundingBoxWidth + margin);
      const scaleY = stageHeight / (boundingBoxHeight + margin);
      const newScale = Math.min(scaleX, scaleY, 1);
      const boundingBoxCenter = {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
      };
      const newPos = {
        x: containerWidth / 2 - newScale * boundingBoxCenter.x,
        y: stageHeight / 2 - newScale * boundingBoxCenter.y,
      };
      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      setStageScale(newScale);
      setStagePosition(newPos);
    }
  }, [shapes, containerWidth]);


  
  const transitionToShape = useCallback((shape: Table) => {
    const stage = stageRef.current;
    if (stage) {
      // Center the new shape in the view
      const newPos = {
        x:
          containerWidth / 2 -
          (shape.x + shape.width / 2) * stageScale,
        y:
          stageHeight / 2 -
          (shape.y + shape.height / 2) * stageScale,
      };
      const tween = new Konva.Tween({
        node: stage,
        duration: 0.1,
        x: newPos.x,
        y: newPos.y,
      });
      tween.play();
      setStagePosition(newPos);
    }
  }, [containerWidth, stageHeight, stageScale]);

  // Memoize shapes rendering to avoid recalculations
  const renderedShapes = useMemo(
    () =>
      shapes.map((shape: BaseRecord, i) => {
        const commonProps = {
          id: shape.id,
          shapeProps: shape,
          isSelected: shape.id === selectedId,
          onSelect: () => selectShape(shape?.id || null),
          onChange: (newAttrs: any) => {
            setShapes((prevShapes) => {
              const newShapes = [...prevShapes];
              newShapes[i] = newAttrs;
              return newShapes;
            });
          },
          onDragStartCallback: () => setIsShapeDragging(true),
          onDragEndCallback: () => setIsShapeDragging(false),
        };
        if (shape.type === 'RECTANGLE') {
          return <Rectangle key={shape.id} {...commonProps} />;
        }
        if (shape.type === 'CIRCLE') {
          return <CircleShape key={shape.id} {...commonProps} />;
        }
        return null;
      }),
    [shapes, selectedId]
  );

  const checkTableExists = useCallback(async (tableName: string) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('api/v1/bo/tables/',{
        params: {
          search: tableName
        }
      })
      setLoading(false);
      return data.length > 0;
    } catch (error) {
      setLoading(false);
      console.error(error);
      return true;
    }
  }, []);


  const addShape = useCallback(
    async (type: 'RECTANGLE' | 'CIRCLE', name = '', max=null, min=null) => {
      setLoadingAddShape(true);
      let counter= null;
      let tableName = '';
      let existsInShapes= null;
      let tableExists= null;
      if(!name) {
        counter = shapes.length + 1;
        tableName = `Table ${counter}`;
        existsInShapes = !!shapes.find(s => s.name === tableName as string );
        tableExists = await checkTableExists(tableName as string) || existsInShapes;
        while (tableExists && counter < 10) {
          counter++;
          tableName = `Table ${counter}`;
          existsInShapes = !!shapes.find(s => s.name === tableName as string );
          tableExists = await checkTableExists(tableName as string) || existsInShapes;
        }
  
        if(tableExists){
          setShowAdd(type);
          setLoadingAddShape(false);
          return;
        } 
      }

      const OFFSET = 20; // Offset in pixels for new tables
      const newX = shapes.length > 0
        ? shapes[shapes.length - 1].x + OFFSET
        : 50;
      const newY = shapes.length > 0
        ? shapes[shapes.length - 1].y + OFFSET
        : 50;

      const newShape: Table = {
        id: generateRandomNumber(10),
        name: name || tableName,
        rotation: 0,
        type,
        width: 100,
        height: 100,
        x: newX,
        y: newY,
        max: max || Math.floor(innerWidth / 220),
        min: min || 1,
        floor: props.focusedRoofId!,
        reservations: [],
      };
      setShapes((prevShapes) => {
        // Trigger stage transition on the new shape
        // Use setTimeout to ensure state update has been scheduled
        setTimeout(() => transitionToShape(newShape), 0);

        return [...prevShapes, newShape];
      });
      setLoadingAddShape(false);
    },
    [props.focusedRoofId, transitionToShape, checkTableExists, shapes]
  );

  return (
    <>
      {showEdit && (
        <div>
          <div
            className="overlay opacity-15 z-[200] bg-white dark:bg-black"
            onClick={() => setShowEdit(false)}
          ></div>
          {selectedId && <ChangingName id={selectedId as number} />}
        </div>
      )}
      {showAdd && (
        <div>
          <div
            className="overlay opacity-15 z-[200] bg-white dark:bg-black"
            onClick={() => setShowAdd(null)}
          ></div>
          <AddTable />
        </div>
      )}
      <div className="flex justify-between gap-5 my-4">
        <div
          className="p-2 flex rounded-[10px] gap-2 bg-white dark:bg-bgdarktheme text-subblack dark:text-white"
        >
          <button
            onClick={() => {
              setShowTools((prev) => !prev);
              selectShape(null);
            }}
            disabled={loading}
            className="text-lg items-center py-2 text-greentheme font-[600] px-2 rounded-[10px] border border-transparent hover:border-softgreentheme duration-200 gap-3 flex"
          >
            <div className="text-greentheme bg-softgreentheme w-[2em] h-[2em] rounded-[10px] items-center flex justify-center">
              +
            </div>
            <p>
              {t('editPlace.buttons.addTable')}{' '}
              {showTools ? ' <' : ' >'}
            </p>
          </button>

          {/* Transition for the tools section */}
          <div
            className={`flex gap-2 transition-all duration-300 ${showTools ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-10px]'
              }`}
          >
            {showTools && (
              <>
                <BaseBtn variant='outlined'
                  className={`btn ${darkMode
                      ? 'text-white'
                      : ''
                    }`}
                  onClick={() => addShape('RECTANGLE')}
                  disabled={loading || loadingAddShape}
                  loading={loadingAddShape}
                >
                  
                  {t('editPlace.buttons.rectangleTable')}
                </BaseBtn>
                <BaseBtn variant='outlined'
                  className={`btn ${darkMode
                      ? 'text-white'
                      : ''
                    }`}
                  onClick={() => addShape('CIRCLE')}
                  disabled={loading || loadingAddShape}
                  loading={loadingAddShape}
                >
                  
                  {t('editPlace.buttons.circleTable')}
                </BaseBtn>
              </>
            )}
          </div>

          <div className="flex items-center">
            {selectedId && (
              <div className="flex">
                <button
                  onClick={deleteShape}
                  className="text-lg items-center py-2 text-redtheme font-[600] px-2 rounded-[10px] border border-transparent hover:border-softredtheme duration-200 gap-3 flex"
                  disabled={loading}
                >
                  <svg
                    className="text-redtheme p-2 bg-softredtheme rounded-[10px] items-center flex justify-center"
                    width="35"
                    height="35"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.85409 1.25C3.85409 1.16712 3.88701 1.08763 3.94561 1.02903C4.00422 0.970424 4.08371 0.9375 4.16659 0.9375H5.83325C5.91613 0.9375 5.99562 0.970424 6.05422 1.02903C6.11283 1.08763 6.14575 1.16712 6.14575 1.25V1.5625H7.91659C7.99947 1.5625 8.07895 1.59542 8.13756 1.65403C8.19616 1.71263 8.22909 1.79212 8.22909 1.875C8.22909 1.95788 8.19616 2.03737 8.13756 2.09597C8.07895 2.15458 7.99947 2.1875 7.91659 2.1875H2.08325C2.00037 2.1875 1.92089 2.15458 1.86228 2.09597C1.80368 2.03737 1.77075 1.95788 1.77075 1.875C1.77075 1.79212 1.80368 1.71263 1.86228 1.65403C1.92089 1.59542 2.00037 1.5625 2.08325 1.5625H3.85409V1.25Z"
                      fill="#FF4B4B"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2.59989 3.31042C2.60553 3.25944 2.62978 3.21234 2.66799 3.17812C2.7062 3.14391 2.75569 3.125 2.80698 3.125H7.19281C7.2441 3.125 7.29359 3.14391 7.33179 3.17812C7.37 3.21234 7.39425 3.25944 7.39989 3.31042L7.48323 4.06083C7.63369 5.41375 7.63369 6.77917 7.48323 8.13208L7.47489 8.20583C7.44846 8.44539 7.34289 8.66929 7.17491 8.8421C7.00692 9.01492 6.7861 9.12679 6.54739 9.16C5.52073 9.30366 4.47906 9.30366 3.45239 9.16C3.21361 9.12687 2.9927 9.01504 2.82463 8.84222C2.65656 8.66939 2.55093 8.44545 2.52448 8.20583L2.51614 8.13208C2.36571 6.77931 2.36571 5.41403 2.51614 4.06125L2.59989 3.31042ZM4.47906 4.75C4.47906 4.66712 4.44614 4.58763 4.38753 4.52903C4.32893 4.47042 4.24944 4.4375 4.16656 4.4375C4.08368 4.4375 4.00419 4.47042 3.94559 4.52903C3.88698 4.58763 3.85406 4.66712 3.85406 4.75V7.66667C3.85406 7.74955 3.88698 7.82903 3.94559 7.88764C4.00419 7.94624 4.08368 7.97917 4.16656 7.97917C4.24944 7.97917 4.32893 7.94624 4.38753 7.88764C4.44614 7.82903 4.47906 7.74955 4.47906 7.66667V4.75ZM6.14573 4.75C6.14573 4.66712 6.1128 4.58763 6.0542 4.52903C5.99559 4.47042 5.91611 4.4375 5.83323 4.4375C5.75035 4.4375 5.67086 4.47042 5.61226 4.52903C5.55365 4.58763 5.52073 4.66712 5.52073 4.75V7.66667C5.52073 7.74955 5.55365 7.82903 5.61226 7.88764C5.67086 7.94624 5.75035 7.97917 5.83323 7.97917C5.91611 7.97917 5.99559 7.94624 6.0542 7.88764C6.1128 7.82903 6.14573 7.74955 6.14573 7.66667V4.75Z"
                      fill="#FF4B4B"
                    />
                  </svg>
                  {t('editPlace.buttons.delete')}
                </button>
                <button
                  onClick={editShape}
                  className="text-lg items-center py-2 text-greentheme ml-3 font-[600] px-2 rounded-[10px] border border-transparent hover:border-softgreentheme duration-200 gap-3 flex"
                  disabled={loading}
                >
                  <svg
                    width="35"
                    height="35"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="19" height="19" rx="3" fill="#88AB61" fillOpacity="0.1" />
                    <path
                      d="M6.45833 11.5786L6 13.412L7.83333 12.9536L13.1436 7.64339C13.3154 7.47149 13.412 7.23837 13.412 6.9953C13.412 6.75224 13.3154 6.51912 13.1436 6.34722L13.0647 6.26839C12.8928 6.09654 12.6597 6 12.4167 6C12.1736 6 11.9405 6.09654 11.7686 6.26839L6.45833 11.5786Z"
                      stroke="#88AB61"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.45833 11.5786L6 13.412L7.83333 12.9536L12.4167 8.3703L11.0417 6.9953L6.45833 11.5786Z"
                      fill="#88AB61"
                    />
                    <path
                      d="M11.0417 6.9953L12.4167 8.3703M10.125 13.412H13.7917"
                      stroke="#88AB61"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t('editPlace.buttons.edit')}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 py-3">
          <button className="btn-primary" onClick={saveLayout}>
            {t('editPlace.buttons.save')}
          </button>
          <button className="btn-secondary" onClick={resetLayout}>
            {t('editPlace.buttons.reset')}
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="border-[1px] rounded-xl relative"
        style={{ width: '100%' }}
      >
        <ZoomControls
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFocusAll={focusAll}
        />
        <Stage
          name="stage"
          ref={stageRef}
          width={containerWidth}
          height={stageHeight}
          onMouseDown={checkDeselect}
          onWheel={handleWheel}
          onTouchStart={(e) => {
            checkDeselect(e);
            handleTouchStart(e);
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable={!isShapeDragging}
          position={stagePosition}
          scaleX={stageScale}
          scaleY={stageScale}
          onDragEnd={(e) => {
            if (e.target.name() === 'stage')
              setStagePosition({ x: e.target.x(), y: e.target.y() });
          }}
        >
          <Layer>{renderedShapes}</Layer>
        </Stage>
      </div>
    </>
  );
};

export default DesignCanvas;
