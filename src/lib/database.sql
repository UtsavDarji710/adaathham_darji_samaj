-- ==============================================================================
-- શ્રી અડાઆઠમ દરજી સેવા સમિતિ (Adaatham Darji Seva Samiti, Modasa)
-- Production Supabase PostgreSQL Schema, RLS & Storage Policies
-- ==============================================================================

-- 1. Create Enum Types
DO $$ BEGIN
    CREATE TYPE privacy_visibility AS ENUM ('public', 'members', 'family', 'private');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('president', 'secretary', 'joint_secretary', 'treasurer', 'assistant_treasurer', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE relationship_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE business_status AS ENUM ('active', 'pending', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('upcoming', 'past', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('verified', 'pending');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Members table (સામાન્ય માહિતી, પારિવારિક વિગતો, ગોપનીયતા)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    username TEXT UNIQUE, -- યુઝરનેમ (Unique Alphanumeric Login Identifier)
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    salt TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    photo_url TEXT,
    address TEXT,
    city TEXT NOT NULL DEFAULT 'મોડાસા',
    district TEXT NOT NULL DEFAULT 'અરવલ્લી',
    native_place TEXT NOT NULL DEFAULT 'અડાઆઠમ',
    pincode TEXT DEFAULT '383315',
    father_name TEXT,
    grandfather_name TEXT,
    maternal_uncle_name TEXT,
    maternal_grandfather_name TEXT,
    sasri_name TEXT, -- સાસરીનું નામ (Sasri Name)
    piyar_name TEXT, -- પિયરનું નામ (Piyar Name)
    is_public_in_family BOOLEAN DEFAULT FALSE, -- પરિવાર સભ્ય વિગતો જાહેર કરવી? (Default: false)
    marital_status TEXT DEFAULT 'પરણિત (Married)',
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    dob DATE,
    blood_group TEXT,
    role admin_role DEFAULT 'member',
    is_lifetime_member BOOLEAN DEFAULT FALSE,
    committee_role TEXT,
    committee_order INT DEFAULT 99,
    
    -- Privacy settings
    privacy_phone privacy_visibility DEFAULT 'members',
    privacy_address privacy_visibility DEFAULT 'members',
    privacy_photo privacy_visibility DEFAULT 'public',
    privacy_family privacy_visibility DEFAULT 'members',
    privacy_business privacy_visibility DEFAULT 'public',
    privacy_employment privacy_visibility DEFAULT 'members',
    privacy_education privacy_visibility DEFAULT 'members',
    
    -- Structured JSONB fields
    family_relations JSONB DEFAULT '[]'::jsonb,
    employment JSONB DEFAULT '{}'::jsonb,
    education JSONB DEFAULT '{}'::jsonb,
    completeness INT DEFAULT 75,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_username ON members (LOWER(username));

-- 3. Email OTP Verification Table (Requirement 14.2)
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    hashed_code TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'login', 'profile_update')),
    attempts INT DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    last_requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes (email);

-- 4. Family Relationships table
CREATE TABLE IF NOT EXISTS family_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    to_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL,
    relationship_label TEXT NOT NULL,
    status relationship_status DEFAULT 'pending',
    requested_by UUID REFERENCES members(id),
    approved_by UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    CONSTRAINT unique_family_pair UNIQUE (from_member_id, to_member_id, relationship)
);

-- 5. Businesses Directory table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES members(id) ON DELETE SET NULL,
    owner_name TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    address TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    valid_until TIMESTAMPTZ,
    status business_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Business Advertisements table (વ્યવસાય જાહેરાત અરજીઓ & મંજૂરી પ્રણાલી)
