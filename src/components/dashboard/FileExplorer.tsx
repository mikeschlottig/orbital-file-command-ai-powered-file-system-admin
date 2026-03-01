import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { File, FolderOpen, Search, Filter, ArrowRight } from 'lucide-react';
import { FileRecord } from '../../../worker/types';
import { FilePreview } from './FilePreview';
export function FileExplorer({ files }: { files: FileRecord[] }) {
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.path.toLowerCase().includes(search.toLowerCase())
  );
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
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider pl-4">Filename</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">Storage Path</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider text-right">Data Size</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider text-center">Metadata Tags</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider text-right pr-4">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? filtered.map((file) => (
              <TableRow 
                key={file.id} 
                className="group border-slate-900 cursor-pointer hover:bg-slate-900/50 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                onClick={() => setSelectedFile(file)}
              >
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/5 group-hover:bg-blue-500/20 transition-colors">
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
                      <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0 bg-slate-900 border-slate-800 text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-colors">
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
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                    <Search className="w-8 h-8" />
                    <p className="text-xs font-mono uppercase tracking-widest">ZERO_MATCHES_RETURNED</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <FilePreview file={selectedFile} isOpen={!!selectedFile} onClose={() => setSelectedFile(null)} />
    </div>
  );
}