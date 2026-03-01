import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { File, FolderOpen, Search, Filter, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileRecord } from '../../../worker/types';
import { FilePreview } from './FilePreview';
import { cn } from '@/lib/utils';
interface FileExplorerProps {
  files: FileRecord[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}
export function FileExplorer({ files, selectedIds, onSelectionChange }: FileExplorerProps) {
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.path.toLowerCase().includes(search.toLowerCase())
  );
  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(filtered.map(f => f.id)));
    } else {
      onSelectionChange(new Set());
    }
  };
  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search core index (e.g. *.pdf, /documents)..."
            className="pl-9 bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 transition-all font-mono text-xs h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="h-9 px-4 border-slate-800 bg-slate-900/50 text-slate-400 flex items-center gap-2 uppercase tracking-tighter text-[10px] font-bold">
          <Filter className="w-3.5 h-3.5" /> Filter_State: Global
        </Badge>
      </div>
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/80 backdrop-blur-sm shadow-xl">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-800/60">
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onCheckedChange={(c) => toggleAll(!!c)}
                  className="border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Filename</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Storage Path</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider text-right">Data Size</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider text-center">Metadata Tags</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider text-right pr-4">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? filtered.map((file) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={file.id}
                  className={cn(
                    "group border-slate-900 cursor-pointer transition-all border-b",
                    selectedIds.has(file.id) ? "bg-blue-500/10" : "hover:bg-slate-900/50"
                  )}
                  onClick={() => setPreviewFile(file)}
                >
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selectedIds.has(file.id)}
                      onClick={(e) => toggleOne(file.id, e)}
                      className="border-slate-800 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        selectedIds.has(file.id) ? "bg-blue-500/20" : "bg-blue-500/5 group-hover:bg-blue-500/20"
                      )}>
                        <File className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-200">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                      <FolderOpen className="w-3 h-3 opacity-50" />
                      {file.path}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-400 tabular-nums">
                    {(file.size / 1024).toFixed(0)} KB
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-center gap-1">
                      {file.tags?.length ? file.tags.map(t => (
                        <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0 bg-slate-900 border-slate-800 text-slate-500">
                          {t}
                        </Badge>
                      )) : <span className="text-[10px] text-slate-800 italic">none</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-slate-600 font-mono">
                        {new Date(file.updated_at).toLocaleDateString()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-800 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </TableCell>
                </motion.tr>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                      <Search className="w-8 h-8" />
                      <p className="text-xs font-mono uppercase tracking-widest">ZERO_MATCHES_RETURNED</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      <FilePreview file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}