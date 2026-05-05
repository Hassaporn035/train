import { useId } from "react";

type InputProps = {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
};

export function InputField({
  label,
  type,
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
}: InputProps) {
  const uid = useId();
  const id = `${uid}-field`;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wide text-stone-500"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-200/80"
        suppressHydrationWarning
      />
    </div>
  );
}
