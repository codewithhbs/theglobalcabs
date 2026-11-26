'use client';
import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TLink from '@tiptap/extension-link';
import TImage from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

// Clean, SEO-friendly HTML output: H2–H4 only (page title is the H1), no forced target/nofollow on links.
export const editorExtensions = [
  StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
  Underline,
  TLink.configure({ openOnClick: false, autolink: false, HTMLAttributes: { target: null, rel: null, class: null } }),
  TImage.configure({ inline: false }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Table,
  TableRow,
  TableHeader,
  TableCell,
];

const formatHtml = (html) => html.replace(/(<\/(p|h[1-6]|li|ul|ol|blockquote|table|tr|hr)>|<hr\s*\/?>)/g, '$1\n').replace(/\n{2,}/g, '\n').trim();

function Btn({ onClick, active, disabled, title, children, wide }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 ${wide ? 'px-2.5' : 'w-8'} shrink-0 rounded-lg text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? 'bg-ink text-amber-400' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px shrink-0 bg-slate-200" />;

export default function RichTextEditor({ value, onChange }) {
  const [source, setSource] = useState(false);
  const [raw, setRaw] = useState('');
  const [panel, setPanel] = useState(null); // 'link' | 'image' | null
  const [linkForm, setLinkForm] = useState({ url: '', newTab: false, nofollow: false });
  const [imgForm, setImgForm] = useState({ src: '', alt: '' });

  const editor = useEditor({
    extensions: editorExtensions,
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none min-h-[440px] px-6 py-5 focus:outline-none prose-headings:font-display prose-headings:font-bold prose-a:text-amber-600 prose-img:rounded-xl prose-table:text-sm',
      },
    },
  });

  if (!editor) return <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-mist" />;

  const chain = () => editor.chain().focus();

  const openLink = () => {
    const a = editor.getAttributes('link');
    setLinkForm({
      url: a.href || '',
      newTab: a.target === '_blank',
      nofollow: (a.rel || '').includes('nofollow'),
    });
    setPanel(panel === 'link' ? null : 'link');
  };

  const applyLink = () => {
    const url = linkForm.url.trim();
    if (!url) {
      chain().extendMarkRange('link').unsetLink().run();
    } else {
      const rel = [...(linkForm.newTab ? ['noopener', 'noreferrer'] : []), ...(linkForm.nofollow ? ['nofollow'] : [])].join(' ') || null;
      const attrs = { href: url, target: linkForm.newTab ? '_blank' : null, rel };
      if (editor.state.selection.empty && !editor.isActive('link')) {
        chain().insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs }] }).run();
      } else {
        chain().extendMarkRange('link').setLink(attrs).run();
      }
    }
    setPanel(null);
  };

  const applyImage = () => {
    if (!imgForm.src.trim()) return;
    chain().setImage({ src: imgForm.src.trim(), alt: imgForm.alt.trim() }).run();
    setImgForm({ src: '', alt: '' });
    setPanel(null);
  };

  const toggleSource = () => {
    if (!source) {
      setRaw(formatHtml(editor.getHTML()));
      setSource(true);
    } else {
      editor.commands.setContent(raw, false);
      onChange(editor.getHTML());
      setSource(false);
    }
  };

  const words = editor.getText().trim().split(/\s+/).filter(Boolean).length;
  const inTable = editor.isActive('table');

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Toolbar */}
      <div className="sticky top-16 z-10 rounded-t-xl border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-0.5 p-2">
          <Btn title="Paragraph" active={editor.isActive('paragraph')} onClick={() => chain().setParagraph().run()} disabled={source}>P</Btn>
          {[2, 3, 4].map((l) => (
            <Btn key={l} title={`Heading ${l}`} active={editor.isActive('heading', { level: l })} onClick={() => chain().toggleHeading({ level: l }).run()} disabled={source}>H{l}</Btn>
          ))}
          <Sep />
          <Btn title="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()} disabled={source}><b>B</b></Btn>
          <Btn title="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()} disabled={source}><i>I</i></Btn>
          <Btn title="Underline" active={editor.isActive('underline')} onClick={() => chain().toggleUnderline().run()} disabled={source}><u>U</u></Btn>
          <Btn title="Strikethrough" active={editor.isActive('strike')} onClick={() => chain().toggleStrike().run()} disabled={source}><s>S</s></Btn>
          <Sep />
          <Btn wide title="Bullet list" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()} disabled={source}>• List</Btn>
          <Btn wide title="Numbered list" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()} disabled={source}>1. List</Btn>
          <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()} disabled={source}>❝</Btn>
          <Sep />
          <Btn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => chain().setTextAlign('left').run()} disabled={source}>⇤</Btn>
          <Btn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => chain().setTextAlign('center').run()} disabled={source}>↔</Btn>
          <Btn title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => chain().setTextAlign('right').run()} disabled={source}>⇥</Btn>
          <Sep />
          <Btn wide title="Insert / edit link" active={editor.isActive('link') || panel === 'link'} onClick={openLink} disabled={source}>Link</Btn>
          <Btn wide title="Insert image" active={panel === 'image'} onClick={() => setPanel(panel === 'image' ? null : 'image')} disabled={source}>Image</Btn>
          <Btn wide title="Insert table" onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={source}>Table</Btn>
          <Btn title="Horizontal line" onClick={() => chain().setHorizontalRule().run()} disabled={source}>―</Btn>
          <Btn wide title="Insert FAQ section here" onClick={() => chain().insertContent('<p>[faqs]</p>').run()} disabled={source}>+FAQs</Btn>
          <Sep />
          <Btn title="Undo" onClick={() => chain().undo().run()} disabled={source || !editor.can().undo()}>↶</Btn>
          <Btn title="Redo" onClick={() => chain().redo().run()} disabled={source || !editor.can().redo()}>↷</Btn>
          <Btn wide title="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()} disabled={source}>Tx</Btn>
          <span className="ml-auto" />
          <Btn wide title="Edit raw HTML" active={source} onClick={toggleSource}>{'</> HTML'}</Btn>
        </div>

        {inTable && !source && (
          <div className="flex flex-wrap items-center gap-1 border-t border-slate-100 bg-mist px-2 py-1.5 text-xs">
            <span className="mr-1 font-bold text-slate-400">Table:</span>
            <Btn wide onClick={() => chain().addRowAfter().run()}>+ Row</Btn>
            <Btn wide onClick={() => chain().addColumnAfter().run()}>+ Column</Btn>
            <Btn wide onClick={() => chain().deleteRow().run()}>− Row</Btn>
            <Btn wide onClick={() => chain().deleteColumn().run()}>− Column</Btn>
            <Btn wide onClick={() => chain().deleteTable().run()}>Delete table</Btn>
          </div>
        )}

        {panel === 'link' && !source && (
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-mist p-3">
            <input className="input !w-72 !py-2" placeholder="https://… or /services/local-taxi" value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyLink())} autoFocus />
            <label className="flex items-center gap-1.5 text-xs font-semibold"><input type="checkbox" className="accent-amber-500" checked={linkForm.newTab} onChange={(e) => setLinkForm({ ...linkForm, newTab: e.target.checked })} /> New tab</label>
            <label className="flex items-center gap-1.5 text-xs font-semibold"><input type="checkbox" className="accent-amber-500" checked={linkForm.nofollow} onChange={(e) => setLinkForm({ ...linkForm, nofollow: e.target.checked })} /> nofollow</label>
            <button type="button" className="btn-primary !px-4 !py-2 text-xs" onClick={applyLink}>{linkForm.url ? 'Apply' : 'Remove link'}</button>
            <button type="button" className="text-xs font-semibold text-slate-400 hover:text-ink" onClick={() => setPanel(null)}>Cancel</button>
          </div>
        )}

        {panel === 'image' && !source && (
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-mist p-3">
            <input className="input !w-72 !py-2" placeholder="Image URL (https://…)" value={imgForm.src} onChange={(e) => setImgForm({ ...imgForm, src: e.target.value })} autoFocus />
            <input className="input !w-64 !py-2" placeholder="Alt text (SEO ke liye zaroori)" value={imgForm.alt} onChange={(e) => setImgForm({ ...imgForm, alt: e.target.value })} />
            <button type="button" className="btn-primary !px-4 !py-2 text-xs" onClick={applyImage}>Insert</button>
            <button type="button" className="text-xs font-semibold text-slate-400 hover:text-ink" onClick={() => setPanel(null)}>Cancel</button>
          </div>
        )}
      </div>

      {/* Body */}
      {source ? (
        <textarea
          className="block min-h-[440px] w-full resize-y rounded-b-xl bg-ink px-5 py-4 font-mono text-xs leading-relaxed text-slate-200 focus:outline-none"
          spellCheck={false}
          value={raw}
          onChange={(e) => { setRaw(e.target.value); onChange(e.target.value); }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      <div className="flex justify-between rounded-b-xl border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
        <span>{source ? 'HTML mode — editor me wapas jaane par unsupported tags hat sakte hain' : 'Headings H2–H4 use karo (page title already H1 hai)'}</span>
        <span>{words} words</span>
      </div>
    </div>
  );
}
