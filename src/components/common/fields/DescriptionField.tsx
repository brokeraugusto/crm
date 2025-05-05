
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Textarea } from "../../ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { AtividadeFormData } from "../validation/atividadeSchema";

interface DescriptionFieldProps {
  form: UseFormReturn<AtividadeFormData>;
}

export function DescriptionField({ form }: DescriptionFieldProps) {
  return (
    <FormField
      control={form.control}
      name="descricao"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Detalhes adicionais da atividade..."
              className="h-20"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
