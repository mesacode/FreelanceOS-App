export interface WhatsappTemplateItem {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWhatsappTemplateInput {
  name: string;
  content: string;
}

export interface UpdateWhatsappTemplateInput extends CreateWhatsappTemplateInput {
  id: string;
}
