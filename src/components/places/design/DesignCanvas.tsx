import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle
} from 'react';
import { Stage, Layer, Transformer } from 'react-konva';
import Rectangle from './Rectangle';
import CircleShape from './CircleShape';
import { useTranslation } from 'react-i18next';
import { BaseKey, BaseRecord, useNotification } from '@refinedev/core'; // Removed unused hooks
import { generateRandomNumber } from '../../../utils/helpers';
import Konva from 'konva';
import ZoomControls from '../ZoomControls';
import axiosInstance from '../../../providers/axiosInstance';
import { useDarkContext } from '../../../context/DarkContext';
import ActionPopup from '../../popup/ActionPopup';
import { Table } from '../../../_root/pages/DesignPlaces'; // Keep Table type if used elsewhere

// Import new DesignElement type
import { DesignElement } from '../../../_root/pages/DesignPlaces';
import AssetShape from './AssetShape';

// Import new DesignToolbar component
import DesignToolbar from './DesignToolbar';
// Placeholder icons - replace with actual Lucid icons
import { Plus, Circle, Square, Diamond, DoorOpen, Leaf, Sprout, Waypoints, DraftingCompass, BrickWall, Martini, Cigarette, CigaretteOff } from 'lucide-react';

// Import SVG assets
import singleDoorSrc from '../../../assets/single-door.svg';
import doubleDoorSrc from '../../../assets/double-door.svg';
import plant1Src from '../../../assets/plant1.svg';
import plant2Src from '../../../assets/plant2.svg';
import plant3Src from '../../../assets/plant3.svg';
import plant4Src from '../../../assets/plant4.svg';
import staireSrc from '../../../assets/staire.svg';
import staire2Src from '../../../assets/staire2.svg';
import cigarette from '../../../assets/cigarette.svg';
import cigaretteOff2Src from '../../../assets/cigarette-off.svg';
import doorSrc from '../../../assets/door.svg';
import Rhombus from './Rhombus';

const MAX_ZOOM = 2; // maximum scale allowed
const MIN_ZOOM = 0.3; // minimum scale allowed

// Define distinct types for Tables and Props (Assets)
interface TableShape extends DesignElement {
  type: 'RECTANGLE' | 'CIRCLE' | 'RHOMBUS';
  name: string;
  max: number;
  min: number;
  blocked: boolean;
}

interface PropShape extends DesignElement {
  type: AssetType;
  src: string;
}

// Configuration for different asset types
export const ASSET_CONFIG = {
  SINGLE_DOOR: { src: singleDoorSrc, defaultWidth: 90, defaultHeight: 60, name: 'Single Door', icon: <DoorOpen size={24} /> },
  DOUBLE_DOOR: { src: doubleDoorSrc, defaultWidth: 180, defaultHeight: 60, name: 'Double Door', icon: <DoorOpen size={24} /> },
  DOOR: { src: doorSrc, defaultWidth: 60, defaultHeight: 100, name: 'Door', icon: <DoorOpen size={24} /> },
  CIGARETTE_ZONE: { src: cigarette, defaultWidth: 80, defaultHeight: 80, name: 'Cigarette zone', icon: <Cigarette size={24} /> },
  NOCIGARETTE_ZONE: { src: cigaretteOff2Src, defaultWidth: 80, defaultHeight: 80, name: 'No Cigarette zone', icon: <CigaretteOff size={24} /> },
  PLANT1: { src: plant1Src, defaultWidth: 80, defaultHeight: 80, name: 'Plant 1', icon: <Leaf size={24} /> },
  PLANT2: { src: plant2Src, defaultWidth: 80, defaultHeight: 90, name: 'Plant 2', icon: <Leaf size={24} /> },
  PLANT3: { src: plant3Src, defaultWidth: 80, defaultHeight: 80, name: 'Plant 3', icon: <Leaf size={24} /> },
  PLANT4: { src: plant4Src, defaultWidth: 80, defaultHeight: 120, name: 'Plant 4', icon: <Leaf size={24} /> },
  STAIRE: { src: staireSrc, defaultWidth: 150, defaultHeight: 150, name: 'Stairs Up', icon: <Waypoints size={24} /> }, // Changed Stairs to Waypoints
  STAIRE2: { src: staire2Src, defaultWidth: 200, defaultHeight: 160, name: 'Stairs Side', icon: <Waypoints size={24} /> }, // Changed Stairs to Waypoints
};

