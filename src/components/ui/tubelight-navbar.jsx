"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function TubelightNavBar({
  items,
  activeId,
  onSelect,
  className,
}) {
  return (
    <div className={cn("flex items-center gap-0", className)}>
      <div className="flex items-center gap-0 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const isActive = activeId === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(isActive ? null : item.id)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "text-primary",
              )}
            >
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="tubelight-lamp"
                  className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary/80 rounded-t-full">
                    <div className="absolute w-8 h-4 bg-primary/20 rounded-full blur-md -top-1.5 -left-1" />
                    <div className="absolute w-5 h-4 bg-primary/20 rounded-full blur-md -top-0.5" />
                    <div className="absolute w-2.5 h-2.5 bg-primary/20 rounded-full blur-sm top-0 left-1.5" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
