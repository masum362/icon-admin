import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MATERIAL_ICONS } from "./material-icons-list";
import * as MdIcons from "react-icons/md";

export const MaterialIconPicker = ({ value, onChange }: { value: string; onChange: (icon: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = search
    ? MATERIAL_ICONS.filter((icon) =>
        icon.label.toLowerCase().includes(search.toLowerCase()) ||
        icon.name.toLowerCase().includes(search.toLowerCase())
      )
    : MATERIAL_ICONS;
  const IconComponent = value && (MdIcons as any)[value];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="w-10 h-10">
          {IconComponent ? (
            React.createElement(IconComponent, { className: "w-5 h-5" })
          ) : (
            <span className="text-gray-400">?</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-80 max-h-[28rem] overflow-y-auto p-4">
        <input
          type="text"
          placeholder="Search icon..."
          className="mb-3 w-full border rounded px-2 py-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-6 gap-2">
          {filtered.map((icon) => {
            const Icon = (MdIcons as any)[icon.name];
            return (
              <button
                key={icon.name}
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded hover:bg-primary/10"
                title={icon.label}
                onClick={() => {
                  onChange(icon.name);
                  setOpen(false);
                }}
              >
                {Icon ? (
                  React.createElement(Icon, { className: "w-5 h-5" })
                ) : (
                  <span className="text-gray-400">?</span>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
