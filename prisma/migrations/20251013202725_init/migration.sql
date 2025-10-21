-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'therapist',
    "specialty" TEXT,
    "license_number" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "tax_id" TEXT,
    "billing_contact_name" TEXT,
    "billing_contact_email" TEXT,
    "billing_contact_phone" TEXT,
    "employee_count" INTEGER NOT NULL DEFAULT 0,
    "active_contracts_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "contract_name" TEXT NOT NULL,
    "contract_number" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "cost_per_session" DECIMAL(10,2) NOT NULL,
    "monthly_limit" DECIMAL(10,2),
    "payment_frequency" TEXT NOT NULL DEFAULT 'monthly',
    "status" TEXT NOT NULL DEFAULT 'active',
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "renewal_notice_days" INTEGER NOT NULL DEFAULT 30,
    "notes" TEXT,
    "attachment_url" TEXT,
    "send_renewal_notification" BOOLEAN NOT NULL DEFAULT true,
    "last_renewal_notification_sent" TIMESTAMPTZ(6),
    "billing_email" TEXT,
    "terms_accepted_at" TIMESTAMPTZ(6),
    "terms_accepted_by" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" TEXT NOT NULL,
    "company_id" UUID,
    "company_name" TEXT,
    "occupation" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "emergency_contact_name" TEXT NOT NULL,
    "emergency_contact_relationship" TEXT,
    "emergency_contact_phone" TEXT NOT NULL,
    "marital_status" TEXT,
    "education_level" TEXT,
    "nationality" TEXT,
    "religion" TEXT,
    "living_situation" TEXT,
    "has_children" BOOLEAN NOT NULL DEFAULT false,
    "children_count" INTEGER NOT NULL DEFAULT 0,
    "primary_therapist_id" UUID,
    "therapy_type" TEXT NOT NULL,
    "referred_by" TEXT,
    "referral_source" TEXT,
    "reason_for_therapy" TEXT NOT NULL,
    "therapeutic_goals" TEXT,
    "expectations" TEXT,
    "previous_therapy" BOOLEAN NOT NULL DEFAULT false,
    "previous_therapy_details" TEXT,
    "current_medications" TEXT,
    "allergies" TEXT,
    "medical_conditions" TEXT,
    "psychiatric_diagnoses" TEXT,
    "family_psychiatric_history" TEXT,
    "substance_use" TEXT,
    "risk_assessment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "discharge_date" DATE,
    "discharge_reason" TEXT,
    "consent_signed" BOOLEAN NOT NULL DEFAULT false,
    "consent_date" DATE,
    "privacy_notice_accepted" BOOLEAN NOT NULL DEFAULT false,
    "photo_url" TEXT,
    "preferred_contact_method" TEXT,
    "preferred_language" TEXT NOT NULL DEFAULT 'es',
    "insurance_provider" TEXT,
    "insurance_policy_number" TEXT,
    "insurance_valid_until" DATE,
    "notes" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size_kb" INTEGER,
    "mime_type" TEXT,
    "description" TEXT,
    "is_confidential" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "therapist_id" UUID,
    "session_number" INTEGER,
    "session_date" TIMESTAMPTZ(6) NOT NULL,
    "session_duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "session_type" TEXT NOT NULL,
    "session_modality" TEXT NOT NULL DEFAULT 'in_person',
    "appointment_type" TEXT,
    "meet_link" TEXT,
    "location_address" TEXT,
    "session_cost" DECIMAL(10,2) NOT NULL,
    "billing_type" TEXT NOT NULL DEFAULT 'direct',
    "contract_id" UUID,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_date" DATE,
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "session_notes" TEXT,
    "progress_notes" TEXT,
    "interventions" TEXT,
    "homework_assigned" TEXT,
    "next_session_plan" TEXT,
    "risk_level" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "confirmed_at" TIMESTAMPTZ(6),
    "confirmed_by" TEXT,
    "reminders_sent" INTEGER NOT NULL DEFAULT 0,
    "last_reminder_sent_at" TIMESTAMPTZ(6),
    "cancelled_reason" TEXT,
    "cancelled_by" UUID,
    "cancelled_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monthly_contract_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contract_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "report_month" INTEGER NOT NULL,
    "report_year" INTEGER NOT NULL,
    "period_start_date" DATE NOT NULL,
    "period_end_date" DATE NOT NULL,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "total_patients" INTEGER NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "invoice_number" TEXT,
    "invoice_date" DATE,
    "due_date" DATE,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid_at" TIMESTAMPTZ(6),
    "paid_by" UUID,
    "payment_reference" TEXT,
    "payment_method" TEXT,
    "sent_to_company_at" TIMESTAMPTZ(6),
    "sent_by" UUID,
    "pdf_url" TEXT,
    "notes" TEXT,
    "generated_by" UUID,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_contract_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monthly_report_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "patient_name" TEXT NOT NULL,
    "therapist_id" UUID,
    "therapist_name" TEXT,
    "session_date" TIMESTAMPTZ(6) NOT NULL,
    "session_type" TEXT NOT NULL,
    "session_cost" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_report_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "related_entity_type" TEXT,
    "related_entity_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "action_url" TEXT,
    "action_label" TEXT,
    "metadata" JSONB,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assigned_to" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "related_entity_type" TEXT,
    "related_entity_id" UUID,
    "due_date" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "tags" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clinical_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "therapist_id" UUID NOT NULL,
    "subjective_note" TEXT,
    "objective_note" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "mood_assessment" TEXT,
    "anxiety_level" INTEGER,
    "depression_level" INTEGER,
    "risk_level" TEXT,
    "risk_notes" TEXT,
    "progress_rating" INTEGER,
    "treatment_adherence" TEXT,
    "interventions_used" TEXT[],
    "homework_assigned" TEXT,
    "homework_completion" TEXT,
    "is_confidential" BOOLEAN NOT NULL DEFAULT true,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "template_name" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."therapeutic_goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "therapist_id" UUID,
    "goal_title" TEXT NOT NULL,
    "goal_description" TEXT,
    "goal_category" TEXT,
    "target_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "specific_criteria" TEXT,
    "measurable_criteria" TEXT,
    "achievable_notes" TEXT,
    "relevant_notes" TEXT,
    "time_bound_date" DATE,
    "last_reviewed_at" TIMESTAMPTZ(6),
    "achieved_at" TIMESTAMPTZ(6),
    "abandoned_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "therapeutic_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."therapist_availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "therapist_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "location" TEXT,
    "effective_from" DATE NOT NULL,
    "effective_until" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "therapist_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment_reminders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "reminder_type" TEXT NOT NULL,
    "scheduled_for" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMPTZ(6),
    "message_template" TEXT,
    "message_sent" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID,
    "patient_id" UUID,
    "contract_id" UUID,
    "report_id" UUID,
    "transaction_type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "exchange_rate" DECIMAL(10,4) NOT NULL DEFAULT 1.0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "bank_name" TEXT,
    "account_last_four" TEXT,
    "authorization_code" TEXT,
    "notes" TEXT,
    "processed_by" UUID,
    "transaction_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."diagnoses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "therapist_id" UUID,
    "session_id" UUID,
    "diagnosis_code" TEXT,
    "diagnosis_name" TEXT NOT NULL,
    "diagnosis_category" TEXT,
    "diagnosis_type" TEXT,
    "severity" TEXT,
    "diagnosed_at" DATE NOT NULL,
    "resolved_at" DATE,
    "clinical_notes" TEXT,
    "treatment_plan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID,
    "template_name" TEXT NOT NULL,
    "template_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "setting_key" TEXT NOT NULL,
    "setting_value" JSONB NOT NULL,
    "setting_type" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "changes" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_techniques" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "clinical_note_id" UUID,
    "technique_name" TEXT NOT NULL,
    "technique_category" TEXT,
    "effectiveness_rating" INTEGER,
    "patient_response" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_techniques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_emergency_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "contact_name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "email" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "patient_id" UUID,
    "employee_name" TEXT NOT NULL,
    "employee_email" TEXT,
    "employee_id_number" TEXT,
    "department" TEXT,
    "position" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" DATE,
    "end_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "public"."user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "public"."companies"("email");

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "public"."companies"("name");

