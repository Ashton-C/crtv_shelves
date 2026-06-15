interface StepDotsProps {
  total: number;
  current: number;
}

export function StepDots({ total, current }: StepDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? 20 : 6,
            background: i + 1 === current ? "#FF5F00" : "#2E2D2D",
          }}
        />
      ))}
    </div>
  );
}
