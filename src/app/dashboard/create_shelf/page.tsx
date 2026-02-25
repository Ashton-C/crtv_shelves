"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import Confetti from "react-confetti";
import ShelfPreview from "./ShelfPreview";
import ShelfCustomizer from "./ShelfCustomizer";

const InputWrapper = ({
  children,
  isFilled,
  className,
}: {
  children: React.ReactNode;
  isFilled: boolean;
  className?: string;
}) => (
  <motion.div className={`relative ${className}`} whileFocus={{ scale: 1.05 }}>
    {children}
    <AnimatePresence>
      {isFilled && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute top-1/2 right-2 -translate-y-1/2"
        >
          <FaCheckCircle className="text-green-500" />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default function CreateShelfPage() {
  const [shelfName, setShelfName] = useState("");
  const [shelfType, setShelfType] = useState("TV");
  const [otherShelfType, setOtherShelfType] = useState("");
  const [listLength, setListLength] = useState(3);
  const [hideFromFriends, setHideFromFriends] = useState(false);
  const [listItems, setListItems] = useState(Array(3).fill(""));
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Color state
  const [backgroundColor, setBackgroundColor] = useState("#1f2937");
  const [textColor, setTextColor] = useState("#ffffff");
  const [iconColor, setIconColor] = useState("#ffffff");
  const [titleColor, setTitleColor] = useState("#ffffff");
  const [itemNumberColor, setItemNumberColor] = useState("#ffffff");
  const [itemTextColor, setItemTextColor] = useState("#ffffff");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  const handleListLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const length = parseInt(e.target.value, 10);
    setListLength(length);
    setListItems(Array(length).fill(""));
  };

  const handleListItemChange = (index: number, value: string) => {
    const newListItems = [...listItems];
    newListItems[index] = value;
    setListItems(newListItems);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setShowConfetti(true);
    setTimeout(() => {
      // Here you would typically handle form submission
      // For now, we'll just navigate back to the dashboard
      window.location.href = "/dashboard";
    }, 3000);
  };

  const shelfTypeOptions = [
    "TV",
    "Movies",
    "Musical Artists",
    "Actors",
    "Songs",
    "Albums",
    "Books",
    "Authors",
    "Other",
  ];

  return (
    <div className="from-5 sticky flex h-full min-h-screen w-full flex-col items-center justify-start rounded-xl bg-gradient-to-b to-gray-950 p-8 text-white">
      {showConfetti && (
        <Confetti width={windowSize.width} height={windowSize.height} />
      )}
      <div className="container flex flex-col items-center gap-8 text-xl text-black">
        <h1 className="hero-text text-3xl text-white">Create Shelf</h1>
        <div className="flex w-full max-w-7xl flex-col gap-8 md:flex-row">
          <div className="w-full md:w-1/2">
            <form className="flex flex-col gap-4">
              <div>
                <label htmlFor="shelfName" className="text-white">
                  Name of Shelf
                </label>
                <InputWrapper isFilled={!!shelfName}>
                  <input
                    id="shelfName"
                    type="text"
                    value={shelfName}
                    onChange={(e) => setShelfName(e.target.value)}
                    className="w-full rounded-md p-2 text-black"
                  />
                </InputWrapper>
              </div>
              <div>
                <label htmlFor="shelfType" className="text-white">
                  Type of Shelf
                </label>
                <InputWrapper isFilled={!!shelfType}>
                  <select
                    id="shelfType"
                    value={shelfType}
                    onChange={(e) => setShelfType(e.target.value)}
                    className="w-full rounded-md p-2 text-black"
                  >
                    {shelfTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </InputWrapper>
                {shelfType === "Other" && (
                  <InputWrapper isFilled={!!otherShelfType}>
                    <input
                      type="text"
                      placeholder="Please specify"
                      value={otherShelfType}
                      onChange={(e) => setOtherShelfType(e.target.value)}
                      className="mt-2 w-full rounded-md p-2 text-black"
                    />
                  </InputWrapper>
                )}
              </div>
              <div>
                <label htmlFor="listLength" className="text-white">
                  Length of list
                </label>
                <InputWrapper isFilled={true}>
                  <select
                    id="listLength"
                    value={listLength}
                    onChange={handleListLengthChange}
                    className="w-full rounded-md p-2 text-black"
                  >
                    {Array.from({ length: 97 }, (_, i) => i + 3).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </InputWrapper>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="hideFromFriends"
                  type="checkbox"
                  checked={hideFromFriends}
                  onChange={(e) => setHideFromFriends(e.target.checked)}
                  className="h-5 w-5 rounded-md"
                />
                <label htmlFor="hideFromFriends" className="text-white">
                  Hide from friends?
                </label>
              </div>
              <div className="flex flex-col gap-2">
                {listItems.map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <label className="text-white">{index + 1}.</label>
                    <InputWrapper isFilled={!!listItems[index]} className="w-full">
                      <input
                        type="text"
                        value={listItems[index]}
                        onChange={(e) =>
                          handleListItemChange(index, e.target.value)
                        }
                        className="w-full rounded-md p-2 text-black"
                      />
                    </InputWrapper>
                  </div>
                ))}
              </div>
              <Link
                className="border-all bg-5/80 rounded-xl p-4 text-center font-semibold text-white shadow-xl/30"
                href="/dashboard"
                id="create_shelf_button"
                onClick={handleSubmit}
              >
                Create Shelf
              </Link>
            </form>
          </div>
          <div className="w-full md:w-1/2">
            <ShelfCustomizer
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              textColor={textColor}
              setTextColor={setTextColor}
              iconColor={iconColor}
              setIconColor={setIconColor}
              titleColor={titleColor}
              setTitleColor={setTitleColor}
              itemNumberColor={itemNumberColor}
              setItemNumberColor={setItemNumberColor}
              itemTextColor={itemTextColor}
              setItemTextColor={setItemTextColor}
            />
            <ShelfPreview
              shelfName={shelfName}
              shelfType={shelfType === "Other" ? otherShelfType : shelfType}
              listItems={listItems}
              backgroundColor={backgroundColor}
              textColor={textColor}
              iconColor={iconColor}
              titleColor={titleColor}
              itemNumberColor={itemNumberColor}
              itemTextColor={itemTextColor}
            />
          </div>
        </div>
        <Link
          className="border-all bg-5/80 mt-4 rounded-xl p-4 font-semibold text-white shadow-xl/30"
          href="/dashboard"
          id="back_to_dash_button"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
