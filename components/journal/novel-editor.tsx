'use client';

import {
  EditorContent,
  EditorRoot,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorBubble,
  useEditor,
} from 'novel';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useMutation, useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  TiptapImage,
  TiptapLink,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
  Command,
  createSuggestionItems,
  renderItems,
  handleCommandNavigation,
  UploadImagesPlugin,
  createImageUpload,
  handleImageDrop,
  handleImagePaste,
  ImageResizer,
} from 'novel';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import AutoJoiner from 'tiptap-extension-auto-joiner';
import { cx } from 'class-variance-authority';
import type { JSONContent } from 'novel';
import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  TextQuote,
  Image as ImageIcon,
} from 'lucide-react';
import { NodeSelector } from './selectors/node-selector';
import { LinkSelector } from './selectors/link-selector';
import { TextButtons } from './selectors/text-buttons';
import { ColorSelector } from './selectors/color-selector';
import { toast } from 'sonner';

// Type for the TipTap editor instance (can be null)
type Editor = NonNullable<ReturnType<typeof useEditor>['editor']>;

// Validate image file
const validateImageFile = (file: File): boolean => {
  if (!file.type.includes('image/')) {
    toast.error('File type not supported.');
    return false;
  } else if (file.size / 1024 / 1024 > 20) {
    toast.error('File size too big (max 20MB).');
    return false;
  }
  return true;
};

// Configure extensions with Tailwind classes
const placeholder = Placeholder.configure({
  showOnlyWhenEditable: true,
  showOnlyCurrent: true,
  includeChildren: false,
});
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      'text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer',
    ),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx('opacity-40 rounded-lg border border-muted'),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  inline: false,
  HTMLAttributes: {
    class: cx('rounded-lg border border-muted cursor-pointer'),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx('not-prose pl-2'),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx('flex items-start gap-2'),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx('mt-4 mb-6 border-t border-muted-foreground'),
  },
});

const starterKit = StarterKit.configure({
  heading: {
    levels: [1, 2, 3],
  },
  bulletList: {
    HTMLAttributes: {
      class: cx('list-disc list-outside leading-3 -mt-2'),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx('list-decimal list-outside leading-3 -mt-2'),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx('leading-normal -mb-2'),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx('border-l-4 border-primary'),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx('rounded-sm bg-muted border p-5 font-mono font-medium'),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx('rounded-md bg-muted px-1.5 py-1 font-mono font-medium'),
      spellcheck: 'false',
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: '#DBEAFE',
    width: 4,
  },
  gapcursor: false,
});

// Type for suggestion command props (Novel uses internal types that don't export cleanly)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SuggestionCommandProps = { editor: any; range: any };

// Define slash command suggestions (without Image - that's added dynamically with upload function)
const baseSuggestionItems = [
  {
    title: 'Text',
    description: 'Just start typing with plain text.',
    searchTerms: ['p', 'paragraph'],
    icon: <Text size={18} />,
    command: ({ editor, range }: SuggestionCommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode('paragraph', 'paragraph')
        .run();
    },
  },
  {
    title: 'To-do List',
    description: 'Track tasks with a to-do list.',
    searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
    icon: <CheckSquare size={20} />,
    command: ({ editor, range }: SuggestionCommandProps) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Big section heading.',
    searchTerms: ['title', 'big', 'large'],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }: SuggestionCommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    searchTerms: ['subtitle', 'medium'],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }: SuggestionCommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    searchTerms: ['subtitle', 'small'],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }: SuggestionCommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list.',
    searchTerms: ['unordered', 'point'],
    icon: <List size={18} />,
    command: ({ editor, range }: SuggestionCommandProps) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering.',
    searchTerms: ['ordered'],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }: SuggestionCommandProps) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote.',
    searchTerms: ['blockquote'],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }: SuggestionCommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode('paragraph', 'paragraph')
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: 'Code',
    description: 'Capture a code snippet.',
    searchTerms: ['codeblock'],
    icon: <Code size={18} />,
    command: ({ editor, range }: SuggestionCommandProps) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
];