// Define AssetType based on ASSET_CONFIG keys
export type AssetType = keyof typeof ASSET_CONFIG;

interface CanvasTypes {
  focusedRoofId: BaseKey | undefined | null;
  tables: TableShape[]; // Changed from DesignElement[] to TableShape[]
  assets: PropShape[]; // Added separate assets prop
  onSave: (tables: TableShape[], assets: PropShape[]) => void; // Updated to accept separate arrays
  isLoading: boolean;
  newTables: (tables: TableShape[], assets: PropShape[]) => void; // Updated to notify parent with separate arrays
  floorName: string | undefined;
}

const DesignCanvas = (props: CanvasTypes) => {
  console.log({props});
  const { darkMode } = useDarkContext();
  // Separate state for tables and props
  const [tables, setTables] = useState<TableShape[]>([]);
  const [propsShapes, setPropsShapes] = useState<PropShape[]>([]);
  const [selectedId, selectShape] = useState<BaseKey | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState<'RECTANGLE' | 'CIRCLE' | 'RHOMBUS' | null>(null);
  // Removed unused loading states
  // const [loading, setLoading] = useState(false);
  // const [loadingAddShape, setLoadingAddShape] = useState(false);

  // Stage pan and zoom state
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [isShapeDragging, setIsShapeDragging] = useState(false);

  // Stage ref for accessing Konva stage methods and Transformer ref
  const stageRef = useRef<Konva.Stage | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  // Container measurements for responsive stage
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [action, setAction] = useState<"delete" | "cancel" | "update" | "create" | "confirm">('delete');
  const [showPopup, setShowPopup] = useState(false);
  

  const { t } = useTranslation();
  const { open } = useNotification();

  // Function to check if a table with the given name exists on the backend
  const checkTableExists = useCallback(async (tableName: string) => {
    try {
      // Removed setLoading as it's not used elsewhere in this function's scope
      const { data } = await axiosInstance.get('api/v1/bo/tables/', {
        params: {
          search: tableName
        }
      });
      return data.length > 0;
    } catch (error) {
      console.error(error);
      return true; // Assume exists on error to prevent duplicate names
    }
  }, [axiosInstance]);

  // Transition the stage view to center a specific shape (table or prop)
  const transitionToShape = useCallback((shape: DesignElement) => {
    const stage = stageRef.current;
    if (!stage) return;

    // Center the new shape in the view
    const shapeWidth = shape.width || (shape.type === 'CIRCLE' ? (shape.radius || 0) * 2 : 0);
    const shapeHeight = shape.height || (shape.type === 'CIRCLE' ? (shape.radius || 0) * 2 : 0);

    const newPos = {
      x:
        containerWidth / 2 -
        (shape.x + shapeWidth / 2) * stageScale,
      y:
        containerHeight / 2 -
        (shape.y + shapeHeight / 2) * stageScale,
    };
    const tween = new Konva.Tween({
      node: stage,
      duration: 0.1,
      x: newPos.x,
      y: newPos.y,
    });
    tween.play();
    setStagePosition(newPos);
  }, [containerWidth, containerHeight, stageScale]);

  // Add a new shape (table or asset) to the canvas
  const addShape = useCallback(
    async (
      type: 'RECTANGLE' | 'CIRCLE' | 'RHOMBUS' | AssetType,
      options?: { name?: string; max?: number; min?: number; blocked?: boolean }
    ) => {
      // Removed setLoadingAddShape
      let newShape: DesignElement | null = null;

      const OFFSET = 20; // Offset in pixels for new elements
      // Calculate initial position based on the last added shape of *any* type or a default
      const allShapes = [...tables, ...propsShapes];
      const lastShape = allShapes.length > 0 ? allShapes[allShapes.length - 1] : null;

      const newX = lastShape
        ? lastShape.x + OFFSET
        : 50;
      const newY = lastShape
        ? lastShape.y + OFFSET
        : 50;

      if (type === 'RECTANGLE' || type === 'CIRCLE' || type === 'RHOMBUS') {
        let counter = null;
        let elementName = options?.name || '';
        let existsInShapes = null;
        let elementExists = null;

        // If no name is provided, generate one
        if (!elementName) {
          // Count existing tables for name generation
          counter = tables.length + 1;
          elementName = `${type === 'RECTANGLE' ? 'Rectangle' : type === 'CIRCLE' ? 'Circle' : 'Rhombus'} ${counter}`;
          existsInShapes = !!tables.find(s => s.name === elementName);
          elementExists = await checkTableExists(elementName) || existsInShapes;
          while (elementExists && counter < 100) {
            counter++;
            elementName = `${type === 'RECTANGLE' ? 'Rectangle' : type === 'CIRCLE' ? 'Circle' : 'Rhombus'} ${counter}`;
            existsInShapes = !!tables.find(s => s.name === elementName);
            elementExists = await checkTableExists(elementName) || existsInShapes;
          }
          if (elementExists) {
            open?.({ type: "error", message: "Table name already exists" });
            setShowAdd(type);
            // Removed setLoadingAddShape
            return;
          }
        } else {
          // Check if user-provided name exists (only within tables and backend tables)
          existsInShapes = !!tables.find(s => s.name === elementName && s.type === type);
          elementExists = await checkTableExists(elementName) || existsInShapes;
          if (elementExists) {
            open?.({ type: "error", message: "Table name already exists" });
            // Removed setLoadingAddShape
            return;
          }
        }

        newShape = {
          id: generateRandomNumber(10),
          name: elementName,
          rotation: type === 'RHOMBUS' ? 45 : 0,
          type,
          width: 100,
          height: type === 'RECTANGLE' ? 100 : 50,
          radius: type === 'CIRCLE' ? 50 : undefined,
          x: newX,
          y: newY,
          max: options?.max || 6,
          min: options?.min || 1,
          floor: props.focusedRoofId!,
          reservations: [],
          blocked: options?.blocked || false,
        } as TableShape;
      } else if (Object.keys(ASSET_CONFIG).includes(type)) {
        const assetDetails = ASSET_CONFIG[type as AssetType];
        newShape = {
          id: generateRandomNumber(10),
          name: assetDetails.name || type,
          type: type,
          src: assetDetails.src,
          width: assetDetails.defaultWidth,
          height: assetDetails.defaultHeight,
          x: newX,
          y: newY,
          rotation: 0,
          floor: props.focusedRoofId!,
        } as PropShape;
      }

      if (newShape) {
        const finalNewShape = newShape;
        if (finalNewShape.type === 'RECTANGLE' || finalNewShape.type === 'CIRCLE' || finalNewShape.type === 'RHOMBUS') {
          setTables((prevTables) => {
            // Notify parent only on add/delete with separate arrays
            props.newTables([...prevTables, finalNewShape as TableShape], propsShapes);
            setTimeout(() => transitionToShape(finalNewShape), 0);
            return [...prevTables, finalNewShape as TableShape];
          });
        } else {
           setPropsShapes((prevProps) => {
             // Notify parent only on add/delete with separate arrays
            props.newTables(tables, [...prevProps, finalNewShape as PropShape]);
            setTimeout(() => transitionToShape(finalNewShape), 0);
            return [...prevProps, finalNewShape as PropShape];
          });
        }
      }
      // Removed setLoadingAddShape
    },
    [props.focusedRoofId, transitionToShape, checkTableExists, tables, propsShapes, open, props.newTables]
  );

  // Handle changes to a shape's attributes (position, size, rotation, etc.)
  const handleShapeChange = useCallback((updatedShape: DesignElement) => {
    const isTable = tables.some(table => table.id === updatedShape.id);

    if (isTable) {
      setTables(prevTables =>
        prevTables.map(s => (s.id === updatedShape.id ? updatedShape as TableShape : s))
      );
    } else {
      setPropsShapes(prevProps =>
        prevProps.map(s => (s.id === updatedShape.id ? updatedShape as PropShape : s))
      );
    }
    // Do NOT call props.newTables here to avoid excessive re-renders
  }, [tables, propsShapes]);

  // Memoize deselect callback
  const checkDeselect = useCallback((e: any) => {
    if (e.target === e.target.getStage() || e.target.getClassName() === 'Transformer') {
        selectShape(null);
    }
  }, []);

  // Function triggered by the delete button in the toolbar
  const deleteShape = useCallback(() => {
    setAction('delete');
    setShowPopup(true);
  }, []);

  // Function executed after confirming deletion in the popup
  const handleDelete = useCallback(() => {
    if (selectedId) {
      const isTable = tables.some(table => table.id === selectedId);

      if (isTable) {
        setTables((prevTables) => {
          // Notify parent only on add/delete with separate arrays
          props.newTables(prevTables.filter((table) => table.id !== selectedId), propsShapes);
          return prevTables.filter((table) => table.id !== selectedId);
        });
      } else {
        setPropsShapes((prevProps) => {
          // Notify parent only on add/delete with separate arrays
          props.newTables(tables, prevProps.filter((prop) => prop.id !== selectedId));
          return prevProps.filter((prop) => prop.id !== selectedId);
        });
      }
      selectShape(null);
    }
  }, [selectedId, tables, propsShapes, props.newTables]);

  // Function triggered by the edit button in the toolbar
  const editShape = useCallback(() => {
    if (selectedId) {
      const selectedTable = tables.find(s => s.id === selectedId);
      if (selectedTable) {
        setShowEdit(true);
      }
    }
  }, [selectedId, tables]);

  // Save the current layout (keep tables and props separate)
  const saveLayout = useCallback(() => {
    props.onSave(tables, propsShapes);
  }, [props, tables, propsShapes]);

  // Reset the layout to the initial state from props
  const resetLayout = useCallback(() => {
    setTables(props.tables || []);
    setPropsShapes(props.assets || []);
    // Notify parent after reset with separate arrays
    props.newTables(props.tables, props.assets);
  }, [props.tables, props.assets, props.newTables]);

  // Focus the stage view on all shapes (tables and props)
  const focusAll = useCallback(() => {
    const allShapes = [...tables, ...propsShapes];
    if (allShapes.length === 0) return;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    allShapes.forEach((shape) => {
      const shapeWidth = shape.width || (shape.type === 'CIRCLE' ? (shape.radius || 0) * 2 : 0);
      const shapeHeight = shape.height || (shape.type === 'CIRCLE' ? (shape.radius || 0) * 2 : 0);

      minX = Math.min(minX, shape.x);
      minY = Math.min(minY, shape.y);
      maxX = Math.max(maxX, shape.x + shapeWidth);
      maxY = Math.max(maxY, shape.y + shapeHeight);
    });
    const boundingBoxWidth = maxX - minX;
    const boundingBoxHeight = maxY - minY;
    const stage = stageRef.current;
    if (stage) {
      const margin = 20;
      const scaleX = containerWidth / (boundingBoxWidth + margin);
      const scaleY = containerHeight / (boundingBoxHeight + margin);
      const newScale = Math.min(scaleX, scaleY, 1);
      const boundingBoxCenter = {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
      };
      const newPos = {
        x: containerWidth / 2 - newScale * boundingBoxCenter.x,
        y: containerHeight / 2 - newScale * boundingBoxCenter.y,
      };
      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      setStageScale(newScale);
      setStagePosition(newPos);
    }
  }, [tables, propsShapes, containerWidth, containerHeight]);

  // --- Zoom & Pan Logic ---
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
      const stageCenter = { x: containerWidth / 2, y: containerHeight / 2 };
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
  }, [stageScale, stagePosition, containerWidth, containerHeight]);

  const zoomOut = useCallback(() => {
    const stage = stageRef.current;
    if (stage) {
      const oldScale = stageScale;
      const scaleBy = 1.2;
      let newScale = oldScale / scaleBy;
      newScale = Math.max(newScale, MIN_ZOOM);
      const stageCenter = { x: containerWidth / 2, y: containerHeight / 2 };
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
  }, [stageScale, stagePosition, containerWidth, containerHeight]);


  // Update shapes when focusedRoofId changes (initial load/reset)
  useEffect(() => {
    
    console.log('Updated tables and propsShapes:', props.focusedRoofId,{ tables, propsShapes });
    if (props.focusedRoofId) {
      setTables(props.tables || []);
      setPropsShapes(props.assets || []);
    }
  }, [props.focusedRoofId, props.tables, props.assets]);

  // // Deselect shape and focus on all shapes when focusedRoofId changes
  // useEffect(() => {
  //   selectShape(null);
  //   focusAll();
  // }, [props.focusedRoofId, focusAll]);

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Compare tables and assets separately
    const tablesEqual = JSON.stringify([...tables].sort((a, b) => (a.id as any) - (b.id as any))) === 
                        JSON.stringify([...props.tables].sort((a, b) => (a.id as any) - (b.id as any)));
    const assetsEqual = JSON.stringify([...propsShapes].sort((a, b) => (a.id as any) - (b.id as any))) === 
                        JSON.stringify([...props.assets].sort((a, b) => (a.id as any) - (b.id as any)));
    
    setHasUnsavedChanges(!(tablesEqual && assetsEqual));
  }, [tables, propsShapes, props.tables, props.assets]);


  // Removed unused list hook
  // const { data: foundTables, isLoading: loadingCheckTableName, error, refetch } = useList<DesignElement>({...});

  // Removed unused showTools state and effect
  // const [showTools, setShowTools] = useState(false);
  // useEffect(() => { if (selectedId) { setShowTools(false); } }, [selectedId]);

  // Removed unused navigation popup states and effects


  // Component for changing shape name and properties (used in edit popup)
  const ChangingName = useCallback(
    ({ id }: { id: BaseKey }) => {
      const shape = tables.find((s) => s.id === id);
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
              const blocked = (e.target as any).elements[3].checked;

              if (newName !== shape.name) {
                if (
                  !!tables.find(
                    (s) => s.name === newName && s.id !== id
                  ) || await checkTableExists(newName)
                ) {
                  open?.({ type: "error", message: "Warning, Table name already exists" });
                  return;
                }
              }

              setTables(prev =>
                prev.map(s =>
                  s.id === id ? { ...s, name: newName, max: parseInt(newMax, 10) || 0, min: parseInt(newMin, 10) || 0, blocked: blocked } as TableShape : s as TableShape
                )
              );
              setShowEdit(false);
            }}
          >
            <h1>Edit {shape.name}</h1>
            <p>Change Table Name</p>
            <input type="text" defaultValue={shape.name} className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme" />
            <p>Change maximum capacity</p>
            <input type="number" defaultValue={shape.max} className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme" />
            <p>Change minimum capacity</p>
            <input type="number" defaultValue={shape.min} className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme" />
            <label className="flex items-center my-1">
              <input type="checkbox" name="blocked" defaultChecked={shape.blocked} className="checkbox mr-2 form-checkbox h-4 w-4 text-green-600" />
              <span className="text-md">Blocked</span>
            </label>
            <button type="submit" className="btn-primary mt-2">Save</button>
          </form>
        </div>
      );
    },
    [tables, checkTableExists, open]
  );

  // Component for adding a new table
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
              const blocked = (e.target as any).elements[3].checked;

              if (!!tables.find((s) => s.name === newName) || await checkTableExists(newName)) {
                open?.({ type: "error", message: "Table name already exists" });
                return;
              }
              addShape(showAdd === 'RECTANGLE' ? 'RECTANGLE' : showAdd === 'CIRCLE' ? 'CIRCLE' : 'RHOMBUS', { name: newName, max: parseInt(newMax, 10) || 0, min: parseInt(newMin, 10) || 0, blocked: blocked });
              setShowAdd(null);
            }}
          >
            <h1>Add <span className='capitalize'>{showAdd === 'RECTANGLE' ? 'Rectangle' : showAdd === 'CIRCLE' ? 'circle' : 'rhombus'}</span> Table</h1>
            <p>Table Name</p>
            <input type="text" className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme" />
            <p>Maximum capacity</p>
            <input type="number" defaultValue={6} className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme" />
            <p>Minimum capacity</p>
            <input type="number" defaultValue={1} className="inputs-unique mt-2 bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme" />
            <label className="flex items-center my-1">
              <input type="checkbox" name="blocked" className="checkbox mr-2 form-checkbox h-4 w-4 text-green-600" />
              <span className="text-sm">Blocked</span>
            </label>
            <button type="submit" className="btn-primary mt-2">Add</button>
          </form>
        </div>
      );
    },
    [tables, showAdd, checkTableExists, open, addShape]
  );

  // Effect to attach/detach transformer
  useEffect(() => {
    if (!trRef.current || !stageRef.current) {
      return;
    }

    if (selectedId) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
      } else {
        trRef.current.nodes([]);
      }
    } else {
      trRef.current.nodes([]);
    }
    trRef.current.getLayer()?.batchDraw();
  }, [selectedId, tables, propsShapes]);

  // Memoize shapes rendering
  const renderedShapes = useMemo(
    () => {
      const allShapes = [...tables, ...propsShapes];
      return allShapes.map((shape: DesignElement) => {
        const commonProps = {
          id: shape.id,
          shapeProps: shape,
          isSelected: shape.id === selectedId,
          onSelect: () => selectShape(shape?.id || null),
          onChange: handleShapeChange,
          onDragStartCallback: () => setIsShapeDragging(true),
          onDragEndCallback: () => setIsShapeDragging(false),
        };
        if (shape.type === 'RECTANGLE') {
          return <Rectangle key={shape.id} {...commonProps} shapeProps={shape as TableShape} />;
        }
        if (shape.type === 'CIRCLE') {
          return <CircleShape key={shape.id} {...commonProps} shapeProps={shape as TableShape} />;
        }
        if (shape.type === 'RHOMBUS') {
          return <Rhombus key={shape.id} {...commonProps} shapeProps={shape as TableShape} />;
        }
        if (Object.keys(ASSET_CONFIG).includes(shape.type as AssetType)) {
          return <AssetShape key={shape.id} {...commonProps} shapeProps={{...shape,src: ASSET_CONFIG[shape.type as AssetType]?.src || 'ok why'}} />;
        }
        return null;
      });
    },
    [tables, propsShapes, selectedId, handleShapeChange]
  );

  // Set container width/height on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Define toolbar items
  const DESIGN_TOOLBAR_ITEMS = useMemo(() => [
    {
      id: 'add-table',
      label: 'Add Table',
      icon: <Plus size={24} />,
      onClick: () => console.log('Add Table parent clicked'),
      children: [
        { id: 'add-table-square', label: 'Add Rect Table', icon: <Square size={24} />, onClick: () => setShowAdd('RECTANGLE') },
        { id: 'add-table-circle', label: 'Add Circle Table', icon: <Circle size={24} />, onClick: () => setShowAdd('CIRCLE') },
        { id: 'add-table-rhombus', label: 'Add Rhombus Table', icon: <Diamond size={24} />, onClick: () => setShowAdd('RHOMBUS') },
      ]
    },
    {
      id: 'add-door',
      label: 'Add Door',
      icon: <DoorOpen size={24} />,
      onClick: () => console.log('Add Door parent clicked'),
      children: [
        { id: 'add-door-single', label: 'Add Single Door', icon: <DoorOpen size={24} />, onClick: () => addShape('SINGLE_DOOR') },
        { id: 'add-door-double', label: 'Add Double Door', icon: <div className='relative w-full h-full'><DoorOpen className='absolute top-[50%] translate-y-[-50%]' size={16} /><DoorOpen className='absolute top-[50%] translate-y-[-50%] scale-x-[-1] right-0' size={16} /></div>, onClick: () => addShape('DOUBLE_DOOR') },
        { id: 'add-3d-door', label: 'Add Door (3D)', icon: <div className='relative w-full h-full'><DoorOpen className='absolute top-[40%] translate-y-[-50%]' size={20} /><div className='absolute bottom-[-30%] right-[-30%] text-[12px]'>3D</div></div>, onClick: () => addShape('DOOR') },
      ]
    },
    {
      id: 'add-plant',
      label: 'Add Plant',
      icon: <Sprout size={24} />,
      onClick: () => console.log('Add Plant parent clicked'),
      children: [
        { id: 'add-plant1', label: 'Add Plant 1', icon: <div className='relative w-full h-full'><Sprout className='absolute top-[40%] translate-y-[-50%]' size={24} /><h5 className='absolute bottom-[-20%] right-[-10%]'>1</h5></div>, onClick: () => addShape('PLANT1') },
        { id: 'add-plant2', label: 'Add Plant 2', icon: <div className='relative w-full h-full'><Sprout className='absolute top-[40%] translate-y-[-50%]' size={24} /><h5 className='absolute bottom-[-20%] right-[-10%]'>2</h5></div>, onClick: () => addShape('PLANT2') },
        { id: 'add-plant3', label: 'Add Plant 3', icon: <div className='relative w-full h-full'><Sprout className='absolute top-[40%] translate-y-[-50%]' size={24} /><h5 className='absolute bottom-[-20%] right-[-10%]'>3</h5></div>, onClick: () => addShape('PLANT3') },
        { id: 'add-plant4', label: 'Add Plant 4', icon: <div className='relative w-full h-full'><Sprout className='absolute top-[40%] translate-y-[-50%]' size={24} /><h5 className='absolute bottom-[-20%] right-[-10%]'>4</h5></div>, onClick: () => addShape('PLANT4') },
      ]
    },
    {
      id: 'draw-wall-bar',
      label: 'Draw Wall/Bar',
      icon: <DraftingCompass size={24} />,
      onClick: () => console.log('Draw Wall/Bar parent clicked - leaving for later'),
      children: [
        { id: 'draw-wall', label: 'Draw Wall', icon: <BrickWall size={24} />, onClick: () => console.log('Draw Wall clicked - leaving for later') },
        { id: 'draw-bar', label: 'Draw bar', icon: <Martini size={24} />, onClick: () => console.log('Draw bar clicked - leaving for later') },
      ]
    },
    { id: 'add-smoking-zone', label: 'Add Smoking Zone', icon: <Cigarette size={24} />, onClick: () => addShape('CIGARETTE_ZONE') },
    { id: 'add-nosmoking-zone', label: 'Add No-Smoking Zone', icon: <CigaretteOff size={24} />, onClick: () => addShape('NOCIGARETTE_ZONE') },
    {
      id: 'add-stairs',
      label: 'Add Stairs',
      icon: <div className='relative w-full h-full'>
        <svg className="stroke-white fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M384 64c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96z" /></svg>
      </div>,
      onClick: () => console.log('Add Stairs parent clicked'),
      children: [
        { id: 'add-stairs1', label: 'Add Stairs 1', icon: <div className='relative w-full h-full'><svg className="absolute top-[40%] translate-y-[-50%] stroke-white fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M384 64c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96z" /></svg><h5 className='absolute bottom-[-20%] right-[-10%]'>1</h5></div>, onClick: () => addShape('STAIRE') },
        { id: 'add-stairs2', label: 'Add Stairs 2', icon: <div className='relative w-full h-full'><svg className="absolute top-[40%] translate-y-[-50%] stroke-white fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M384 64c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96z" /></svg><h5 className='absolute bottom-[-20%] right-[-10%]'>2</h5></div>, onClick: () => addShape('STAIRE2') },
      ]
    },
  ], [addShape, setShowAdd]);


  return (
    <>
      {/* Action Popup for delete confirmation */}
      <ActionPopup
        action={action}
        showPopup={showPopup}
        setShowPopup={(show) => setShowPopup(show)}
        message='Are you sure you want to delete this element?'
        actionFunction={handleDelete}
      />

      {/* Edit Shape Popup */}
      {showEdit && (
        <div>
          <div
            className="overlay opacity-15 z-[200] bg-white dark:bg-black"
            onClick={() => setShowEdit(false)}
          ></div>
          {selectedId && <ChangingName id={selectedId as BaseKey} />}
        </div>
      )}

      {/* Add Table Popup */}
      {showAdd && (
        <div>
          <div
            className="overlay opacity-15 z-[200] bg-white dark:bg-black"
            onClick={() => setShowAdd(null)}
          ></div>
          <AddTable />
        </div>
      )}

      {/* Main canvas container */}
      <div
        ref={containerRef}
        className="border-[1px] rounded-xl relative h-[calc(100vh-170px)]"
        style={{ width: '100%' }}
      >
        {/* Zoom controls */}
        <ZoomControls
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFocusAll={focusAll}
        />
        {/* Save and Reset buttons */}
        <div className="absolute bottom-2 right-2 flex gap-2 z-[2]">
          <button className="btn-primary" onClick={saveLayout}>{t('editPlace.buttons.save')}</button>
          <button className="btn-secondary" onClick={resetLayout}>{t('editPlace.buttons.reset')}</button>
        </div>
        {/* Design Toolbar */}
        <DesignToolbar
            items={DESIGN_TOOLBAR_ITEMS}
            showEditDelete={!!selectedId}
            onEdit={editShape}
            onDelete={deleteShape}
         />

        {/* Konva Stage */}
        <Stage
          name="stage"
          ref={stageRef}
          width={containerWidth}
          height={containerHeight}
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
          <Layer>
            {/* Render all shapes */}
            {renderedShapes}
            {/* Transformer for resizing/rotating selected shapes */}
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </>
  );
};

export default DesignCanvas;
