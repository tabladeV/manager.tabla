import React, { useRef, useEffect } from 'react';
import { Circle, Text, Transformer } from 'react-konva';
import Konva from 'konva';

interface CircleShapeProps {
  shapeProps: any;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}

const CircleShape: React.FC<CircleShapeProps> = ({ shapeProps, isSelected, onSelect, onChange }) => {
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
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef} // Correctly typed as Konva.Circle
        fill='white'
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
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
            radius: Math.max(5, node.radius() * Math.max(scaleX, scaleY)),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef} // Correctly typed as Konva.Transformer
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
      <Text
        x={shapeProps.x}
        y={shapeProps.y - 20}
        text={shapeProps.id}
        fontSize={15}
        align="center"
        fill="black"
      />
    </>
  );
};

export default CircleShape;
