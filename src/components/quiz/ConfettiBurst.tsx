import React from "react";

// Deterministic spread (no runtime randomness): piece i lands at a fixed
// position/delay derived from its index, so renders are stable and testable.
const PIECE_COUNT = 16;
const COLORS = ["#1e3a8a", "#166534", "#b45309", "#93c5fd", "#4ade80", "#fbbf24"];

const ConfettiBurst: React.FC = () => (
  <div className="confetti-burst" aria-hidden="true">
    {Array.from({ length: PIECE_COUNT }, (_, index) => (
      <span
        key={index}
        className="confetti-piece"
        style={{
          left: `${(index * 61) % 100}%`,
          backgroundColor: COLORS[index % COLORS.length],
          animationDelay: `${(index % 8) * 70}ms`,
          transform: `rotate(${(index * 47) % 360}deg)`,
        }}
      />
    ))}
  </div>
);

export default ConfettiBurst;
