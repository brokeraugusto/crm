
import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Cloud, Calendar, Key, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Configuracoes() {
  const { theme, setTheme } = useTheme();
  const [googleDriveApiKey, setGoogleDriveApiKey] = useState(
    localStorage.getItem("googleDriveApiKey") || ""
  );
  const [googleCalendarApiKey, setGoogleCalendarApiKey] = useState(
    localStorage.getItem("googleCalendarApiKey") || ""
  );
  const [showKeys, setShowKeys] = useState(false);

  const handleSaveKeys = () => {
    // Salvar as chaves no localStorage
    localStorage.setItem("googleDriveApiKey", googleDriveApiKey);
    localStorage.setItem("googleCalendarApiKey", googleCalendarApiKey);
    
    toast({
      title: "Configurações salvas",
      description: "Suas chaves de API foram salvas com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do sistema.
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sun className="h-5 w-5" />
                <Label htmlFor="dark-mode">Modo escuro</Label>
                <Moon className="h-5 w-5" />
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Integrações API</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? (
                <><EyeOff className="h-4 w-4 mr-2" /> Ocultar</>
              ) : (
                <><Eye className="h-4 w-4 mr-2" /> Mostrar</>
              )}
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  <Label htmlFor="google-drive-api">Google Drive API Key</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="google-drive-api"
                    type={showKeys ? "text" : "password"}
                    placeholder="Insira sua chave de API do Google Drive"
                    value={googleDriveApiKey}
                    onChange={(e) => setGoogleDriveApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use para integrar o armazenamento de documentos no Google Drive.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <Label htmlFor="google-calendar-api">Google Calendar API Key</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="google-calendar-api"
                    type={showKeys ? "text" : "password"}
                    placeholder="Insira sua chave de API do Google Calendar"
                    value={googleCalendarApiKey}
                    onChange={(e) => setGoogleCalendarApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use para sincronizar atividades com seu Google Calendar.
                </p>
              </div>

              <Button onClick={handleSaveKeys}>
                <Save className="h-4 w-4 mr-2" />
                Salvar configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
