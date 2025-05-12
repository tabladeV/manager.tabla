import React, { useRef, useEffect } from 'react';
import { Transformer, Image } from 'react-konva';
import Konva from 'konva';
import { BaseKey } from '@refinedev/core';
import { DesignElement } from '../../../_root/pages/DesignPlaces';
import useImage from 'use-image';

interface AssetShapeProps {
  id: BaseKey | undefined;
  shapeProps: DesignElement;
  isSelected: boolean;
  onDragStartCallback: () => void;
  onDragEndCallback: () => void;
  onSelect: () => void;
  onChange: (newAttrs: DesignElement) => void;
}

const MIN_ASSET_SIZE = 20; // Minimum size for assets

const AssetShape: React.FC<AssetShapeProps> = ({
  id,
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  onDragStartCallback,
  onDragEndCallback,
}) => {
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [image] = useImage(shapeProps?.src || '', 'anonymous');
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Image
        image={image}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps} // Includes x, y, width, height, src, rotation
        draggable
        onDragStart={onDragStartCallback}
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
            width: Math.max(MIN_ASSET_SIZE, node.width() * scaleX),
            height: Math.max(MIN_ASSET_SIZE, node.height() * scaleY),
          });
        }}
        // To maintain aspect ratio during transform, you might add:
        // onTransform={(e) => {
        //   const node = shapeRef.current;
        //   if (!node) return;
        //   // Enforce aspect ratio if needed, or use transformer's keepRatio
        // }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            const scaleX = shapeRef.current?.getStage()?.scaleX() || 1;
            const scaleY = shapeRef.current?.getStage()?.scaleY() || 1;
            if (Math.abs(newBox.width) < MIN_ASSET_SIZE * scaleX || Math.abs(newBox.height) < MIN_ASSET_SIZE * scaleY) {
              return oldBox;
            }
            return newBox;
          }}
          // keepRatio={true} // Uncomment if you want to maintain aspect ratio
        />
      )}
    </>
  );
};

export default AssetShape;
