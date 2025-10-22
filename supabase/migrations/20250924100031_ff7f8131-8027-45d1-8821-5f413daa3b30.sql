-- Fix User Personal Information Security Issue
-- Implement field-level encryption for sensitive PII data

-- 1. Enable pgcrypto extension for encryption capabilities
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create encrypted columns for sensitive data
-- Add new encrypted columns alongside existing ones
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS codice_fiscale_encrypted TEXT,
ADD COLUMN IF NOT EXISTS dati_spid_encrypted TEXT;

-- 3. Create encryption/decryption functions with proper key management
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(
  _data TEXT,
  _field_type TEXT DEFAULT 'general'
) RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Use different keys for different types of sensitive data
  CASE _field_type
    WHEN 'codice_fiscale' THEN
      encryption_key := COALESCE(current_setting('app.cf_encryption_key', true), 'cf_default_key_change_in_production');
    WHEN 'spid_data' THEN  
      encryption_key := COALESCE(current_setting('app.spid_encryption_key', true), 'spid_default_key_change_in_production');
    ELSE
      encryption_key := COALESCE(current_setting('app.general_encryption_key', true), 'general_default_key_change_in_production');
  END CASE;
  
  -- Return encrypted data using AES
  RETURN encode(encrypt(_data::bytea, encryption_key::bytea, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(
  _encrypted_data TEXT,
  _field_type TEXT DEFAULT 'general'
) RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
  decrypted_data TEXT;
BEGIN
  IF _encrypted_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Use same keys as encryption function
  CASE _field_type
    WHEN 'codice_fiscale' THEN
      encryption_key := COALESCE(current_setting('app.cf_encryption_key', true), 'cf_default_key_change_in_production');
    WHEN 'spid_data' THEN  
      encryption_key := COALESCE(current_setting('app.spid_encryption_key', true), 'spid_default_key_change_in_production');
    ELSE
      encryption_key := COALESCE(current_setting('app.general_encryption_key', true), 'general_default_key_change_in_production');
  END CASE;
  
  -- Decrypt and return data
  BEGIN
    decrypted_data := convert_from(decrypt(decode(_encrypted_data, 'base64'), encryption_key::bytea, 'aes'), 'UTF8');
    RETURN decrypted_data;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log decryption failure but don't expose details
      PERFORM public.log_security_event(
        'decryption_failure',
        auth.uid()::TEXT,
        jsonb_build_object(
          'field_type', _field_type,
          'error', 'Decryption failed'
        ),
        'critical'
      );
      RETURN '[DECRYPTION_ERROR]';
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create secure functions to access encrypted data
CREATE OR REPLACE FUNCTION public.get_codice_fiscale_decrypted(
  _profile_id UUID
) RETURNS TEXT AS $$
DECLARE
  encrypted_cf TEXT;
  legacy_cf TEXT;
  decrypted_cf TEXT;
BEGIN
  -- Only allow users to access their own CF or admins with proper justification
  IF NOT (auth.uid() = _profile_id OR is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Insufficient privileges for codice fiscale access';
  END IF;
  
  -- Log the access attempt
  PERFORM public.log_security_event(
    'codice_fiscale_access',
    _profile_id::TEXT,
    jsonb_build_object(
      'accessed_by', auth.uid(),
      'access_type', CASE WHEN auth.uid() = _profile_id THEN 'self' ELSE 'admin' END
    ),
    'warning'
  );
  
  -- Get both encrypted and legacy data
  SELECT codice_fiscale_encrypted, codice_fiscale 
  INTO encrypted_cf, legacy_cf
  FROM public.profiles 
  WHERE id = _profile_id;
  
  -- Return encrypted version if available, otherwise legacy
  IF encrypted_cf IS NOT NULL THEN
    RETURN public.decrypt_sensitive_data(encrypted_cf, 'codice_fiscale');
  ELSE
    RETURN legacy_cf; -- For backward compatibility during migration
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_spid_data_decrypted(
  _profile_id UUID
) RETURNS JSONB AS $$
DECLARE
  encrypted_spid TEXT;
  legacy_spid JSONB;
  decrypted_spid TEXT;
BEGIN
  -- Only allow users to access their own SPID data or admins with proper justification
  IF NOT (auth.uid() = _profile_id OR is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Insufficient privileges for SPID data access';
  END IF;
  
  -- Log the access attempt
  PERFORM public.log_security_event(
    'spid_data_access',
    _profile_id::TEXT,
    jsonb_build_object(
      'accessed_by', auth.uid(),
      'access_type', CASE WHEN auth.uid() = _profile_id THEN 'self' ELSE 'admin' END
    ),
    'warning'
  );
  
  -- Get both encrypted and legacy data
  SELECT dati_spid_encrypted, dati_spid 
  INTO encrypted_spid, legacy_spid
  FROM public.profiles 
  WHERE id = _profile_id;
  
  -- Return encrypted version if available, otherwise legacy
  IF encrypted_spid IS NOT NULL THEN
    decrypted_spid := public.decrypt_sensitive_data(encrypted_spid, 'spid_data');
    IF decrypted_spid != '[DECRYPTION_ERROR]' THEN
      RETURN decrypted_spid::JSONB;
    END IF;
  END IF;
  
  RETURN legacy_spid; -- For backward compatibility during migration
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Create secure update functions for encrypted data
CREATE OR REPLACE FUNCTION public.update_codice_fiscale_encrypted(
  _profile_id UUID,
  _new_codice_fiscale TEXT
) RETURNS VOID AS $$
BEGIN
  -- Only allow users to update their own CF or admins
  IF NOT (auth.uid() = _profile_id OR is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Insufficient privileges';
  END IF;
  
  -- Validate codice fiscale format
  IF NOT (_new_codice_fiscale ~ '^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$') THEN
    RAISE EXCEPTION 'Invalid codice fiscale format';
  END IF;
  
  -- Log the update
  PERFORM public.log_security_event(
    'codice_fiscale_update',
    _profile_id::TEXT,
    jsonb_build_object(
      'updated_by', auth.uid()
    ),
    'warning'
  );
  
  -- Update with encrypted data
  UPDATE public.profiles 
  SET 
    codice_fiscale_encrypted = public.encrypt_sensitive_data(_new_codice_fiscale, 'codice_fiscale'),
    codice_fiscale = NULL, -- Clear legacy field
    updated_at = NOW()
  WHERE id = _profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_spid_data_encrypted(
  _profile_id UUID,
  _new_spid_data JSONB
) RETURNS VOID AS $$
BEGIN
  -- Only allow system or admin updates for SPID data
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for SPID data updates';
  END IF;
  
  -- Log the update
  PERFORM public.log_security_event(
    'spid_data_update',
    _profile_id::TEXT,
    jsonb_build_object(
      'updated_by', auth.uid()
    ),
    'warning'
  );
  
  -- Update with encrypted data
  UPDATE public.profiles 
  SET 
    dati_spid_encrypted = public.encrypt_sensitive_data(_new_spid_data::TEXT, 'spid_data'),
    dati_spid = NULL, -- Clear legacy field
    updated_at = NOW()
  WHERE id = _profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Create migration function to encrypt existing data
CREATE OR REPLACE FUNCTION public.migrate_to_encrypted_fields() RETURNS INTEGER AS $$
DECLARE
  profile_record RECORD;
  migrated_count INTEGER := 0;
BEGIN
  -- Only admins can run migration
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for migration';
  END IF;
  
  -- Log migration start
  PERFORM public.log_security_event(
    'encryption_migration_start',
    NULL,
    jsonb_build_object(
      'started_by', auth.uid()
    ),
    'warning'
  );
  
  -- Migrate existing codice_fiscale data
  FOR profile_record IN 
    SELECT id, codice_fiscale, dati_spid 
    FROM public.profiles 
    WHERE (codice_fiscale IS NOT NULL AND codice_fiscale_encrypted IS NULL)
       OR (dati_spid IS NOT NULL AND dati_spid_encrypted IS NULL)
  LOOP
    -- Encrypt codice_fiscale if exists and not already encrypted
    IF profile_record.codice_fiscale IS NOT NULL THEN
      UPDATE public.profiles 
      SET codice_fiscale_encrypted = public.encrypt_sensitive_data(profile_record.codice_fiscale, 'codice_fiscale')
      WHERE id = profile_record.id;
    END IF;
    
    -- Encrypt SPID data if exists and not already encrypted
    IF profile_record.dati_spid IS NOT NULL THEN
      UPDATE public.profiles 
      SET dati_spid_encrypted = public.encrypt_sensitive_data(profile_record.dati_spid::TEXT, 'spid_data')
      WHERE id = profile_record.id;
    END IF;
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  -- Log migration completion
  PERFORM public.log_security_event(
    'encryption_migration_complete',
    NULL,
    jsonb_build_object(
      'completed_by', auth.uid(),
      'profiles_migrated', migrated_count
    ),
    'info'
  );
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Update existing secure access functions to use encrypted data
CREATE OR REPLACE FUNCTION public.get_profile_masked(
  _profile_id UUID
) RETURNS TABLE(
  id UUID,
  nome TEXT,
  cognome TEXT,
  email TEXT,
  codice_fiscale_masked TEXT,
  provider_autenticazione TEXT,
  enabled BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  ultimo_accesso_spid TIMESTAMP WITH TIME ZONE,
  livello_autenticazione_spid TEXT,
  disabled_at TIMESTAMP WITH TIME ZONE,
  disabled_by UUID,
  disable_reason TEXT
) AS $$
DECLARE
  full_codice_fiscale TEXT;
BEGIN
  -- Allow users to see their own profile or admins to see any profile
  IF NOT (auth.uid() = _profile_id OR is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Insufficient privileges';
  END IF;
  
  -- Log the access attempt
  PERFORM public.log_profile_access(_profile_id, 
    CASE WHEN auth.uid() = _profile_id THEN 'self_view' ELSE 'admin_view' END
  );
  
  -- Get the decrypted codice fiscale
  full_codice_fiscale := public.get_codice_fiscale_decrypted(_profile_id);
  
  -- Return the masked profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.cognome,
    p.email,
    CASE 
      WHEN auth.uid() = _profile_id THEN full_codice_fiscale -- Users can see their own full CF
      ELSE public.mask_sensitive_data(full_codice_fiscale, FALSE) -- Admins see masked
    END as codice_fiscale_masked,
    p.provider_autenticazione,
    p.enabled,
    p.created_at,
    p.updated_at,
    p.ultimo_accesso_spid,
    p.livello_autenticazione_spid,
    p.disabled_at,
    p.disabled_by,
    p.disable_reason
  FROM public.profiles p
  WHERE p.id = _profile_id AND p.enabled = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;