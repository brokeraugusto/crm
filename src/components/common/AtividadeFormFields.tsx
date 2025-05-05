
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AtividadeFormData } from "./validation/atividadeSchema";
import { BasicFields } from "./fields/BasicFields";
import { DateTimeFields } from "./fields/DateTimeFields";
import { ClientLocationFields } from "./fields/ClientLocationFields";
import { DescriptionField } from "./fields/DescriptionField";

interface AtividadeFormFieldsProps {
  form: UseFormReturn<AtividadeFormData>;
  hora: string;
  setHora: (hora: string) => void;
}

export function AtividadeFormFields({ form, hora, setHora }: AtividadeFormFieldsProps) {
  return (
    <>
      <BasicFields form={form} />
      <DateTimeFields form={form} hora={hora} setHora={setHora} />
      <ClientLocationFields form={form} />
      <DescriptionField form={form} />
    </>
  );
}
