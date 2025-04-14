const ProgressBar = ({ progress }) => {
  const showBee = progress === 100;

  return (
    <div className="mb-4 relative">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-semibold text-bee-black/80">
          Progress
        </span>
        <span className="text-sm font-semibold text-bee-black/80">
          {progress}%
        </span>
      </div>

      <div className="w-full bg-gray-200/50 rounded-full h-4 shadow-inner overflow-hidden relative">
        {/* Honeycomb background */}
        <div className="absolute inset-0 bg-honeycomb bg-[length:1rem_1rem] opacity-10 rounded-full z-0 animate-[stripes_4s_linear_infinite]" />

        {/* Gradient and highlight overlay */}
        <div
          className="relative h-full rounded-full transition-all duration-700 ease-in-out z-10"
          style={{ width: `${progress}%` }}
        >
          {/* Gradient fill */}
          <div className="absolute inset-0 bg-gradient-to-r from-honey-yellow-400 via-honey-yellow-500 to-honey-yellow-600 rounded-full z-10" />

          {/* Shine effect */}
          <div className="absolute inset-0 bg-[length:200%_100%] bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0)_100%)] animate-[shine_2s_infinite] rounded-full z-20" />
        </div>

        {/* Floating bee icon when complete */}
        {showBee && (
          <div className="absolute -right-3 -top-2 text-xl animate-bounce">
            🐝
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
