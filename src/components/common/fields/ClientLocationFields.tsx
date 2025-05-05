
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { UseFormReturn } from "react-hook-form";
import { AtividadeFormData } from "../validation/atividadeSchema";

interface ClientLocationFieldsProps {
  form: UseFormReturn<AtividadeFormData>;
}

export function ClientLocationFields({ form }: ClientLocationFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="cliente"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente</FormLabel>
            <FormControl>
              <Input placeholder="Nome do cliente..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="endereco"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input placeholder="Onde será realizada a atividade..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
