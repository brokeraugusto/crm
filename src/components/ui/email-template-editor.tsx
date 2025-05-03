
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export interface EmailTemplateData {
  subject: string;
  body: string;
}

interface EmailTemplateEditorProps {
  initialValue?: EmailTemplateData;
  onSave: (templateData: EmailTemplateData) => void;
  onCancel?: () => void;
}

export function EmailTemplateEditor({ initialValue, onSave, onCancel }: EmailTemplateEditorProps) {
  const [template, setTemplate] = useState<EmailTemplateData>(
    initialValue || {
      subject: "Convite para Casa Próxima",
      body: `Olá,

Você foi convidado para participar do sistema Casa Próxima.

Clique no link abaixo para criar sua conta e começar a utilizar o sistema:
[LINK_CONVITE]

Se você tiver alguma dúvida, entre em contato com o administrador.

Atenciosamente,
Equipe Casa Próxima`
    }
  );

  const handleSave = () => {
    onSave(template);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Editar Template de Email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-subject">Assunto do Email</Label>
          <Input
            id="email-subject"
            value={template.subject}
            onChange={(e) => setTemplate({...template, subject: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-body">Corpo do Email</Label>
          <Textarea
            id="email-body"
            value={template.body}
            onChange={(e) => setTemplate({...template, body: e.target.value})}
            className="min-h-[200px]"
          />
        </div>
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Variáveis disponíveis:</strong><br/>
            [LINK_CONVITE] - Link para criar a conta<br/>
            [NOME] - Nome do convidado (se disponível)<br/>
            [PAPEL] - Função do convidado
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onCancel && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
        <Button onClick={handleSave}>Salvar Template</Button>
      </CardFooter>
    </Card>
  );
}
