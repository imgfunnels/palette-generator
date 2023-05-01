import React from "react";

interface Props {
  focusedSwatch?: object;
  // any props that come into the component
}

const AdjustmentArea = ({ focusedSwatch }: Props) => {
  return (
    <aside
      id="adjustment-area"
      className="h-full border-l-4 border-stone-900 text-center w-[25%] py-12"
    >
      {JSON.stringify(focusedSwatch)}
    </aside>
  );
};

export default AdjustmentArea;
