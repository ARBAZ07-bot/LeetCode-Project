function Logo({ size = "text-4xl" }) {
  return (
    <span className={`font-extrabold tracking-tight ${size} text-indigo-600 [text-shadow:1px_1px_0_#3730a3,2px_2px_0_#3730a3,3px_3px_0_#3730a3,4px_4px_0_#3730a3,6px_7px_10px_rgba(0,0,0,0.35)]`}>
      CodeArena
    </span>
  );
}

export default Logo;