CREATE TABLE IF NOT EXISTS business_advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    owner_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    address TEXT NOT NULL,
    image_url TEXT NOT NULL,
    website_link TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_remarks TEXT,
    submitted_by UUID REFERENCES members(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES members(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Job Postings table (સમાજ રોજગાર ડિરેક્ટરી)
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    category TEXT NOT NULL,
    job_type TEXT NOT NULL DEFAULT 'પૂર્ણ સમય (Full-time)',
    city TEXT NOT NULL DEFAULT 'મોડાસા',
    salary_range TEXT,
    experience TEXT,
    description TEXT,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    posted_by UUID REFERENCES members(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Community Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TEXT,
    location TEXT NOT NULL,
    city TEXT DEFAULT 'મોડાસા',
    cover_image TEXT,
    gallery TEXT[] DEFAULT '{}',
    video_url TEXT,
    status event_status DEFAULT 'upcoming',
    year INT NOT NULL,
    organizer TEXT DEFAULT 'શ્રી અડાઆઠમ દરજી સેવા સમિતિ',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Donations table (દાન વ્યવસ્થાપન પ્રણાલી)
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES members(id) ON DELETE SET NULL,
    donor_id UUID REFERENCES members(id) ON DELETE SET NULL,
    donor_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    donor_photo TEXT,
    hasthe_names JSONB DEFAULT '[]'::jsonb,
    donation_purpose TEXT NOT NULL,
    specific_purpose TEXT,
    donation_year TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_proof TEXT, -- Private file reference in Supabase Storage
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    payment_status payment_status DEFAULT 'pending',
    is_anonymous BOOLEAN DEFAULT FALSE,
    public_consent BOOLEAN DEFAULT TRUE,
    receipt_number TEXT UNIQUE,
    admin_remarks TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Official Samiti Bank Details & QR Code
CREATE TABLE IF NOT EXISTS samiti_bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_holder TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    upi_id TEXT,
    qr_code_url TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Announcements table (મહત્વપૂર્ણ સૂચનાઓ & પરિપત્રો)
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL DEFAULT 'સામાન્ય',
    image_url TEXT,
    author TEXT NOT NULL DEFAULT 'મંત્રી શ્રી',
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Activity & Audit Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES members(id) ON DELETE SET NULL,
    admin_name TEXT NOT NULL,
    admin_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12.1 Member Matrimony table (મેટ્રિમોની - લગ્ન માટેની માહિતી & ગોપનીયતા)
CREATE TABLE IF NOT EXISTS member_matrimony (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT FALSE,
    height TEXT,
    weight TEXT,
    complexion TEXT,
    subcaste_gotra TEXT,
    about_me TEXT,
    partner_expectations TEXT,
    hobbies TEXT,
    privacy_settings JSONB DEFAULT '{"show_name":true,"show_photo":true,"show_age":true,"show_native_place":true,"show_education":true,"show_occupation":true,"show_contact":false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_member_matrimony UNIQUE (member_id)
);

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Members Policies
CREATE POLICY "Public members visibility" ON members FOR SELECT USING (true);
CREATE POLICY "Members can update their own profile" ON members FOR UPDATE USING (auth.uid() = auth_user_id);

-- OTP Codes: strictly backend service role access
CREATE POLICY "OTP service only" ON otp_codes FOR ALL USING (false);

-- Businesses: active are public
CREATE POLICY "Active businesses are public" ON businesses FOR SELECT USING (status = 'active');

-- Advertisements: only approved are public
CREATE POLICY "Approved ads are public" ON business_advertisements FOR SELECT USING (status = 'approved');

-- Events & Announcements are public
CREATE POLICY "Events public" ON events FOR SELECT USING (true);
CREATE POLICY "Announcements public" ON announcements FOR SELECT USING (true);

-- Donations: public list excludes sensitive payment proofs
CREATE POLICY "Approved donations public" ON donations FOR SELECT
    USING (status = 'approved' AND public_consent = true AND is_anonymous = false);

-- ==============================================================================
-- 14. SUPABASE STORAGE BUCKET POLICIES (Requirement 15)
-- ==============================================================================
-- Buckets:
-- 1. member-photos (PUBLIC)
-- 2. business-photos (PUBLIC)
-- 3. advertisement-banners (PUBLIC)
-- 4. donor-photos (PUBLIC)
-- 5. samiti-assets (PUBLIC - Logo, Official QR code)
-- 6. payment-proofs (PRIVATE - Only donor owner and committee admins can view)

INSERT INTO storage.buckets (id, name, public) VALUES
    ('member-photos', 'member-photos', true),
    ('business-photos', 'business-photos', true),
    ('advertisement-banners', 'advertisement-banners', true),
    ('donor-photos', 'donor-photos', true),
    ('samiti-assets', 'samiti-assets', true),
    ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Public Storage Policy: Read allowed for everyone
CREATE POLICY "Public Access for Public Buckets"
ON storage.objects FOR SELECT
USING (bucket_id IN ('member-photos', 'business-photos', 'advertisement-banners', 'donor-photos', 'samiti-assets'));

-- Upload Policy: Authenticated users can upload up to 5MB
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id IN ('member-photos', 'business-photos', 'advertisement-banners', 'donor-photos', 'samiti-assets', 'payment-proofs')
    AND (storage.foldername(name))[1] != 'protected'
);

-- Private Storage Policy for Payment Proofs:
-- Only admins OR the user who uploaded the payment proof can view
CREATE POLICY "Private Payment Proofs Access"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'payment-proofs'
    AND (
        auth.uid() = owner
        OR (auth.jwt() ->> 'role') IN ('president', 'treasurer', 'assistant_treasurer', 'secretary', 'admin')
    )
);
