"use client";
import { useEffect, useRef, useState } from "react";

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: { rectangle: Rectangle; annotation: string }[];
  setAnnotations: (
    annotations: { rectangle: Rectangle; annotation: string }[]
  ) => void;
  readOnly?: boolean;
  onInvalidAction?: () => void;
}

export default function AnnotationCanvas({
  imageUrl,
  annotations,
  setAnnotations,
  readOnly = false,
  onInvalidAction,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      annotations.forEach((ann) => {
        const { x, y, width, height } = ann.rectangle;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = "red";
        ctx.font = "14px Arial";
        ctx.fillText(ann.annotation, x, y - 5);
      });

      if (currentRect && isDrawing) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          currentRect.x,
          currentRect.y,
          currentRect.width,
          currentRect.height
        );
      }
    };
  }, [imageUrl, annotations, currentRect, isDrawing]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) {
      if (onInvalidAction) onInvalidAction();
      return;
    }
    const rect = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      width: 0,
      height: 0,
    };
    setCurrentRect(rect);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !isDrawing || !currentRect) return;
    const rect = {
      ...currentRect,
      width: e.nativeEvent.offsetX - currentRect.x,
      height: e.nativeEvent.offsetY - currentRect.y,
    };
    setCurrentRect(rect);
  };

  const handleMouseUp = () => {
    if (readOnly || !isDrawing || !currentRect) return;
    const annotation = prompt("Enter annotation:");
    if (annotation) {
      setAnnotations([...annotations, { rectangle: currentRect, annotation }]);
    }
    setCurrentRect(null);
    setIsDrawing(false);
  };

  return (
    <div className="w-full overflow-auto">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border rounded-lg"
      />
    </div>
  );
}
