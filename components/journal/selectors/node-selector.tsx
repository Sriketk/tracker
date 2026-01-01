'use client';

import { Check, ChevronDown } from 'lucide-react';
import { EditorBubbleItem, useEditor } from 'novel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SelectorItem {
  name: string;
  icon: React.ElementType;
  command: (editor: ReturnType<typeof useEditor>['editor']) => void;
  isActive: (editor: ReturnType<typeof useEditor>['editor']) => boolean;
}

const items: SelectorItem[] = [
  {
    name: 'Text',
    icon: () => (
      <div className="flex flex-col items-center">
        <div className="border-default-foreground/20 flex h-4 w-4 flex-col items-center border border-dashed text-xs" />
      </div>
    ),
    command: (editor) => editor?.chain().focus().clearNodes().run(),
    isActive: (editor) => {
      if (editor?.isActive('paragraph') && !editor?.isActive('listItem')) {
        return true;
      }
      return false;
    },
  },
  {
    name: 'Heading 1',
    icon: () => (
      <div className="flex flex-col items-center">
        <div className="border-default-foreground flex h-4 w-4 flex-col items-center border border-dashed text-xs font-bold" />
      </div>
    ),
    command: (editor) =>
      editor?.chain().focus().clearNodes().setNode('heading', { level: 1 }).run(),
    isActive: (editor) => Boolean(editor?.isActive('heading', { level: 1 })),
  },
  {
    name: 'Heading 2',
    icon: () => (
      <div className="flex flex-col items-center">
        <div className="border-default-foreground flex h-4 w-4 flex-col items-center border border-dashed text-xs font-semibold" />
      </div>
    ),
    command: (editor) =>
      editor?.chain().focus().clearNodes().setNode('heading', { level: 2 }).run(),
    isActive: (editor) => Boolean(editor?.isActive('heading', { level: 2 })),
  },
  {
    name: 'Heading 3',
    icon: () => (
      <div className="flex flex-col items-center">
        <div className="border-default-foreground flex h-4 w-4 flex-col items-center border border-dashed text-xs" />
      </div>
    ),
    command: (editor) =>
      editor?.chain().focus().clearNodes().setNode('heading', { level: 3 }).run(),
    isActive: (editor) => Boolean(editor?.isActive('heading', { level: 3 })),
  },
  {
    name: 'Bullet List',
    icon: () => (
      <div className="flex flex-col items-center">
        <div className="border-default-foreground flex h-4 w-4 flex-col items-center border border-dashed text-xs">
          <div className="bg-default-foreground h-1 w-1 rounded-full" />
        </div>
      </div>
    ),
    command: (editor) => editor?.chain().focus().toggleBulletList().run(),
    isActive: (editor) => Boolean(editor?.isActive('bulletList')),
  },
  {
    name: 'Numbered List',
    icon: () => (
      <div className="flex flex-col items-center">
        <div className="border-default-foreground flex h-4 w-4 flex-col items-center border border-dashed text-xs">
          <div className="bg-default-foreground h-1 w-1 rounded-full" />
        </div>
      </div>
    ),
    command: (editor) => editor?.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => Boolean(editor?.isActive('orderedList')),
  },
  {
    name: 'Quote',
    icon: () => (
      <div className="flex flex-col items-center">
        <div className="border-default-foreground flex h-4 w-4 flex-col items-center border border-dashed text-xs">
          <div className="bg-default-foreground h-1 w-1 rounded-full" />
        </div>
      </div>
    ),
    command: (editor) =>
      editor?.chain()
        .focus()
        .clearNodes()
        .toggleBlockquote()
        .run(),
    isActive: (editor) => Boolean(editor?.isActive('blockquote')),
  },
  {
    name: 'Code',
    icon: () => (
      <div className="flex flex-col items-center">
        <div className="border-default-foreground flex h-4 w-4 flex-col items-center border border-dashed text-xs">
          <div className="bg-default-foreground h-1 w-1 rounded-full" />
        </div>
      </div>
    ),
    command: (editor) => editor?.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => Boolean(editor?.isActive('codeBlock')),
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;

  const activeItem = items.find((item) => item.isActive(editor));

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-none border-none"
        >
          <span className="whitespace-nowrap text-sm">
            {activeItem?.name || 'Paragraph'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-1">
        {items.map((item) => (
          <EditorBubbleItem
            key={item.name}
            onSelect={(editor) => {
              item.command(editor);
              onOpenChange(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <div className="flex h-4 w-4 items-center justify-center rounded border border-muted-foreground/20">
                <item.icon />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem?.name === item.name && (
              <Check className="h-4 w-4" />
            )}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};

