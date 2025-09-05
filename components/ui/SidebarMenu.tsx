import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";

export interface SidebarMenuItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children?: SidebarMenuItem[];
  active?: boolean;
  onClick?: () => void;
}

interface SidebarMenuProps {
  item: SidebarMenuItem;
  depth?: number;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ item, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasChildren = item.children && item.children.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modern sidebar menu design
  return (
    <div ref={ref} className={`w-full ${depth > 0 ? "pl-4" : ""}`}>
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${open ? "bg-primary-100 dark:bg-primary-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"} ${depth === 0 ? "font-semibold text-gray-700 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"}`}
        onClick={() => hasChildren ? setOpen((o) => !o) : undefined}
        style={{ userSelect: 'none' }}
      >
        {item.icon && <span className="text-xl shrink-0">{item.icon}</span>}
        {item.href ? (
          <Link href={item.href} className="flex-1 min-w-0 truncate" tabIndex={-1}>
            {item.label}
          </Link>
        ) : (
          <span className="flex-1 min-w-0 truncate">{item.label}</span>
        )}
        {hasChildren && (
          <span className={`ml-auto transition-transform duration-200 ${open ? "rotate-90" : "rotate-0"} text-gray-400 dark:text-gray-500`}>
            ▶
          </span>
        )}
      </div>
      {hasChildren && open && (
        <div className="ml-2 border-l border-gray-200 dark:border-gray-700 pl-2 mt-1">
          {item.children!.map((child, idx) => (
            <SidebarMenu key={child.label + idx} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
