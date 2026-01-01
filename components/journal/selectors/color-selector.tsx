'use client';

import { Check, ChevronDown } from 'lucide-react';
import { EditorBubbleItem, useEditor } from 'novel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const colors = [
  { name: 'Default', color: undefined, displayColor: 'var(--foreground)' },
  { name: 'Purple', color: '#9333EA', displayColor: '#9333EA' },
  { name: 'Red', color: '#E00000', displayColor: '#E00000' },
  { name: 'Yellow', color: '#EAB308', displayColor: '#EAB308' },
  { name: 'Blue', color: '#2563EB', displayColor: '#2563EB' },
  { name: 'Green', color: '#008A00', displayColor: '#008A00' },
  { name: 'Orange', color: '#FFA500', displayColor: '#FFA500' },
  { name: 'Pink', color: '#BA4081', displayColor: '#BA4081' },
  { name: 'Gray', color: '#A8A29E', displayColor: '#A8A29E' },
];

interface ColorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColorSelector = ({ open, onOpenChange }: ColorSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;

  const activeColor = colors.find((color) => {
    if (color.name === 'Default') {
      return !editor.isActive('textStyle') || editor.getAttributes('textStyle').color === undefined;
    }
    return editor.getAttributes('textStyle').color === color.color;
  });

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-none border-none"
        >
          <span
            className="rounded-sm px-1"
            style={{
              color: activeColor?.displayColor || 'var(--foreground)',
            }}
          >
            A
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-1">
        {colors.map((color) => (
          <EditorBubbleItem
            key={color.name}
            onSelect={(editor) => {
              if (color.name === 'Default') {
                editor.chain().focus().unsetColor().run();
              } else {
                editor
                  .chain()
                  .focus()
                  .setColor(color.color || '')
                  .run();
              }
              onOpenChange(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <div
                className="rounded-sm border px-1"
                style={{
                  color: color.displayColor,
                }}
              >
                A
              </div>
              <span>{color.name}</span>
            </div>
            {activeColor?.name === color.name && <Check className="h-4 w-4" />}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};

