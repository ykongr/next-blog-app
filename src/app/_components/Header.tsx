"use client";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const Header: React.FC = () => {
  return (
    <header>
      <div className="bg-slate-800 py-2">
        <div
          className={twMerge(
            "mx-4 max-w-2xl md:mx-auto",
            "flex items-center justify-between",
            "text-lg font-bold text-white"
          )}
        >
        <Link href="/">
          <div>
                <FontAwesomeIcon icon={faFish} className="mr-1" />
                Header
          </div>
        </Link>
        <Link href="/about">
                <div>About</div>
        </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;