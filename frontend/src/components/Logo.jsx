function Logo({ size = "text-4xl" }) {
  return (
    <span className={`font-extrabold tracking-tight ${size} text-violet-600 [text-shadow:1px_1px_0_#4c1d95,2px_2px_0_#4c1d95,3px_3px_0_#4c1d95,4px_4px_0_#4c1d95,6px_7px_10px_rgba(0,0,0,0.35)]`}>
      CodeArena
    </span>
  );
}

export default Logo;