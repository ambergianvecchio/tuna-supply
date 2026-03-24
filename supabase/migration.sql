-- ============================================
-- Tuna Supply — Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================

-- Vet Records
CREATE TABLE IF NOT EXISTS vet_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('visit', 'vaccine', 'medication', 'note')),
  date DATE NOT NULL,
  vet_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications (linked to vet records)
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  vet_record_id UUID REFERENCES vet_records(id) ON DELETE CASCADE
);

-- Vaccines (linked to vet records)
CREATE TABLE IF NOT EXISTS vaccines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date_given DATE,
  next_due_date DATE,
  vet_record_id UUID REFERENCES vet_records(id) ON DELETE CASCADE
);

-- Symptom Logs
CREATE TABLE IF NOT EXISTS symptom_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  triage_level TEXT,
  triage_explanation TEXT,
  triage_monitor_list TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Current Diet (what the cat currently eats)
CREATE TABLE IF NOT EXISTS current_diet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  brand TEXT,
  amount TEXT,
  ingredients TEXT,
  analysis TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cat Profile (stores photo URL)
CREATE TABLE IF NOT EXISTS cat_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (allow all — single user app)
-- ============================================

ALTER TABLE vet_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_diet ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON current_diet FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON vet_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON vaccines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON symptom_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON cat_profile FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Storage bucket for profile photos
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('cat-profile', 'cat-profile', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'cat-profile');

CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cat-profile');

CREATE POLICY "Allow updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'cat-profile');

CREATE POLICY "Allow deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'cat-profile');
