import React from "react";

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none"></div>
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-xl w-full">
            <p className="text-lg mt-4">© {new Date().getFullYear()} MedRecord Chain. All rights reserved.</p>
          </div>
        </ul>
      </div>
    </div>
  );
};
