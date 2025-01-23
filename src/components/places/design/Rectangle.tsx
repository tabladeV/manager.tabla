import React, { useRef, useEffect } from 'react';
import { Rect, Text, Transformer } from 'react-konva';
import Konva from 'konva';

interface RectangleProps {
  shapeProps: any;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}

const Rectangle: React.FC<RectangleProps> = ({ shapeProps, isSelected, onSelect, onChange }) => {
  // Explicitly define the types for shapeRef and trRef
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]); // Konva's nodes method expects an array
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <div className='shadow-lg'>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef} // Correctly typed as Konva.Rect
        fill={localStorage.getItem('darkMode') === 'true' ? '#88AB61':'#88AB61'  }
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
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
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
      {isSelected && (
        <Text
          x={shapeProps.x + 10}
          y={shapeProps.y - 20}
          text={shapeProps.name}
          fontSize={15}
          align="center"
          fill={localStorage.getItem('darkMode') === 'true' ? 'white':'black'  }
        />
      )}
    </div>
  );
};

export default Rectangle;
