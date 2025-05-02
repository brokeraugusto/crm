
import { useAuth } from "@/components/auth/AuthProvider";

// Email do usuário master
const MASTER_EMAIL = "contato@augustogoncalves.com";

export function useAdmin() {
  const { user } = useAuth();
  
  // Verifica se o usuário atual é o usuário master
  const isMasterAdmin = user?.email === MASTER_EMAIL;
  
  return {
    isMasterAdmin
  };
}
