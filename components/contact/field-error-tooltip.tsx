export function FieldErrorTooltip({ message }: { message: string }) {
  return (
    <div className="relative mt-2 inline-block" role="alert">
      <span
        className="absolute -top-[5px] left-4 w-2.5 h-2.5 rotate-45 bg-red-600"
        aria-hidden="true"
      />
      <span className="relative block bg-red-600 text-white text-[0.84rem] font-bold px-3 py-1.5 rounded-[6px]">
        {message}
      </span>
    </div>
  )
} 