-- CreateIndex
CREATE INDEX "companies_email_idx" ON "public"."companies"("email");

-- CreateIndex
CREATE INDEX "companies_is_active_idx" ON "public"."companies"("is_active");

-- CreateIndex
CREATE INDEX "companies_created_by_idx" ON "public"."companies"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contract_number_key" ON "public"."contracts"("contract_number");

-- CreateIndex
CREATE INDEX "contracts_company_id_idx" ON "public"."contracts"("company_id");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "public"."contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_end_date_idx" ON "public"."contracts"("end_date");

-- CreateIndex
CREATE INDEX "contracts_contract_number_idx" ON "public"."contracts"("contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "public"."patients"("email");

-- CreateIndex
CREATE INDEX "patients_name_idx" ON "public"."patients"("name");

-- CreateIndex
CREATE INDEX "patients_email_idx" ON "public"."patients"("email");

-- CreateIndex
CREATE INDEX "patients_company_id_idx" ON "public"."patients"("company_id");

-- CreateIndex
CREATE INDEX "patients_primary_therapist_id_idx" ON "public"."patients"("primary_therapist_id");

-- CreateIndex
CREATE INDEX "patients_status_idx" ON "public"."patients"("status");

-- CreateIndex
CREATE INDEX "patients_birth_date_idx" ON "public"."patients"("birth_date");

-- CreateIndex
CREATE INDEX "patient_attachments_patient_id_idx" ON "public"."patient_attachments"("patient_id");

-- CreateIndex
CREATE INDEX "patient_attachments_file_type_idx" ON "public"."patient_attachments"("file_type");

-- CreateIndex
CREATE INDEX "patient_attachments_uploaded_by_idx" ON "public"."patient_attachments"("uploaded_by");

-- CreateIndex
CREATE INDEX "sessions_patient_id_idx" ON "public"."sessions"("patient_id");

-- CreateIndex
CREATE INDEX "sessions_therapist_id_idx" ON "public"."sessions"("therapist_id");

-- CreateIndex
CREATE INDEX "sessions_contract_id_idx" ON "public"."sessions"("contract_id");

-- CreateIndex
CREATE INDEX "sessions_session_date_idx" ON "public"."sessions"("session_date");

-- CreateIndex
CREATE INDEX "sessions_status_idx" ON "public"."sessions"("status");

-- CreateIndex
CREATE INDEX "sessions_payment_status_idx" ON "public"."sessions"("payment_status");

-- CreateIndex
CREATE INDEX "sessions_billing_type_idx" ON "public"."sessions"("billing_type");

-- CreateIndex
CREATE INDEX "sessions_appointment_type_idx" ON "public"."sessions"("appointment_type");

-- CreateIndex
CREATE INDEX "monthly_contract_reports_contract_id_idx" ON "public"."monthly_contract_reports"("contract_id");

-- CreateIndex
CREATE INDEX "monthly_contract_reports_company_id_idx" ON "public"."monthly_contract_reports"("company_id");

-- CreateIndex
CREATE INDEX "monthly_contract_reports_report_year_report_month_idx" ON "public"."monthly_contract_reports"("report_year", "report_month");

-- CreateIndex
CREATE INDEX "monthly_contract_reports_payment_status_idx" ON "public"."monthly_contract_reports"("payment_status");

-- CreateIndex
CREATE INDEX "monthly_contract_reports_due_date_idx" ON "public"."monthly_contract_reports"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_contract_reports_contract_id_report_month_report_ye_key" ON "public"."monthly_contract_reports"("contract_id", "report_month", "report_year");

-- CreateIndex
CREATE INDEX "monthly_report_sessions_report_id_idx" ON "public"."monthly_report_sessions"("report_id");

-- CreateIndex
CREATE INDEX "monthly_report_sessions_session_id_idx" ON "public"."monthly_report_sessions"("session_id");

-- CreateIndex
CREATE INDEX "monthly_report_sessions_patient_id_idx" ON "public"."monthly_report_sessions"("patient_id");

-- CreateIndex
CREATE INDEX "monthly_report_sessions_session_date_idx" ON "public"."monthly_report_sessions"("session_date");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_report_sessions_report_id_session_id_key" ON "public"."monthly_report_sessions"("report_id", "session_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "public"."notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "public"."notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "public"."notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "public"."notifications"("created_at");

-- CreateIndex
CREATE INDEX "tasks_assigned_to_idx" ON "public"."tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "public"."tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "public"."tasks"("due_date");

-- CreateIndex
CREATE INDEX "tasks_priority_idx" ON "public"."tasks"("priority");

-- CreateIndex
CREATE INDEX "tasks_related_entity_type_related_entity_id_idx" ON "public"."tasks"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "clinical_notes_session_id_idx" ON "public"."clinical_notes"("session_id");

-- CreateIndex
CREATE INDEX "clinical_notes_patient_id_idx" ON "public"."clinical_notes"("patient_id");

-- CreateIndex
CREATE INDEX "clinical_notes_therapist_id_idx" ON "public"."clinical_notes"("therapist_id");

-- CreateIndex
CREATE INDEX "clinical_notes_risk_level_idx" ON "public"."clinical_notes"("risk_level");

-- CreateIndex
CREATE INDEX "therapeutic_goals_patient_id_idx" ON "public"."therapeutic_goals"("patient_id");

-- CreateIndex
CREATE INDEX "therapeutic_goals_status_idx" ON "public"."therapeutic_goals"("status");

-- CreateIndex
CREATE INDEX "therapeutic_goals_therapist_id_idx" ON "public"."therapeutic_goals"("therapist_id");

-- CreateIndex
CREATE INDEX "therapist_availability_therapist_id_idx" ON "public"."therapist_availability"("therapist_id");

-- CreateIndex
CREATE INDEX "therapist_availability_day_of_week_idx" ON "public"."therapist_availability"("day_of_week");

-- CreateIndex
CREATE INDEX "therapist_availability_effective_from_effective_until_idx" ON "public"."therapist_availability"("effective_from", "effective_until");

-- CreateIndex
CREATE INDEX "appointment_reminders_session_id_idx" ON "public"."appointment_reminders"("session_id");

-- CreateIndex
CREATE INDEX "appointment_reminders_patient_id_idx" ON "public"."appointment_reminders"("patient_id");

-- CreateIndex
CREATE INDEX "appointment_reminders_scheduled_for_idx" ON "public"."appointment_reminders"("scheduled_for");

-- CreateIndex
CREATE INDEX "appointment_reminders_status_idx" ON "public"."appointment_reminders"("status");

-- CreateIndex
CREATE INDEX "payment_transactions_session_id_idx" ON "public"."payment_transactions"("session_id");

-- CreateIndex
CREATE INDEX "payment_transactions_patient_id_idx" ON "public"."payment_transactions"("patient_id");

-- CreateIndex
CREATE INDEX "payment_transactions_contract_id_idx" ON "public"."payment_transactions"("contract_id");

-- CreateIndex
CREATE INDEX "payment_transactions_transaction_date_idx" ON "public"."payment_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "public"."payment_transactions"("status");

-- CreateIndex
CREATE INDEX "diagnoses_patient_id_idx" ON "public"."diagnoses"("patient_id");

-- CreateIndex
CREATE INDEX "diagnoses_therapist_id_idx" ON "public"."diagnoses"("therapist_id");

-- CreateIndex
CREATE INDEX "diagnoses_is_active_idx" ON "public"."diagnoses"("is_active");

-- CreateIndex
CREATE INDEX "diagnoses_diagnosis_code_idx" ON "public"."diagnoses"("diagnosis_code");

-- CreateIndex
CREATE INDEX "document_templates_template_type_idx" ON "public"."document_templates"("template_type");

-- CreateIndex
CREATE INDEX "document_templates_is_public_idx" ON "public"."document_templates"("is_public");

-- CreateIndex
CREATE INDEX "document_templates_created_by_idx" ON "public"."document_templates"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_setting_key_key" ON "public"."system_settings"("setting_key");

-- CreateIndex
CREATE INDEX "system_settings_setting_key_idx" ON "public"."system_settings"("setting_key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "public"."system_settings"("category");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "public"."audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "public"."audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "public"."audit_log"("created_at");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "public"."audit_log"("action");

-- CreateIndex
CREATE INDEX "session_techniques_session_id_idx" ON "public"."session_techniques"("session_id");

-- CreateIndex
CREATE INDEX "session_techniques_technique_category_idx" ON "public"."session_techniques"("technique_category");

-- CreateIndex
CREATE INDEX "session_techniques_technique_name_idx" ON "public"."session_techniques"("technique_name");

-- CreateIndex
CREATE INDEX "patient_emergency_contacts_patient_id_idx" ON "public"."patient_emergency_contacts"("patient_id");

-- CreateIndex
CREATE INDEX "patient_emergency_contacts_patient_id_is_primary_idx" ON "public"."patient_emergency_contacts"("patient_id", "is_primary");

-- CreateIndex
CREATE INDEX "company_employees_company_id_idx" ON "public"."company_employees"("company_id");

-- CreateIndex
CREATE INDEX "company_employees_patient_id_idx" ON "public"."company_employees"("patient_id");

-- CreateIndex
CREATE INDEX "company_employees_is_active_idx" ON "public"."company_employees"("is_active");

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patients" ADD CONSTRAINT "patients_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patients" ADD CONSTRAINT "patients_primary_therapist_id_fkey" FOREIGN KEY ("primary_therapist_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patients" ADD CONSTRAINT "patients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patients" ADD CONSTRAINT "patients_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_attachments" ADD CONSTRAINT "patient_attachments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_attachments" ADD CONSTRAINT "patient_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_contract_reports" ADD CONSTRAINT "monthly_contract_reports_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_contract_reports" ADD CONSTRAINT "monthly_contract_reports_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_contract_reports" ADD CONSTRAINT "monthly_contract_reports_paid_by_fkey" FOREIGN KEY ("paid_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_contract_reports" ADD CONSTRAINT "monthly_contract_reports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_contract_reports" ADD CONSTRAINT "monthly_contract_reports_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_report_sessions" ADD CONSTRAINT "monthly_report_sessions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."monthly_contract_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_report_sessions" ADD CONSTRAINT "monthly_report_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_report_sessions" ADD CONSTRAINT "monthly_report_sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_report_sessions" ADD CONSTRAINT "monthly_report_sessions_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clinical_notes" ADD CONSTRAINT "clinical_notes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clinical_notes" ADD CONSTRAINT "clinical_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clinical_notes" ADD CONSTRAINT "clinical_notes_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."therapeutic_goals" ADD CONSTRAINT "therapeutic_goals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."therapeutic_goals" ADD CONSTRAINT "therapeutic_goals_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."therapist_availability" ADD CONSTRAINT "therapist_availability_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_reminders" ADD CONSTRAINT "appointment_reminders_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_reminders" ADD CONSTRAINT "appointment_reminders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."monthly_contract_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diagnoses" ADD CONSTRAINT "diagnoses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diagnoses" ADD CONSTRAINT "diagnoses_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diagnoses" ADD CONSTRAINT "diagnoses_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_templates" ADD CONSTRAINT "document_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_settings" ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_techniques" ADD CONSTRAINT "session_techniques_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_techniques" ADD CONSTRAINT "session_techniques_clinical_note_id_fkey" FOREIGN KEY ("clinical_note_id") REFERENCES "public"."clinical_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_emergency_contacts" ADD CONSTRAINT "patient_emergency_contacts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_employees" ADD CONSTRAINT "company_employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_employees" ADD CONSTRAINT "company_employees_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
