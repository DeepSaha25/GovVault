'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiShield, FiPercent, FiActivity, FiGrid } from 'react-icons/fi';
import gsap from 'gsap';
import * as THREE from 'three';

const features = [
  {
    icon: FiPercent,
    title: 'Quadratic Voting Engine',
    description: 'Ensure democratic outcomes. The voting cost scales quadratically (cost = votes²), protecting consensus against whale dominance.',
  },
  {
    icon: FiShield,
    title: 'Timelocked Treasury Executor',
    description: 'Successful grant proposals trigger auto-payouts protected by an on-chain timelock to ensure safety and prevent exploits.',
  },
  {
    icon: FiActivity,
    title: 'Milestone Tracking & State Machine',
    description: 'Proposal lifecycle states (Active ➔ Passed ➔ Executed/Failed) are fully verified on-chain via Soroban smart contracts.',
  },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      // Intro animations
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 }
      );

      gsap.fromTo(
        '.hero-desc',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.5 }
      );

      gsap.fromTo(
        '.hero-btns',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.7 }
      );

      gsap.fromTo(
        '.feat-title-section',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.9 }
      );

      gsap.fromTo(
        '.feat-card',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power4.out', stagger: 0.15, delay: 1.1 }
      );

      gsap.fromTo(
        '.infra-card',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: 1.4 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [mounted]);

  // Three.js 3D Background Particles Scene
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 22;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    // Particle Group
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    // Geometry of particles
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    // Distribute particles across a wide 3D space for a immersive background field
    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 8.0 + Math.random() * 6.5; // Spread out particle cloud

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 0.16,
      color: 0x8b5cf6, // Violet / Purple
      transparent: true,
      opacity: 0.6,
    });

    // Points object
    const points = new THREE.Points(geometry, material);
    particleGroup.add(points);

    // Draw connection lines between nearby particles to create decentralized consensus grid
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1, // Indigo
      transparent: true,
      opacity: 0.08,
      linewidth: 1,
    });

    const linePositions = [];
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const idxA = i * 3;
        const idxB = j * 3;
        const dist = Math.hypot(
          positions[idxA] - positions[idxB],
          positions[idxA + 1] - positions[idxB + 1],
          positions[idxA + 2] - positions[idxB + 2]
        );
        if (dist < 4.8) {
          linePositions.push(positions[idxA], positions[idxA + 1], positions[idxA + 2]);
          linePositions.push(positions[idxB], positions[idxB + 1], positions[idxB + 2]);
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    particleGroup.add(lines);

    // Interaction state
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.003;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.003;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth slow rotation
      particleGroup.rotation.y = elapsedTime * 0.04;
      particleGroup.rotation.x = elapsedTime * 0.02;

      // Mouse interactive parallax movement
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      
      camera.position.x = targetX * 10;
      camera.position.y = -targetY * 10;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      lineGeometry.dispose();
      material.dispose();
      lineMaterial.dispose();
    };
  }, [mounted]);

  return (
    <div ref={containerRef} className="relative bg-transparent overflow-x-hidden min-h-screen">
      {/* 3D fixed background canvas */}
      {mounted && (
        <canvas 
          ref={canvasRef} 
          className="fixed inset-0 w-screen h-screen pointer-events-none -z-10 bg-slate-50/20 dark:bg-surface-950/20"
        />
      )}

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center border-b border-slate-200/50 dark:border-surface-700/50 py-16 sm:py-24">
        {/* Background decorative gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-400/5 dark:bg-purple-900/5 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten" />
          <div className="absolute top-20 right-0 w-80 h-80 bg-emerald-400/5 dark:bg-emerald-900/5 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 w-full text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans opacity-0 leading-tight">
              Democratic Governance powered by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400">
                Quadratic Voting
              </span>
            </h1>

            <p className="hero-desc text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium opacity-0">
              Empower DAO members to propose, vote quadratically on funding allocations, and execute decentralized treasury grants trustlessly.
            </p>

            <div className="hero-btns flex justify-center gap-4 pt-4 opacity-0">
              <Link href="/dashboard" className="btn-primary h-12 px-6 flex items-center justify-center gap-2 uppercase tracking-wider text-xs font-semibold shadow-xl shadow-black/10 dark:shadow-white/5 hover:-translate-y-0.5 transition-transform">
                Enter voting portal <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/transfer" className="btn-secondary h-12 px-6 flex items-center justify-center gap-2 uppercase tracking-wider text-xs font-semibold hover:-translate-y-0.5 transition-transform bg-white/80 dark:bg-surface-800/80 backdrop-blur-md">
                Direct XLM Transfer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 z-10">
        <div className="feat-title-section text-center space-y-2 mb-12 opacity-0">
          <h2 className="text-2xl font-bold text-black dark:text-white sm:text-3xl font-sans">
            GovVault Core Protocol Pillars
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            State of the art DAO governance and treasury execution utilizing Soroban.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="feat-card card rounded border border-slate-200/60 dark:border-surface-700/60 bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm p-6 transition-all hover:border-black flex flex-col justify-between h-56 opacity-0 shadow-sm">
              <div>
                <feature.icon className="mb-4 h-6 w-6 text-black dark:text-white animate-pulse" />
                <h3 className="text-base font-bold text-black dark:text-white font-sans mb-2">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Task Checklist Tracker */}
      <section className="relative border-t border-slate-200/50 dark:border-surface-700/50 bg-slate-50/80 dark:bg-surface-850/80 backdrop-blur-sm z-10">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="infra-card rounded border border-slate-200/60 dark:border-surface-700/60 bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm p-8 shadow-sm opacity-0">
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2 font-sans">
                <FiGrid className="h-5 w-5 text-slate-400" />
                Core Governance Infrastructure Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-wallet connections, quadratic on-chain voting metrics, and secure execution flows.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 text-center">
              <div className="rounded border border-slate-200 dark:border-surface-700 p-4 bg-slate-50 dark:bg-surface-800">
                <div className="text-sm font-bold text-black dark:text-white">Wallet Integration</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 font-semibold">Freighter, xBull, and Albedo</div>
              </div>
              <div className="rounded border border-slate-200 dark:border-surface-700 p-4 bg-slate-50 dark:bg-surface-800">
                <div className="text-sm font-bold text-black dark:text-white">Voting Logic</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 font-semibold">On-chain Quadratic Cost Engine</div>
              </div>
              <div className="rounded border border-slate-200 dark:border-surface-700 p-4 bg-slate-50 dark:bg-surface-800">
                <div className="text-sm font-bold text-black dark:text-white">Treasury Control</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 font-semibold">Timelocked Release Mechanism</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
