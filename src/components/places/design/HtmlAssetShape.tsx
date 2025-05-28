import React from 'react';
import { DesignElement } from '../../../_root/pages/DesignPlaces';

interface HtmlAssetShapeProps {
  shapeProps: DesignElement;
}

const HtmlAssetShape: React.FC<HtmlAssetShapeProps> = ({ shapeProps }) => {
  const { src, x, y, width, height, rotation } = shapeProps;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x || 0}px`,
    top: `${y || 0}px`,
    width: `${width || 0}px`,
    height: `${height || 0}px`,
    transform: `rotate(${rotation || 0}deg)`,
    objectFit: 'contain', 
  };
  if (!src) {
    // Optionally, render a placeholder or nothing if src is not available
    return null; 
  }

  return (
    <img
      src={src}
      alt="Asset"
      style={style}
      draggable={false} // Prevent native browser drag
    />
  );
};

export default HtmlAssetShape;