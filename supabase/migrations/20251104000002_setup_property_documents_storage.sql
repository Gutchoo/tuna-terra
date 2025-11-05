-- Create storage bucket for property documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false, -- private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING; -- Skip if bucket already exists

-- Note: get_user_portfolio_role function already exists from a previous migration

-- RLS Policy: SELECT on storage.objects (all portfolio members can view)
CREATE POLICY "Portfolio members can view property documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'property-documents'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.user_accessible_portfolios
    WHERE user_accessible_portfolios.owner_id = auth.uid()
       OR user_accessible_portfolios.id IN (
         SELECT portfolio_id FROM public.portfolio_memberships
         WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
       )
  )
);

-- RLS Policy: INSERT on storage.objects (owner/editor can upload)
CREATE POLICY "Owner and editor can upload property documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-documents'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT p.id FROM public.portfolios p
    WHERE (
      p.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.portfolio_memberships pm
        WHERE pm.portfolio_id = p.id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
          AND pm.accepted_at IS NOT NULL
      )
    )
  )
);

-- RLS Policy: DELETE on storage.objects (owner/editor can delete)
CREATE POLICY "Owner and editor can delete property documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'property-documents'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT p.id FROM public.portfolios p
    WHERE (
      p.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.portfolio_memberships pm
        WHERE pm.portfolio_id = p.id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
          AND pm.accepted_at IS NOT NULL
      )
    )
  )
);

-- RLS Policy: SELECT on property_documents (all portfolio members)
CREATE POLICY "Portfolio members can view document records"
ON public.property_documents FOR SELECT TO authenticated
USING (
  portfolio_id IN (
    SELECT id FROM public.user_accessible_portfolios
    WHERE owner_id = auth.uid()
       OR id IN (
         SELECT portfolio_id FROM public.portfolio_memberships
         WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
       )
  )
);

-- RLS Policy: INSERT on property_documents (owner/editor)
CREATE POLICY "Owner and editor can create document records"
ON public.property_documents FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND portfolio_id IN (
    SELECT p.id FROM public.portfolios p
    WHERE (
      p.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.portfolio_memberships pm
        WHERE pm.portfolio_id = p.id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
          AND pm.accepted_at IS NOT NULL
      )
    )
  )
);

-- RLS Policy: DELETE on property_documents (owner/editor)
CREATE POLICY "Owner and editor can delete document records"
ON public.property_documents FOR DELETE TO authenticated
USING (
  portfolio_id IN (
    SELECT p.id FROM public.portfolios p
    WHERE (
      p.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.portfolio_memberships pm
        WHERE pm.portfolio_id = p.id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
          AND pm.accepted_at IS NOT NULL
      )
    )
  )
);

-- RLS Policy: UPDATE on property_documents (owner/editor for metadata)
CREATE POLICY "Owner and editor can update document metadata"
ON public.property_documents FOR UPDATE TO authenticated
USING (
  portfolio_id IN (
    SELECT p.id FROM public.portfolios p
    WHERE (
      p.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.portfolio_memberships pm
        WHERE pm.portfolio_id = p.id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
          AND pm.accepted_at IS NOT NULL
      )
    )
  )
);

-- Enable RLS on property_documents table
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