// Helper to create extensions with a specific slash command
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getExtensions = (editable: boolean, slashCommand: any) => {
  const baseExtensions = [
    starterKit,
    TextStyle,
    Color,
    placeholder,
    tiptapLink,
    tiptapImage,
    UpdatedImage,
    taskList,
    taskItem,
    horizontalRule,
    slashCommand,
  ];

  if (editable) {
    // Type assertion needed due to incompatibility between third-party extension types
    return [
      GlobalDragHandle.configure({
        dragHandleWidth: 20,
        scrollTreshold: 100,
      }),
      AutoJoiner.configure({
        elementsToJoin: ['bulletList', 'orderedList'],
      }),
      ...baseExtensions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any[];
  }

  return baseExtensions;
};

interface NovelEditorProps {
  initialContent?: JSONContent | null;
  onUpdate?: (content: JSONContent) => void;
  onSaveStatusChange?: (isSaving: boolean, isSaved: boolean) => void;
  dateKey: string; // YYYY-MM-DD format for localStorage key
  editable?: boolean; // Whether the editor is editable (default: true)
}

export function NovelEditor({
  initialContent,
  onUpdate,
  onSaveStatusChange,
  dateKey,
  editable = true,
}: NovelEditorProps) {
  const [openNode, setOpenNode] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load from Convex
  const journalEntry = useQuery(api.journal.get, { dateKey });
  const saveJournal = useMutation(api.journal.save);
  
  // Convex client for file uploads
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Fallback: Convert file to base64 (used when Convex storage fails)
  const convertToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Create image upload function using Convex storage with base64 fallback
  const uploadImageToConvex = useCallback(async (file: File): Promise<string> => {
    try {
      // Step 1: Get a short-lived upload URL from Convex
      const uploadUrl = await generateUploadUrl();
      
      // Step 2: Upload the file to the URL
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error('Failed to upload image to storage');
      }
      
      const { storageId } = await result.json();
      
      // Step 3: Get the public URL for the uploaded file
      const imageUrl = await convex.query(api.storage.getUrl, { storageId });
      
      if (!imageUrl) {
        throw new Error('Failed to get image URL from storage');
      }
      
      toast.success('Image uploaded successfully');
      return imageUrl;
    } catch (error) {
      // Fallback to base64 if Convex storage fails
      console.warn('Convex storage upload failed, falling back to base64:', error);
      try {
        const base64Url = await convertToBase64(file);
        toast.success('Image added (stored locally)');
        return base64Url;
      } catch (base64Error) {
        console.error('Base64 fallback also failed:', base64Error);
        toast.error('Failed to add image');
        throw base64Error;
      }
    }
  }, [generateUploadUrl, convex, convertToBase64]);

  // Create the upload function for the editor
  const uploadFn = useMemo(() => createImageUpload({
    onUpload: uploadImageToConvex,
    validateFn: validateImageFile,
  }), [uploadImageToConvex]);

  // Create suggestion items with the upload function
  const suggestionItems = useMemo(() => createSuggestionItems([
    ...baseSuggestionItems,
    {
      title: 'Image',
      description: 'Upload an image from your computer.',
      searchTerms: ['photo', 'picture', 'media'],
      icon: <ImageIcon size={18} />,
      command: ({ editor, range }: SuggestionCommandProps) => {
        editor.chain().focus().deleteRange(range).run();
        // Upload image
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
          if (input.files?.length) {
            const file = input.files[0];
            const pos = editor.view.state.selection.from;
            uploadFn(file, editor.view, pos);
          }
        };
        input.click();
      },
    },
  ]), [uploadFn]);

  // Create the slash command with the suggestion items
  const slashCommand = useMemo(() => Command.configure({
    suggestion: {
      items: () => suggestionItems,
      render: renderItems,
    },
  }), [suggestionItems]);

  // Create extensions with the slash command
  const extensions = useMemo(
    () => getExtensions(editable, slashCommand),
    [editable, slashCommand]
  );

  // Set content from Convex when it loads
  const content = journalEntry?.content || initialContent || null;

  // Default content structure
  const defaultContent: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [],
      },
      {
        type: 'paragraph',
        content: [],
      },
    ],
  };

  // Debounce timer for saving (using ref to avoid dependency issues)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save to Convex when content changes (debounced)
  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor | null }) => {
      // Don't save if editor is read-only or editor is null
      if (!editable || !editor) return;
      
      const json = editor.getJSON();
      
      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Set saving state
      setIsSaving(true);
      setIsSaved(false);
      onSaveStatusChange?.(true, false);

      // Set new timer to save after 1 second of inactivity
      saveTimerRef.current = setTimeout(async () => {
        try {
          await saveJournal({ dateKey, content: json });
          onUpdate?.(json);
          setIsSaved(true);
          setIsSaving(false);
          onSaveStatusChange?.(false, true);
          // Hide saved icon after 2 seconds
          setTimeout(() => {
            setIsSaved(false);
            onSaveStatusChange?.(false, false);
          }, 2000);
        } catch {
          setIsSaving(false);
          onSaveStatusChange?.(false, false);
        }
      }, 1000);
    },
    [dateKey, saveJournal, onUpdate, onSaveStatusChange, editable],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Store editor reference to update editable state
  const editorRef = useRef<Editor | null>(null);

  // Update editor editable state when prop changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setEditable(editable);
    }
  }, [editable]);

  return (
    <EditorRoot>
      <EditorContent
        key={`${dateKey}-${journalEntry?._id || 'new'}`} // Force re-render when dateKey or entry changes
        extensions={extensions}
        initialContent={content || defaultContent}
        onCreate={({ editor }) => {
          // Store editor reference
          editorRef.current = editor;
          // Set editor to read-only if not editable
          editor.setEditable(editable);
          // Auto-focus the editor when it's created (only if editable)
          if (editable) {
            setTimeout(() => {
              editor.commands.focus();
            }, 0);
          }
        }}
        onUpdate={handleUpdate}
        editable={editable}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          handlePaste: editable
            ? (view, event) => handleImagePaste(view, event, uploadFn)
            : undefined,
          handleDrop: editable
            ? (view, event, _slice, moved) =>
                handleImageDrop(view, event, moved, uploadFn)
            : undefined,
          attributes: {
            class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full ${!editable ? 'cursor-default' : ''}`,
          },
        }}
        className="min-h-[500px] w-full border-0 novel-editor"
      >
        {editable && (
          <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => {
                  if (item.command) {
                    item.command(val);
                  }
                }}
                className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
        )}
        {editable && (
          <EditorBubble
            tippyOptions={{
              placement: 'top',
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl"
          >
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <TextButtons />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorBubble>
        )}
        <ImageResizer />
      </EditorContent>
    </EditorRoot>
  );
}

