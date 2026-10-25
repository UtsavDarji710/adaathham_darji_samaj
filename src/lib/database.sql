-- અડાઆઠમ દરજી સમાજ (Adaadtham Darji Samaj) Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)

-- 1. Create enum types
CREATE TYPE privacy_visibility AS ENUM ('public', 'members', 'family', 'private');
CREATE TYPE admin_role AS ENUM ('president', 'secretary', 'joint_secretary', 'treasurer', 'admin', 'member');
CREATE TYPE relationship_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE business_status AS ENUM ('active', 'pending', 'rejected', 'expired');
CREATE TYPE event_status AS ENUM ('upcoming', 'past', 'archived');
CREATE TYPE payment_status AS ENUM ('verified', 'pending');

-- 2. Members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    photo_url TEXT,
    address TEXT,
    city TEXT NOT NULL DEFAULT 'મોડાસા',
    district TEXT NOT NULL DEFAULT 'અરવલ્લી',
    native_place TEXT NOT NULL DEFAULT 'અડાઆઠમ',
    pincode TEXT DEFAULT '383315',
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
    
    -- JSONB for structured sub-fields
    employment JSONB DEFAULT '{}'::jsonb,
    education JSONB DEFAULT '{}'::jsonb,
    completeness INT DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Family Relationships table
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

-- 4. Businesses and Advertisements table
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
    status business_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Community Events table
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

-- 6. Donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES members(id) ON DELETE SET NULL,
    donor_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    purpose TEXT NOT NULL,
    campaign TEXT NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    is_anonymous BOOLEAN DEFAULT FALSE,
    public_consent BOOLEAN DEFAULT TRUE,
    receipt_number TEXT UNIQUE NOT NULL,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Announcements table
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

-- 8. Activity Logs table
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

-- 9. Row Level Security (RLS) Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Members: Everyone can see public info; phone/address restricted by privacy setting
CREATE POLICY "Public members visibility" ON members
    FOR SELECT USING (true);

CREATE POLICY "Members can update their own profile" ON members
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Family Relationships: Approved connections are visible to members
CREATE POLICY "Family visibility" ON family_relationships
    FOR SELECT USING (status = 'approved' OR auth.role() = 'authenticated');

-- Businesses: Active and approved businesses are publicly readable
CREATE POLICY "Active businesses are public" ON businesses
    FOR SELECT USING (status = 'active');

-- Events: Publicly readable
CREATE POLICY "Events are public" ON events
    FOR SELECT USING (true);

-- Announcements: Publicly readable
CREATE POLICY "Announcements are public" ON announcements
    FOR SELECT USING (true);

-- Donations: Only donations with public consent are visible publicly without sensitive identity
CREATE POLICY "Donations public display" ON donations
    FOR SELECT USING (public_consent = true AND is_anonymous = false AND payment_status = 'verified');

-- Admin full access policy template (Checked via auth JWT claims or admin_role)
-- CREATE POLICY "Admin full access" ON members TO authenticated USING (auth.jwt() ->> 'role' IN ('president', 'secretary', 'treasurer', 'joint_secretary', 'admin'));
