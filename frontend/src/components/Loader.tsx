"use client";

import { LineWave } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center justify-center">
        <LineWave
          visible={true}
          height="120"
          width="120"
          color="#ffffff"
          ariaLabel="line-wave-loading"
          wrapperStyle={{}}
        />
        <p className="mt-6 text-gray-500 text-sm font-bold uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loader;
