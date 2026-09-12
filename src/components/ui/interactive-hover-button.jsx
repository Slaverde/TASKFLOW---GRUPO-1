import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const InteractiveHoverButton = React.forwardRef(({ text = "Button", icon, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-36 cursor-pointer overflow-hidden rounded-full border border-accent/40 bg-transparent p-2 text-center text-sm font-semibold text-primary transition-all duration-300",
        className,
      )}
      {...props}
    >
      {/* Texto inicial */}
      <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {text}
      </span>

      {/* Texto + icono que aparece al hacer hover */}
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
        <span>{text}</span>
        {icon ?? <ArrowRight size={16} />}
      </div>

      {/* Fondo que se expande desde el centro */}
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent transition-all duration-300 ease-out group-hover:scale-[15]" />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
