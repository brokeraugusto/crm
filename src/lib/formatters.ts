
/**
 * Formata um valor numérico para o formato de moeda (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata uma data para o formato local
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(
    typeof date === 'string' ? new Date(date) : date
  );
}
