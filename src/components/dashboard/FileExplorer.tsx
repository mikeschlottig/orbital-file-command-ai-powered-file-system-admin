import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { File, FolderOpen, Search, Filter } from 'lucide-react';
import { FileRecord } from '../../../worker/types';
export function FileExplorer({ files }: { files: FileRecord[] }) {
  const [search, setSearch] = useState('');
  const filtered = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.path.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Filter by name or path..." 
            className="pl-8 bg-slate-900/50 border-slate-800 text-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="h-9 border-slate-800 text-slate-400">
          <Filter className="w-3 h-3 mr-1" /> All Files
        </Badge>
      </div>
      <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="text-slate-400 w-[300px]">Filename</TableHead>
              <TableHead className="text-slate-400">Path</TableHead>
              <TableHead className="text-slate-400">Size</TableHead>
              <TableHead className="text-slate-400">Tags</TableHead>
              <TableHead className="text-slate-400 text-right">Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? filtered.map((file) => (
              <TableRow key={file.id} className="hover:bg-slate-800/50 border-slate-800">
                <TableCell className="font-medium text-slate-200">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-blue-400" />
                    {file.name}
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-xs">
                  <div className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {file.path}
                  </div>
                </TableCell>
                <TableCell className="text-slate-300">
                  {(file.size / 1024).toFixed(0)} KB
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {file.tags?.map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px] py-0 bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right text-slate-500 text-xs">
                  {new Date(file.updated_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No files found in index.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}