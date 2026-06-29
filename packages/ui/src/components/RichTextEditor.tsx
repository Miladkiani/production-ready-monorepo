"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useCallback, useRef } from "react";
import { Icon, IconName } from "./Icon";
import { cn } from "../functions/cn";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: string;
  title: string;
  disabled?: boolean;
}

const MenuButton = ({
  onClick,
  isActive,
  icon,
  title,
  disabled,
}: MenuButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 rounded-lg transition-all duration-200",
      "hover:bg-surface-hover",
      "disabled:opacity-30 disabled:cursor-not-allowed",
      isActive ? "bg-primary text-text-inverse" : "bg-surface text-text",
      "border border-border",
    )}
  >
    <Icon name={icon as IconName} size={18} />
  </button>
);

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<string>;
}

const EditorToolbar = ({ editor, onImageUpload }: EditorToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) return;

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImageFromUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor) return;
      const file = event.target.files?.[0];
      if (!file) return;

      if (!onImageUpload) {
        alert("Image upload handler not configured");
        return;
      }

      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error("Image upload failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload image";
        alert(`Image upload failed: ${errorMessage}`);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [editor, onImageUpload],
  );

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-surface">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon="Bold"
          title="Bold (Ctrl+B)"
          disabled={!editor.can().chain().focus().toggleBold().run()}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon="Italic"
          title="Italic (Ctrl+I)"
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          icon="Strikethrough"
          title="Strikethrough"
          disabled={!editor.can().chain().focus().toggleStrike().run()}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          icon="Code"
          title="Inline Code"
          disabled={!editor.can().chain().focus().toggleCode().run()}
        />
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          icon="Heading1"
          title="Heading 1"
        />
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          icon="Heading2"
          title="Heading 2"
        />
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          icon="Heading3"
          title="Heading 3"
        />
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon="List"
          title="Bullet List"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon="ListOrdered"
          title="Numbered List"
        />
      </div>

      {/* Blocks */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          icon="FileCode"
          title="Code Block"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon="Quote"
          title="Blockquote"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon="Minus"
          title="Horizontal Rule"
        />
      </div>

      {/* Link */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <MenuButton
          onClick={addLink}
          isActive={editor.isActive("link")}
          icon="Link"
          title="Add Link"
        />
        {editor.isActive("link") && (
          <MenuButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            icon="Unlink"
            title="Remove Link"
          />
        )}
      </div>

      {/* Image */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        {onImageUpload ? (
          <MenuButton
            onClick={() => fileInputRef.current?.click()}
            icon="Upload"
            title="Upload Image"
          />
        ) : (
          <MenuButton
            onClick={addImageFromUrl}
            icon="Image"
            title="Insert Image from URL"
          />
        )}
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          icon="Undo"
          title="Undo (Ctrl+Z)"
          disabled={!editor.can().chain().focus().undo().run()}
        />
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          icon="Redo"
          title="Redo (Ctrl+Y)"
          disabled={!editor.can().chain().focus().redo().run()}
        />
      </div>
    </div>
  );
};

export const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing...",
  error,
  label,
  required,
  className,
  onImageUpload,
}: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80 cursor-pointer",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg max-w-none",
          "focus:outline-none",
          "min-h-[300px] p-4",
          "prose-headings:text-text prose-p:text-text",
          "prose-strong:text-text prose-code:text-text",
          "prose-a:text-primary",
          "prose-blockquote:text-text prose-blockquote:border-primary",
          "prose-pre:bg-surface-hover prose-pre:text-text",
          "prose-img:rounded-lg prose-img:shadow-md",
          "dark:prose-invert",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-text mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div
        className={cn(
          "border rounded-lg overflow-hidden transition-all duration-200",
          error
            ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
            : "border-border focus-within:ring-2 focus-within:ring-primary/20",
          "bg-surface",
        )}
      >
        <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
        <EditorContent
          editor={editor}
          placeholder={placeholder}
          className="prose-editor"
        />
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};
