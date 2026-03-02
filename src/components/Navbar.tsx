import { Clock, Crown, Edit, Share, Trash, FileText, FileDown } from 'lucide-react';
import { Message } from './ChatWindow';
import { useEffect, useState, Fragment } from 'react';
import { usePremium } from '@/lib/hooks/usePremium';
import UpgradeModal from '@/components/UpgradeModal';
import { formatTimeDifference } from '@/lib/utils';
import DeleteChat from './DeleteChat';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import jsPDF from 'jspdf';
import { useChat, Section } from '@/lib/hooks/useChat';
import { SourceBlock } from '@/lib/types';

const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

const exportAsMarkdown = (sections: Section[], title: string) => {
  const date = new Date(
    sections[0].message.createdAt || Date.now(),
  ).toLocaleString();
  let md = `# Chat Export: ${title}\n\n`;
  md += `*Exported on: ${date}*\n\n---\n`;

  sections.forEach((section) => {
    md += `\n## User\n`;
    md += `*${new Date(section.message.createdAt).toLocaleString()}*\n\n`;
    md += `${section.message.query}\n`;

    const responseText = section.message.responseBlocks
      .filter((b) => b.type === 'text')
      .map((block) => block.data)
      .join('\n');

    if (responseText.trim()) {
      md += `\n## Assistant\n`;
      md += `*${new Date(section.message.createdAt).toLocaleString()}*\n\n`;
      md += `${responseText}\n`;
    }

    const sourceResponseBlock = section.message.responseBlocks.find(
      (block) => block.type === 'source',
    ) as SourceBlock | undefined;

    if (
      sourceResponseBlock &&
      sourceResponseBlock.data &&
      sourceResponseBlock.data.length > 0
    ) {
      md += `\n### Sources\n`;
      sourceResponseBlock.data.forEach((src: any, i: number) => {
        const srcTitle = src.metadata?.title || src.metadata?.url || '';
        const url = src.metadata?.url || '';
        md += `${i + 1}. [${srcTitle}](${url})\n`;
      });
    }

    md += '\n---\n';
  });

  downloadFile(`${title || 'chat'}.md`, md, 'text/markdown');
};

const stripMarkdown = (text: string): string => {
  return text
    // Remove think/HTML tags
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<citation[^>]*>[\s\S]*?<\/citation>/gi, '')
    .replace(/<[^>]+>/g, '')
    // Code blocks (before other replacements)
    .replace(/```[\s\S]*?```/g, (match) => {
      // Keep the code content, just remove the fences
      return match.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
    })
    // Horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Headers → add indent to make them distinct
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    // Bold + italic together
    .replace(/\*{3}(.+?)\*{3}/g, '$1')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Italic
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Inline code
    .replace(/`(.+?)`/g, '$1')
    // Images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '$1')
    // Blockquotes
    .replace(/^>\s*/gm, '')
    // Unordered lists
    .replace(/^[ \t]*[-*+]\s+/gm, '• ')
    // Collapse 3+ newlines to 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const exportAsPDF = (sections: Section[], title: string) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const date = new Date(
    sections[0]?.message?.createdAt || Date.now(),
  ).toLocaleString();
  let y = margin;

  const addText = (
    text: string,
    x: number,
    fontSize: number,
    color: [number, number, number],
    fontStyle: 'normal' | 'bold' = 'normal',
    maxWidth?: number,
  ): void => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth ?? contentWidth);
    const lineHeight = fontSize * 0.352778 * 1.4; // pt → mm × line-height factor
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, x, y);
      y += lineHeight;
    }
  };

  const addSpacer = (h: number) => {
    y += h;
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addDivider = (color: [number, number, number] = [220, 220, 220]) => {
    addSpacer(2);
    if (y > pageHeight - margin) { doc.addPage(); y = margin; }
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    addSpacer(4);
  };

  // ── Title block ──
  addText(`Chat Export`, margin, 20, [30, 30, 30], 'bold');
  addSpacer(2);
  addText(title, margin, 13, [80, 80, 80]);
  addSpacer(1);
  addText(`Exported on: ${date}`, margin, 9, [140, 140, 140]);
  addDivider([180, 180, 180]);

  sections.forEach((section, idx) => {
    // ── User turn ──
    addText('You', margin, 9, [100, 100, 100], 'bold');
    addSpacer(1);
    addText(
      stripMarkdown(section.message.query),
      margin,
      11,
      [30, 30, 30],
      'normal',
      contentWidth,
    );
    addSpacer(4);

    // ── Assistant turn ──
    const rawText = section.message.responseBlocks
      .filter((b) => b.type === 'text')
      .map((b) => b.data)
      .join('\n');

    if (rawText.trim()) {
      addText('Assistant', margin, 9, [37, 99, 235], 'bold');
      addSpacer(1);
      addText(
        stripMarkdown(rawText),
        margin,
        11,
        [30, 30, 30],
        'normal',
        contentWidth,
      );
      addSpacer(4);
    }

    // ── Sources ──
    const sourceBlock = section.message.responseBlocks.find(
      (block) => block.type === 'source',
    ) as SourceBlock | undefined;

    if (sourceBlock?.data?.length) {
      addText('Sources', margin, 9, [100, 100, 100], 'bold');
      addSpacer(1);
      sourceBlock.data.forEach((src: any, i: number) => {
        const srcTitle = src.metadata?.title || src.metadata?.url || '';
        const url = src.metadata?.url || '';
        addText(
          `${i + 1}. ${srcTitle}`,
          margin,
          9,
          [37, 99, 235],
          'normal',
          contentWidth,
        );
        if (url && url !== srcTitle) {
          addText(`   ${url}`, margin, 8, [140, 140, 140], 'normal', contentWidth);
        }
      });
      addSpacer(2);
    }

    if (idx < sections.length - 1) addDivider();
  });

  doc.save(`${title || 'chat'}.pdf`);
};

