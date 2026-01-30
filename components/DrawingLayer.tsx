
import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Annotation } from '../types';

interface Props {
  isTechnician: boolean;
  onAnnotationCreated?: (ann: Annotation) => void;
}

export const DrawingLayer: React.FC<Props> = ({ isTechnician, onAnnotationCreated }) => {
  const { annotations, addAnnotation } = useAppStore();
  const containerRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isTechnician) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newAnn: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'pointer',
      x,
      y,
      color: '#3b82f6'
    };

    addAnnotation(newAnn);
    if (onAnnotationCreated) onAnnotationCreated(newAnn);
  };

  return (
    <div className="absolute inset-0 pointer-events-auto z-50 overflow-hidden cursor-crosshair">
      <svg
        ref={containerRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {annotations.map((ann) => (
          <g key={ann.id}>
            <circle cx={ann.x} cy={ann.y} r="1.5" fill={ann.color} opacity="0.6">
              <animate attributeName="r" values="1.5;3;1.5" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx={ann.x} cy={ann.y} r="0.5" fill={ann.color} />
          </g>
        ))}
      </svg>
    </div>
  );
};
