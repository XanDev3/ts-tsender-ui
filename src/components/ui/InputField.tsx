'use client';
import React from "react";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  type?: string;
  large?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function InputField({
  label,
  placeholder,
  value,
  type = "text",
  large = false,
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-zinc-500 mt-2">{label}</label>
      {large ? (
        <textarea
          className=" border border-zinc-300 placeholder:text-zinc-400 text-neutral-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[120px] lg:min-w-lg md:min-w-md sm:min-w-sm text-base"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          className="border border-zinc-300 placeholder:text-zinc-400 text-neutral-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:min-w-md md:min-w-md sm:min-w-sm text-base"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

