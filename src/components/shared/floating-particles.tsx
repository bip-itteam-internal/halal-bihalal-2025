'use client'

import React, { useMemo } from 'react'

export function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 20 + 10}s`,
      delay: `${Math.random() * 10}s`,
      opacity: Math.random() * 0.3 + 0.1,
    }))
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
          }
          33% {
            transform: translateY(-50px) translateX(30px) scale(1.1);
          }
          66% {
            transform: translateY(-20px) translateX(-30px) scale(0.9);
          }
          100% {
            transform: translateY(0) translateX(0) scale(1);
          }
        }
        .particle {
          position: absolute;
          background: white;
          border-radius: 50%;
          filter: blur(1px);
          animation: float infinite ease-in-out;
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
            backgroundColor: Math.random() > 0.5 ? '#fbbf24' : 'white',
            boxShadow: `0 0 10px ${Math.random() > 0.5 ? '#fbbf24' : 'white'}`,
          }}
        />
      ))}
    </div>
  )
}
