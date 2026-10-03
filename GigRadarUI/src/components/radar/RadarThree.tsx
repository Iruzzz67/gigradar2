import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Event } from '../../types';
import { GENRE_COLORS } from '../../services/mockData';
import { useLocation } from '../../context/LocationContext';
import { nativeBridge } from '../../services/bridge';

export interface RadarThreeProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  maxRangeKm?: number;
}

export const RadarThree: React.FC<RadarThreeProps> = ({
  events,
  onSelectEvent,
  maxRangeKm = 25,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { calculateDistanceKm, calculateBearingDeg } = useLocation();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = Math.min(width, 500);

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 18, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xb7ff00, 2, 30);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // 3. Circular Grid Rings
    const ringRadii = [3, 6, 9, 12];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.03, r, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 3 ? 0xb7ff00 : 0x27272a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: idx === 3 ? 0.6 : 0.4,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    // 4. Center User Beacon
    const centerGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xb7ff00,
      emissive: 0xb7ff00,
      emissiveIntensity: 0.8,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    scene.add(centerMesh);

    // 5. Sweep Beam Sector (Rotator)
    const sweepGroup = new THREE.Group();
    const sweepGeo = new THREE.CircleGeometry(12, 32, 0, Math.PI / 3);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: 0xb7ff00,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const sweepMesh = new THREE.Mesh(sweepGeo, sweepMat);
    sweepMesh.rotation.x = Math.PI / 2;
    sweepGroup.add(sweepMesh);
    scene.add(sweepGroup);

    // 6. Interactive Event Nodes
    const nodeMeshes: THREE.Mesh[] = [];
    const eventMap = new Map<THREE.Mesh, Event>();

    events.forEach((event) => {
      const distanceKm = event.distanceKm ?? calculateDistanceKm(event.latitude, event.longitude);
      const bearingDeg = calculateBearingDeg(event.latitude, event.longitude);

      const rad = ((bearingDeg - 90) * Math.PI) / 180;
      const normalizedDist = Math.min(12, Math.max(2, (distanceKm / maxRangeKm) * 12));
      const x = Math.cos(rad) * normalizedDist;
      const z = Math.sin(rad) * normalizedDist;

      const genreName = event.genre?.name || 'Indie';
      const hexColor = GENRE_COLORS[genreName]?.hex || '#b7ff00';
      const colorInt = parseInt(hexColor.replace('#', '0x'));

      const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorInt,
        emissive: colorInt,
        emissiveIntensity: 0.6,
      });
      const nodeMesh = new THREE.Mesh(sphereGeo, sphereMat);
      nodeMesh.position.set(x, 0.4, z);

      scene.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
      eventMap.set(nodeMesh, event);
    });

    // 7. Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
      } else {
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const matchedEvent = eventMap.get(hitMesh);
        if (matchedEvent) {
          nativeBridge.hapticFeedback('medium');
          onSelectEvent(matchedEvent);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Rotate sweep arm
      sweepGroup.rotation.y += 0.025;

      // Gentle floating nodes
      const time = Date.now() * 0.003;
      nodeMeshes.forEach((mesh, i) => {
        mesh.position.y = 0.4 + Math.sin(time + i) * 0.15;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = Math.min(newWidth, 500);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 9. Cleanup & Dispose Resources (Section 55 rule!)
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [events, maxRangeKm, calculateDistanceKm, calculateBearingDeg, onSelectEvent]);

  return (
    <div className="relative w-full flex items-center justify-center select-none overflow-hidden rounded-3xl bg-[#111113]/40 border border-[#27272a] shadow-inner">
      <div ref={mountRef} className="w-full flex justify-center" />
      <div className="absolute top-3 left-4 text-[10px] font-mono uppercase tracking-widest text-[#b7ff00] bg-[#18181b]/80 px-2 py-1 rounded-md border border-[#b7ff00]/30">
        Three.js 3D WebGL Spatial Mode
      </div>
    </div>
  );
};
