"use client";

import { useEffect, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold,
  Italic,
  Link2,
  Highlighter,
  Plus,
  List,
  ListChecks,
  Heading2,
  Code2,
  ImageIcon,
  Underline as UnderlineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeNoteHtml } from "@/lib/note-content";

const lowlight = createLowlight(common);

type NoteEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  autofocus?: boolean;
  onBareUrlPaste?: (url: string) => void;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function NoteEditor({
  content,
  onChange,
  placeholder = "Write something, paste a link, or drop an image…",
  className,
  editable = true,
  autofocus = false,
  onBareUrlPaste,
}: NoteEditorProps) {
  const [insertOpen, setInsertOpen] = useState(false);
  const [, setTick] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    autofocus: autofocus ? "end" : false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [2, 3] },
        hardBreak: {
          keepMarks: true,
        },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-violet-400 underline underline-offset-2",
        },
      }),
      TaskList.configure({
        HTMLAttributes: { class: "note-task-list" },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: "note-task-item" },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: "note-image" },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: { class: "note-code-block" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: normalizeNoteHtml(content) || "",
    editorProps: {
      attributes: {
        class:
          "note-body note-editor-surface max-w-none focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData("text/plain")?.trim() ?? "";
        const files = event.clipboardData?.files;
        if (files && files.length > 0) {
          const image = Array.from(files).find((f) => f.type.startsWith("image/"));
          if (image) {
            void fileToDataUrl(image).then((src) => {
              editor?.chain().focus().setImage({ src }).run();
            });
            return true;
          }
        }
        if (
          onBareUrlPaste &&
          /^https?:\/\/\S+$/i.test(text) &&
          editor &&
          editor.isEmpty
        ) {
          onBareUrlPaste(text);
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const image = Array.from(files).find((f) => f.type.startsWith("image/"));
        if (!image) return false;
        event.preventDefault();
        void fileToDataUrl(image).then((src) => {
          editor?.chain().focus().setImage({ src }).run();
        });
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    onSelectionUpdate: () => setTick((n) => n + 1),
    onTransaction: () => setTick((n) => n + 1),
  });

  useEffect(() => {
    if (!editor) return;
    const next = normalizeNoteHtml(content) || "";
    const current = editor.getHTML();
    if (next !== current && normalizeNoteHtml(current) !== next) {
      if (!editor.isFocused) {
        editor.commands.setContent(next, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const insertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      void fileToDataUrl(file).then((src) => {
        editor.chain().focus().setImage({ src }).run();
      });
    };
    input.click();
  };

  const blockTools = [
    {
      label: "Checklist",
      icon: ListChecks,
      active: editor.isActive("taskList"),
      run: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      label: "Bullets",
      icon: List,
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Heading",
      icon: Heading2,
      active: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Code block",
      icon: Code2,
      active: editor.isActive("codeBlock"),
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];

  return (
    <div
      className={cn(
        "relative flex max-h-[min(55vh,32rem)] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50",
        className
      )}
    >
      {editable && (
        <div className="z-10 flex shrink-0 flex-wrap items-center gap-1 border-b border-zinc-800/80 bg-zinc-900/90 px-2 py-1.5 backdrop-blur-sm">
          <div className="relative">
            <button
              type="button"
              onClick={() => setInsertOpen((o) => !o)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white",
                insertOpen && "bg-zinc-800 text-white"
              )}
              title="Insert"
              aria-expanded={insertOpen}
            >
              <Plus className="h-4 w-4" />
            </button>
            {insertOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setInsertOpen(false)}
                />
                <div className="absolute left-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                  {blockTools.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        item.run();
                        setInsertOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-800",
                        item.active
                          ? "bg-violet-500/15 text-violet-200"
                          : "text-zinc-300"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-3.5 w-3.5",
                          item.active ? "text-violet-300" : "text-zinc-500"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.active && (
                        <span className="text-[10px] font-medium text-violet-400">
                          On
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      insertImage();
                      setInsertOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-zinc-500" />
                    Image
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mx-0.5 h-5 w-px bg-zinc-800" />

          {blockTools.map((item) => (
            <button
              key={item.label}
              type="button"
              title={item.active ? `${item.label} (on)` : item.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={item.run}
              aria-pressed={item.active}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors",
                item.active
                  ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
                  : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}

          <button
            type="button"
            title="Image"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertImage}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {editable && editor && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-0.5 rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-xl"
        >
          <BubbleBtn
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            label="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            label="Highlight"
          >
            <Highlighter className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn active={editor.isActive("link")} onClick={setLink} label="Link">
            <Link2 className="h-3.5 w-3.5" />
          </BubbleBtn>
        </BubbleMenu>
      )}

      <div className="note-editor min-h-[8rem] flex-1 overflow-y-auto overscroll-contain px-3.5 py-3 sm:px-4 sm:py-3.5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function BubbleBtn({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-violet-500/20 text-violet-300"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
