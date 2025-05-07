
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  fileId?: string;
  fileName?: string;
  error?: string;
}

export const FileHandler = {
  // Função para fazer upload de um arquivo para o Storage
  async uploadFile(file: File, bucket: string = "templates"): Promise<FileUploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      
      if (error) {
        console.error("Erro ao fazer upload:", error);
        throw error;
      }
      
      // Obter URL pública do arquivo
      const { data: publicUrl } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      return {
        success: true,
        fileUrl: publicUrl.publicUrl,
        fileId: filePath,
        fileName: file.name
      };
    } catch (error: any) {
      console.error("Erro no upload do arquivo:", error);
      return {
        success: false,
        error: error.message || "Erro ao fazer upload do arquivo"
      };
    }
  },
  
  // Função para fazer upload para o Google Drive
  async uploadToGoogleDrive(file: File): Promise<FileUploadResult> {
    try {
      // Simulação de upload para o Google Drive
      // Em uma implementação real, seria necessário usar a API do Google Drive
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Arquivo "${file.name}" enviado para o Google Drive`);
      
      return {
        success: true,
        fileName: file.name,
        fileId: `gdrive-${Math.random().toString(36).substring(2, 9)}`,
      };
    } catch (error: any) {
      console.error("Erro ao fazer upload para o Google Drive:", error);
      return {
        success: false,
        error: error.message || "Erro ao fazer upload para o Google Drive"
      };
    }
  }
};
