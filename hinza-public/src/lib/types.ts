export type CustomFieldType = "text" | "number" | "date" | "file_upload" | "dropdown";

export type IntakeField = {
  id: string;
  field_label: string;
  field_type: CustomFieldType;
  is_required: boolean;
  options: unknown;
  field_order?: number;
};

/** Master template option shown as a complaint category on Screen 1. */
export type ComplaintTypeOption = {
  id: string;
  name: string;
  description?: string | null;
  is_safety: boolean;
  fields: IntakeField[];
};

export type IntakeContext = {
  ok: true;
  product: {
    id: string;
    name: string;
    company_id: string;
  };
  batch: {
    id: string;
    batch_number: string;
    production_date: string | null;
  };
  outlet: { id: string; name: string } | null;
  complaint_types: ComplaintTypeOption[];
};

export type IntakeContextError = {
  ok: false;
  error: string;
};

export type PublicComplaintStatus = {
  tracking_code: string;
  status: string;
  created_at: string;
};

export type SubmitPublicComplaintPayload = {
  product_id: string;
  batch_id: string;
  outlet_id?: string | null;
  /** Selected complaint_master_templates.id */
  template_id: string;
  raw_text: string;
  field_answers: Record<string, string>;
  severity_user_rated?: number | null;
  photo_paths?: string[];
  contact_phone?: string | null;
  contact_email?: string | null;
  device_fingerprint?: string | null;
  source?: "public_qr";
};

export type SubmitPublicComplaintResult = {
  ok: true;
  tracking_code: string;
  public_complaint_id: string;
  hinza_complaint_id: string | null;
  flagged_for_review: boolean;
};

export type CreateUploadUrlResult = {
  ok: true;
  path: string;
  token: string;
  signed_url: string;
};
