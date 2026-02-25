"use client";

import React from "react";
import {
  FaTv,
  FaFilm,
  FaMusic,
  FaUser,
  FaBook,
  FaPen,
  FaQuestion,
} from "react-icons/fa";

interface ShelfPreviewProps {
  shelfName: string;
  shelfType: string;
  listItems: string[];
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  titleColor: string;
  itemNumberColor: string;
  itemTextColor: string;
}

const ShelfPreview: React.FC<ShelfPreviewProps> = ({
  shelfName,
  shelfType,
  listItems,
  backgroundColor,
  textColor,
  iconColor,
  titleColor,
  itemNumberColor,
  itemTextColor,
}) => {
  const getShelfIcon = () => {
    const style = { color: iconColor };
    switch (shelfType) {
      case "TV":
        return <FaTv className="text-3xl" style={style} />;
      case "Movies":
        return <FaFilm className="text-3xl" style={style} />;
      case "Musical Artists":
        return <FaMusic className="text-3xl" style={style} />;
      case "Actors":
        return <FaUser className="text-3xl" style={style} />;
      case "Songs":
        return <FaMusic className="text-3xl" style={style} />;
      case "Albums":
        return <FaMusic className="text-3xl" style={style} />;
      case "Books":
        return <FaBook className="text-3xl" style={style} />;
      case "Authors":
        return <FaPen className="text-3xl" style={style} />;
      default:
        return <FaQuestion className="text-3xl" style={style} />;
    }
  };

  return (
    <div
      className="w-full max-w-lg rounded-xl p-8"
      style={{ backgroundColor: backgroundColor, color: textColor }}
    >
      <div className="flex items-center gap-4">
        {getShelfIcon()}
        <h2 className="text-2xl font-bold" style={{ color: titleColor }}>
          {shelfName || "My Shelf"}
        </h2>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {listItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="font-bold" style={{ color: itemNumberColor }}>
              {index + 1}.
            </span>
            <span style={{ color: itemTextColor }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShelfPreview;
