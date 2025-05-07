
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDocumentos } from '@/hooks/useDocumentos';
import { Upload, File, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FileUploaderProps {
  onUploadSuccess?: (fileUrl: string, fileName: string) => void;
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadTemplateFile, loading } = useDocumentos();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Use o nome do arquivo como nome do template por padrão
      const baseName = file.name.split('.')[0];
      setTemplateName(baseName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Selecione um arquivo para upload");
      return;
    }
    
    if (!templateName.trim()) {
      toast.error("Digite um nome para o template");
      return;
    }
    
    // Simulação de progresso
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      const result = await uploadTemplateFile(selectedFile);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      if (result.success && result.fileUrl && onUploadSuccess) {
        onUploadSuccess(result.fileUrl, templateName);
        setIsOpen(false);
        setSelectedFile(null);
        setTemplateName("");
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(interval);
      setUploadProgress(0);
      console.error("Erro no upload:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Novo Template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload de Template</DialogTitle>
          <DialogDescription>
            Faça upload de um novo modelo de documento para o Google Drive
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="templateName">Nome do Template</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Contrato de Compra e Venda"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="file">Arquivo</Label>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2">
              {selectedFile ? (
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Arraste um arquivo ou clique para selecionar</p>
              )}
              <Input
                id="file"
                type="file"
                className="cursor-pointer"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Enviando... {uploadProgress}%
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || !templateName.trim() || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Fazer Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
