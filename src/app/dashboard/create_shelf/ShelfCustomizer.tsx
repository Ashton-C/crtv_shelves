"use client";

import React from "react";

interface ShelfCustomizerProps {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  iconColor: string;
  setIconColor: (color: string) => void;
  titleColor: string;
  setTitleColor: (color: string) => void;
  itemNumberColor: string;
  setItemNumberColor: (color: string) => void;
  itemTextColor: string;
  setItemTextColor: (color: string) => void;
}

const ShelfCustomizer: React.FC<ShelfCustomizerProps> = ({
  backgroundColor,
  setBackgroundColor,
  textColor,
  setTextColor,
  iconColor,
  setIconColor,
  titleColor,
  setTitleColor,
  itemNumberColor,
  setItemNumberColor,
  itemTextColor,
  setItemTextColor,
}) => {
  return (
    <div className="w-full max-w-lg rounded-xl bg-gray-800 p-8 text-white mb-8">
      <h3 className="text-xl font-bold mb-4">Customize Shelf</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <label htmlFor="backgroundColor">Background</label>
          <input
            id="backgroundColor"
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="textColor">Text</label>
          <input
            id="textColor"
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="iconColor">Icon</label>
          <input
            id="iconColor"
            type="color"
            value={iconColor}
            onChange={(e) => setIconColor(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="titleColor">Title</label>
          <input
            id="titleColor"
            type="color"
            value={titleColor}
            onChange={(e) => setTitleColor(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="itemNumberColor">Item Number</label>
          <input
            id="itemNumberColor"
            type="color"
            value={itemNumberColor}
            onChange={(e) => setItemNumberColor(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="itemTextColor">Item Text</label>
          <input
            id="itemTextColor"
            type="color"
            value={itemTextColor}
            onChange={(e) => setItemTextColor(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ShelfCustomizer;
