'use client';

import { Bold, Italic, Strikethrough, Code } from 'lucide-react';
import { EditorBubbleItem, useEditor } from 'novel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;

  const items = [
    {
      name: 'bold',
      isActive: (editor: ReturnType<typeof useEditor>['editor']) =>
        Boolean(editor?.isActive('bold')),
      command: (editor: ReturnType<typeof useEditor>['editor']) =>
        editor?.chain().focus().toggleBold().run(),
      icon: Bold,
    },
    {
      name: 'italic',
      isActive: (editor: ReturnType<typeof useEditor>['editor']) =>
        Boolean(editor?.isActive('italic')),
      command: (editor: ReturnType<typeof useEditor>['editor']) =>
        editor?.chain().focus().toggleItalic().run(),
      icon: Italic,
    },
    {
      name: 'strike',
      isActive: (editor: ReturnType<typeof useEditor>['editor']) =>
        Boolean(editor?.isActive('strike')),
      command: (editor: ReturnType<typeof useEditor>['editor']) =>
        editor?.chain().focus().toggleStrike().run(),
      icon: Strikethrough,
    },
    {
      name: 'code',
      isActive: (editor: ReturnType<typeof useEditor>['editor']) =>
        Boolean(editor?.isActive('code')),
      command: (editor: ReturnType<typeof useEditor>['editor']) =>
        editor?.chain().focus().toggleCode().run(),
      icon: Code,
    },
  ];

  return (
    <div className="flex">
      {items.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={(editor) => {
            item.command(editor);
          }}
          className="rounded-none border-none"
        >
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'h-8 w-8 rounded-none',
              item.isActive(editor) && 'bg-accent text-accent-foreground',
            )}
            title={`${item.name.charAt(0).toUpperCase() + item.name.slice(1)} (${item.name === 'bold' ? 'Cmd+B' : item.name === 'italic' ? 'Cmd+I' : ''})`}
          >
            <item.icon
              className={cn(
                'h-4 w-4',
                item.isActive(editor) && 'text-primary',
              )}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};

