"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const baseComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="mb-3 border-b border-zinc-800 pb-2 text-xl font-bold text-zinc-100" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mb-2 text-lg font-semibold text-zinc-100" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mb-2 text-base font-semibold text-zinc-200" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mb-1.5 text-sm font-semibold text-zinc-200" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-2 last:mb-0 text-sm leading-relaxed text-zinc-400" {...props}>
      {children}
    </p>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-zinc-200" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-zinc-300" {...props}>
      {children}
    </em>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-2 list-disc space-y-0.5 pl-5 text-sm text-zinc-400" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-2 list-decimal space-y-0.5 pl-5 text-sm text-zinc-400" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-violet-400 underline decoration-violet-500/40 underline-offset-2 hover:text-violet-300"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    if (isBlock) {
      return (
        <code className={`${className} block font-mono text-xs text-emerald-300`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-zinc-800/90 px-1.5 py-0.5 font-mono text-[0.8em] text-emerald-300"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="mb-3 overflow-x-auto rounded-lg border border-zinc-800 bg-surface p-3 text-xs leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),
  img: ({ alt, src, ...props }) => {
    const href =
      src == null ? "" : typeof src === "string" ? src.trim() : String(src).trim();
    if (!href) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URLs and arbitrary preview images
      <img
        src={href}
        alt={alt ?? ""}
        className="my-2 max-h-72 w-full rounded-lg border border-zinc-800 object-contain"
        {...props}
      />
    );
  },
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mb-2 border-l-2 border-violet-500/50 pl-3 text-sm italic text-zinc-500"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: (props) => <hr className="my-4 border-zinc-800" {...props} />,
  table: ({ children, ...props }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-zinc-400" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-zinc-800 bg-zinc-900/80 px-2 py-1.5 text-xs font-semibold text-zinc-300" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-zinc-800 px-2 py-1.5 text-xs" {...props}>
      {children}
    </td>
  ),
};

interface MarkdownContentProps {
  content: string;
  className?: string;
  /** When false, render nothing if content is empty (e.g. card previews). */
  showEmptyHint?: boolean;
}

/**
 * Wrap bare `data:image...;base64,...` image URLs in `<...>` so remark parses them as images
 * (long URLs otherwise often render as literal paragraph text).
 * Also strips accidental whitespace inside pasted base64.
 */
export function normalizeMarkdownImageDataUrls(md: string): string {
  return md.replace(
    /!\[([^\]]*)\]\(\s*(data:image\/[^;]+;base64,[\s\S]*?)\)/g,
    (full, alt, urlRaw) => {
      if (/^\s*</.test(urlRaw)) return full;
      const url = urlRaw.replace(/\s+/g, "");
      return `![${alt}](<${url}>)`;
    }
  );
}

export function MarkdownContent({
  content,
  className,
  showEmptyHint = true,
}: MarkdownContentProps) {
  if (!content.trim()) {
    if (!showEmptyHint) return null;
    return <p className="text-sm italic text-zinc-600">No content</p>;
  }

  const normalized = normalizeMarkdownImageDataUrls(content);

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={baseComponents}>
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
