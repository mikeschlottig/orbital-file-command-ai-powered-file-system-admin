import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { File, FolderOpen, Tag, Info, Hash, HardDrive, Calendar, ShieldCheck } from 'lucide-react';
import { FileRecord } from '../../../worker/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
export function FilePreview({ file, isOpen, onClose }: { file: FileRecord | null, isOpen: boolean, onClose: () => void }) {
  if (!file) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-2xl sm:rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <File className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-mono tracking-tight text-white">{file.name}</DialogTitle>
              <DialogDescription className="text-slate-500 font-mono text-xs">OBJECT_UID: {file.id}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest flex items-center gap-1">
                <FolderOpen className="w-3 h-3" /> Logical Path
              </h4>
              <Breadcrumb>
                <BreadcrumbList>
                  {file.path.split('/').filter(Boolean).map((p, i) => (
                    <React.Fragment key={p}>
                      <BreadcrumbItem>
                        <BreadcrumbLink className="text-slate-400 text-xs font-mono">{p}</BreadcrumbLink>
                      </BreadcrumbItem>
                      {i < file.path.split('/').filter(Boolean).length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </section>
            <section className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> Size
                </h4>
                <p className="font-mono text-sm">{file.size.toLocaleString()} bytes</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Perms
                </h4>
                <p className="font-mono text-sm text-emerald-500">rw-r--r--</p>
              </div>
            </section>
            <section>
              <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest flex items-center gap-1">
                <Tag className="w-3 h-3" /> Attached Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {file.tags?.map(t => (
                  <Badge key={t} variant="secondary" className="bg-slate-900 border-slate-800 text-slate-400 font-mono">
                    {t}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-blue-500 hover:bg-blue-500/10">
                  + Add Tag
                </Button>
              </div>
            </section>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 space-y-4">
            <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1">
              <Info className="w-3 h-3" /> Virtual Manifest
            </h4>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-500">TYPE</span>
                <span className="text-blue-400">{file.type.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-2">
                <span className="text-slate-500">MIME</span>
                <span className="text-slate-300">application/{file.type}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-800/50 pb-2">
                <span className="text-slate-500 flex items-center gap-1"><Hash className="w-2.5 h-2.5" /> MD5_HASH</span>
                <span className="text-slate-400 truncate">e99a18c428cb38d5f260853678922e03</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> LAST_INDEXED</span>
                <span className="text-slate-400">{new Date(file.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}