const Navbar = () => {
  const [title, setTitle] = useState<string>('');
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const { sections, chatId } = useChat();
  const { isPremium, refresh } = usePremium();

  useEffect(() => {
    if (sections.length > 0 && sections[0].message) {
      const newTitle =
        sections[0].message.query.length > 30
          ? `${sections[0].message.query.substring(0, 30).trim()}...`
          : sections[0].message.query || 'New Conversation';

      setTitle(newTitle);
      const newTimeAgo = formatTimeDifference(
        new Date(),
        sections[0].message.createdAt,
      );
      setTimeAgo(newTimeAgo);
    }
  }, [sections]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (sections.length > 0 && sections[0].message) {
        const newTimeAgo = formatTimeDifference(
          new Date(),
          sections[0].message.createdAt,
        );
        setTimeAgo(newTimeAgo);
      }
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
    <div className="sticky -mx-4 lg:mx-0 top-0 z-40 bg-light-primary/95 dark:bg-dark-primary/95 backdrop-blur-sm border-b border-light-200/50 dark:border-dark-200/30">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <a
              href="/"
              className="lg:hidden mr-3 p-2 -ml-2 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200"
            >
              <Edit size={18} className="text-black/70 dark:text-white/70" />
            </a>
            <div className="hidden lg:flex items-center gap-2 text-black/50 dark:text-white/50 min-w-0">
              <Clock size={14} />
              <span className="text-xs whitespace-nowrap">{timeAgo} ago</span>
            </div>
          </div>

          <div className="flex-1 mx-4 min-w-0">
            <h1 className="text-center text-sm font-medium text-black/80 dark:text-white/90 truncate">
              {title || 'New Conversation'}
            </h1>
          </div>

          <div className="flex items-center gap-1 min-w-0">
            <button
              onClick={() => { if (!isPremium) setUpgradeOpen(true); }}
              title={isPremium ? 'Premium Active' : 'Upgrade to Premium'}
              className="p-2 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200"
            >
              <Crown
                size={16}
                className={isPremium ? 'text-amber-500' : 'text-black/40 dark:text-white/40'}
              />
            </button>
            <Popover className="relative">
              <PopoverButton className="p-2 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200">
                <Share size={16} className="text-black/60 dark:text-white/60" />
              </PopoverButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <PopoverPanel className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200 shadow-xl shadow-black/10 dark:shadow-black/30 z-50">
                  <div className="p-3">
                    <div className="mb-2">
                      <p className="text-xs font-medium text-black/40 dark:text-white/40 uppercase tracking-wide">
                        Export Chat
                      </p>
                    </div>
                    <div className="space-y-1">
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200"
                        onClick={() => exportAsMarkdown(sections, title || '')}
                      >
                        <FileText size={16} className="text-[#24A0ED]" />
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">
                            Markdown
                          </p>
                          <p className="text-xs text-black/50 dark:text-white/50">
                            .md format
                          </p>
                        </div>
                      </button>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors duration-200"
                        onClick={() => exportAsPDF(sections, title || '')}
                      >
                        <FileDown size={16} className="text-[#24A0ED]" />
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">
                            PDF
                          </p>
                          <p className="text-xs text-black/50 dark:text-white/50">
                            Document format
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </Popover>
            <DeleteChat
              redirect
              chatId={chatId!}
              chats={[]}
              setChats={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
    <UpgradeModal
      isOpen={upgradeOpen}
      setIsOpen={setUpgradeOpen}
      onSuccess={refresh}
    />
  </>);
};

export default Navbar;
