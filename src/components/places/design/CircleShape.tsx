import React, { useRef, useEffect } from 'react';
import { Circle, Text, TextPath, Transformer } from 'react-konva';
import Konva from 'konva';
import { BaseKey } from '@refinedev/core';

interface CircleShapeProps {
  id: BaseKey | undefined;
  shapeProps: any;
  isSelected: boolean;
  onDragStartCallback: () => void;
  onDragEndCallback: () => void;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}

const MIN_SIZE = 50;
 
const CircleShape: React.FC<CircleShapeProps> = ({ id, shapeProps, isSelected, onSelect, onChange, onDragStartCallback, onDragEndCallback }) => {
  // Explicitly define the types for shapeRef and trRef
  const shapeRef = useRef<Konva.Circle>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]); // Konva's nodes method expects an array
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);


  return (
    <>
      <Circle
        id={id}
        onDragStart={onDragStartCallback}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef} // Correctly typed as Konva.Circle
        fill={localStorage.getItem('darkMode') === 'true' ? '#88AB61':'#88AB61'  }
        {...shapeProps}
        draggable
        shadowBlur={2}
        opacity={0.6}
        stroke={'grey'}
        strokeWidth={0.5}
        onDragEnd={(e) => {
            onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
            rotation: e.target.rotation(),
            });
            onDragEndCallback();
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: e.target.rotation(),
            width: Math.max(MIN_SIZE, node.width() * scaleX),
            height: Math.max(MIN_SIZE, node.height() * scaleY),
            radius: Math.max(MIN_SIZE, node.radius() * Math.max(scaleX, scaleY)),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef} // Correctly typed as Konva.Transformer
          flipEnabled={false}
          rotateEnabled={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            const scaleX = shapeRef.current?.getStage()?.scaleX() || 1;
            const scaleY = shapeRef.current?.getStage()?.scaleY() || 1;
            if (Math.abs(newBox.width) < MIN_SIZE * scaleX || Math.abs(newBox.height) < MIN_SIZE * scaleY) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
      {/* <Tag size={20} x={shapeProps.x - 10} y={shapeProps.y - 10} fill={localStorage.getItem('darkMode') === 'true' ? 'white':'black'  } /> */}
      <Text
        x={shapeProps.x -24}
        y={shapeProps.y-70}
        text={shapeProps.name}
        fontSize={15}
        align="center"
        listening={false}
        fill={localStorage.getItem('darkMode') === 'true' ? 'white':'black'  }
      />
    </>
  );
};

export default CircleShape;
