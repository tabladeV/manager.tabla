import React, { useRef, useEffect } from 'react';
import { RegularPolygon, Transformer, Text } from 'react-konva';
import Konva from 'konva';
import { BaseKey } from '@refinedev/core';

interface RhombusProps {
  id: BaseKey | undefined;
  shapeProps: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    name?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onDragStartCallback: () => void;
  onDragEndCallback: () => void;
  onChange: (newAttrs: any) => void;
}

const MIN_SIZE = 50;

const Rhombus: React.FC<RhombusProps> = ({
  id,
  shapeProps,
  isSelected,
  onSelect,
  onDragStartCallback,
  onDragEndCallback,
  onChange,
}) => {
  const shapeRef = useRef<Konva.RegularPolygon>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const radius = Math.min(shapeProps.width, shapeProps.height) / Math.sqrt(2);

  const handleDragEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    onChange({
      ...shapeProps,
      x: node.x(),
      y: node.y(),
    });
    onDragEndCallback();
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newSize = Math.max(MIN_SIZE, radius * scaleX * Math.sqrt(2));

    onChange({
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      width: newSize,
      height: newSize,
    });
  };

  return (
    <>
      <RegularPolygon
        ref={shapeRef}
        x={shapeProps.x}
        y={shapeProps.y}
        sides={4}
        radius={radius}
        rotation={0}
        fill="#88AB61"
        stroke="grey"
        shadowBlur={2}
        strokeWidth={0.5}
        opacity={0.9}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onDragStartCallback}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />

      {shapeProps.name && (
        <Text
          x={shapeProps.x}
          y={shapeProps.y - radius - 20}
          text={shapeProps.name}
          fontSize={15}
          align="center"
          offsetX={shapeProps.name.length * 3.5}
          fill={localStorage.getItem('darkMode') === 'true' ? 'white' : 'black'}
          listening={false}
        />
      )}

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          flipEnabled={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            const scaleX = shapeRef.current?.getStage()?.scaleX() || 1;
            const scaleY = shapeRef.current?.getStage()?.scaleY() || 1;
            if (
              Math.abs(newBox.width) < MIN_SIZE * scaleX ||
              Math.abs(newBox.height) < MIN_SIZE * scaleY
            ) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default Rhombus;
