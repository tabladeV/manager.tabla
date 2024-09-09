import React, { useRef, useEffect } from 'react';
import { Rect, Text, Transformer } from 'react-konva';

interface RectangleProps {
  shapeProps: any;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}

const Rectangle: React.FC<RectangleProps> = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <div className='shadow-lg'>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        fill='white'
        rounded={10}
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
          if (!node) return; // Ensure node is not null

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY), // Ensure a minimum size
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
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
    </div>
  );
};

export default Rectangle;
