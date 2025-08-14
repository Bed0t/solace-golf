"use client";

import * as React from "react";

type SliderProps = {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className = "" }: SliderProps) {
  const current = value?.[0] ?? 0;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={current}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={`w-full accent-white ${className}`}
    />
  );
}


