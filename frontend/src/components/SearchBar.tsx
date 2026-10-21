"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({ value, onChange, onSubmit, autoFocus }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="w-full"
    >
      <div className="relative flex w-full items-center">
        <input
          type="text"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search"
          className="h-14 w-full rounded-[18px] border border-white bg-transparent pr-14 pb-3.5 pl-3.5 pt-4 font-serif text-[18px] leading-7 tracking-[0.025em] uppercase text-white outline-none placeholder:text-white/50"
        />
        <button
          type="submit"
          title="Submit"
          aria-label="Submit search"
          className="absolute right-3.5 flex h-9 w-9 items-center justify-center"
        >
          <Search size={15} strokeWidth={2} />
        </button>
      </div>
    </form>
  );
}
