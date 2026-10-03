import React, { useRef, useEffect, useState } from 'react';
import { Event, RadarNode } from '../../types';
import { GENRE_COLORS } from '../../services/mockData';
import { useLocation } from '../../context/LocationContext';
import { nativeBridge } from '../../services/bridge';

export interface RadarCanvasProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  maxRangeKm?: number;
}

export const RadarCanvas: React.FC<RadarCanvasProps> = ({
  events,
  onSelectEvent,
  maxRangeKm = 25,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { calculateDistanceKm, calculateBearingDeg } = useLocation();

  const [hoveredNode, setHoveredNode] = useState<RadarNode | null>(null);
  const radarNodesRef = useRef<RadarNode[]>([]);

  // Calculate radar nodes relative to user
  useEffect(() => {
    const nodes: RadarNode[] = events.map((event) => {
      const distanceKm = event.distanceKm ?? calculateDistanceKm(event.latitude, event.longitude);
      const bearingDeg = calculateBearingDeg(event.latitude, event.longitude);

      // Convert bearing & distance to normalized polar coordinates (-1 to 1)
      const rad = ((bearingDeg - 90) * Math.PI) / 180; // 0 deg is North (top)
      const normalizedDist = Math.min(1, Math.max(0.12, distanceKm / maxRangeKm));
      const x = Math.cos(rad) * normalizedDist;
      const y = Math.sin(rad) * normalizedDist;

      const genreName = event.genre?.name || 'Indie';
      const color = GENRE_COLORS[genreName]?.hex || '#b7ff00';

      return {
        id: event.eventId,
        eventId: event.eventId,
        name: event.name,
        genre: genreName,
        genreColor: color,
        venueName: event.venue?.name || '',
        distanceKm,
        bearingDeg,
        x,
        y,
        event,
      };
    });

    radarNodesRef.current = nodes;
  }, [events, calculateDistanceKm, calculateBearingDeg, maxRangeKm]);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let sweepAngle = 0;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const size = Math.min(containerRef.current.clientWidth, 600);
      canvas.width = size * window.devicePixelRatio;
      canvas.height = size * window.devicePixelRatio;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) * 0.88;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw radar background gradient
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      bgGrad.addColorStop(0, '#111113');
      bgGrad.addColorStop(0.7, '#0b0b0d');
      bgGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Range concentric rings
      const rings = [0.25, 0.5, 0.75, 1];
      ctx.lineWidth = 1 * window.devicePixelRatio;

      rings.forEach((r, idx) => {
        ctx.strokeStyle = idx === 3 ? 'rgba(183, 255, 0, 0.4)' : 'rgba(39, 39, 42, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
        ctx.stroke();

        // Distance label
        ctx.fillStyle = 'rgba(161, 161, 170, 0.5)';
        ctx.font = `${10 * window.devicePixelRatio}px 'Space Grotesk', monospace`;
        ctx.fillText(`${Math.round(maxRangeKm * r)} km`, centerX + 4, centerY - radius * r + 12 * window.devicePixelRatio);
      });

      // 3. Crosshair lines (North, South, East, West)
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.4)';
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // 4. Rotating sweep beam (Gradient sector)
      sweepAngle = (sweepAngle + 0.02) % (Math.PI * 2);
      const sweepArc = Math.PI / 4; // 45 degree trail

      const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      sweepGrad.addColorStop(0, 'rgba(183, 255, 0, 0.3)');
      sweepGrad.addColorStop(1, 'rgba(183, 255, 0, 0.02)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sweepAngle - sweepArc, sweepAngle, false);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Leading beam line
      ctx.strokeStyle = 'rgba(183, 255, 0, 0.8)';
      ctx.lineWidth = 1.5 * window.devicePixelRatio;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * radius, centerY + Math.sin(sweepAngle) * radius);
      ctx.stroke();
      ctx.restore();

      // 5. User Center Beacon
      const pulseScale = (Math.sin(Date.now() / 250) + 1) * 0.5;
      ctx.fillStyle = 'rgba(183, 255, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, (12 + pulseScale * 8) * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b7ff00';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5 * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();

      // 6. Draw Event Nodes
      radarNodesRef.current.forEach((node) => {
        const nodeX = centerX + node.x * radius;
        const nodeY = centerY + node.y * radius;
        const isHovered = hoveredNode?.id === node.id;

        // Glowing outer halo
        ctx.fillStyle = isHovered ? 'rgba(183, 255, 0, 0.5)' : `${node.genreColor}44`;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, (isHovered ? 16 : 10) * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();

        // Node center core
        ctx.fillStyle = isHovered ? '#b7ff00' : node.genreColor;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, (isHovered ? 6 : 4) * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();

        // Node Label
        ctx.fillStyle = '#fafafa';
        ctx.font = `bold ${10 * window.devicePixelRatio}px 'Inter', sans-serif`;
        ctx.fillText(node.name.length > 16 ? node.name.slice(0, 14) + '..' : node.name, nodeX + 8, nodeY + 4);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [hoveredNode, maxRangeKm]);

  // Click & Hover interactions
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.88;

    let hit: RadarNode | null = null;

    radarNodesRef.current.forEach((node) => {
      const nodeX = centerX + node.x * radius;
      const nodeY = centerY + node.y * radius;
      const dist = Math.hypot(clickX - nodeX, clickY - nodeY);

      if (dist < 28 * window.devicePixelRatio) {
        hit = node;
      }
    });

    if (e.type === 'mousemove') {
      setHoveredNode(hit);
      canvas.style.cursor = hit ? 'pointer' : 'default';
    } else if (e.type === 'click' && hit) {
      nativeBridge.hapticFeedback('medium');
      onSelectEvent((hit as RadarNode).event);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full flex items-center justify-center p-2 select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleCanvasInteraction}
        onClick={handleCanvasInteraction}
        className="rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#27272a]"
      />
    </div>
  );
};
