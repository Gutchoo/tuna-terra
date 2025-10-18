import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Property } from './supabase'
import type { CensusData } from './census'

async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export class DatabaseService {
  
  // Create a new property
  static async createProperty(propertyData: Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user to ensure we have authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Explicitly include user_id in the insert
    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...propertyData,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Get all properties for a user
  static async getUserProperties(userId: string): Promise<Property[]> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Get a single property by ID
  static async getProperty(id: string, userId: string): Promise<Property | null> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  }

  // Update a property
  static async updateProperty(id: string, userId: string, updates: Partial<Property>) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Delete a property
  static async deleteProperty(id: string, userId: string) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) throw error
  }

  // Search properties by address (for autocomplete)
  static async searchPropertiesByAddress(searchTerm: string, userId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .rpc('search_properties_by_address', {
        search_term: searchTerm,
        user_id_param: userId
      })
    
    if (error) throw error
    return data || []
  }

  // Bulk insert properties (for CSV upload)
  static async bulkCreateProperties(properties: Omit<Property, 'id' | 'created_at' | 'updated_at'>[]) {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user to ensure we have authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Add user_id to all properties
    const propertiesWithUserId = properties.map(prop => ({
      ...prop,
      user_id: user.id
    }))
    
    const { data, error } = await supabase
      .from('properties')
      .insert(propertiesWithUserId)
      .select()
    
    if (error) throw error
    return data
  }

  // Get properties with filters
  static async getFilteredProperties(
    userId: string,
    filters: {
      city?: string
      state?: string
      tags?: string[]
      search?: string
      portfolio_id?: string
    }
  ) {
    const supabase = await createServerSupabaseClient()
    let query = supabase
      .from('properties')
      .select(`
        *,
        portfolios (
          id,
          name,
          owner_id
        )
      `)

    // Portfolio filtering
    if (filters.portfolio_id) {
      query = query.eq('portfolio_id', filters.portfolio_id)
    }

    if (filters.city) {
      query = query.eq('city', filters.city)
    }

    if (filters.state) {
      query = query.eq('state', filters.state)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    if (filters.search) {
      // Use full-text search to prevent SQL injection
      // Searches across address, city, apn, and owner fields using the fts tsvector column
      query = query.textSearch('fts', filters.search, {
        type: 'websearch',
        config: 'english'
      })
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // === Census Data Methods ===

  /**
   * Find a place by city and state for Census data lookup
   */
  static async findPlaceByCity(city: string, state: string) {
    const supabase = await createServerSupabaseClient()
    
    // Normalize city name for matching
    const normalizedCity = city.toLowerCase().trim()
    
    const { data, error } = await supabase
      .from('places')
      .select('geoid, name, state_abbr')
      .eq('basename_normalized', normalizedCity)
      .eq('state_abbr', state.toUpperCase())
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }
    
    return data
  }

  /**
   * Get cached Census data for a place and year
   */
  static async getCachedCensusData(geoid: string, year: number): Promise<CensusData | null> {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('census_data')
      .select('*')
      .eq('geoid', geoid)
      .eq('year', year)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }
    
    return data
  }

  /**
   * Store Census data in the database (upsert)
   */
  static async storeCensusData(censusData: CensusData) {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('census_data')
      .upsert({
        geoid: censusData.geoid,
        year: censusData.year,
        median_income: censusData.median_income,
        mean_income: censusData.mean_income,
        households: censusData.households,
        population: censusData.population,
        unemployment_rate: censusData.unemployment_rate,
        median_age: censusData.median_age,
        age_brackets: censusData.age_brackets,
        // New housing fields from DP04
        total_housing_units: censusData.total_housing_units,
        owner_occupied_units: censusData.owner_occupied_units,
        renter_occupied_units: censusData.renter_occupied_units,
        median_rent: censusData.median_rent,
        avg_household_size_owner: censusData.avg_household_size_owner,
        avg_household_size_renter: censusData.avg_household_size_renter,
        // New education field from S1501
        education_details: censusData.education_details,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'geoid,year'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  /**
   * Get property with associated demographic data
   */
  static async getPropertyWithDemographics(propertyId: string, userId: string) {
    // const supabase = await createServerSupabaseClient()
    
    // First get the property
    const property = await this.getProperty(propertyId, userId)
    if (!property) return null
    
    // Try to get census data if city/state exist
    if (property.city && property.state) {
      try {
        const place = await this.findPlaceByCity(property.city, property.state)
        if (place) {
          const censusData = await this.getCachedCensusData(place.geoid, 2023)
          return {
            ...property,
            demographics: censusData
          }
        }
      } catch (error) {
        console.warn('Error fetching demographics for property:', error)
      }
    }
    
    return {
      ...property,
      demographics: null
    }
  }

  /**
   * Get all places for a state (helper method)
   */
  static async getPlacesByState(stateAbbr: string) {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('places')
      .select('geoid, name, basename_normalized')
      .eq('state_abbr', stateAbbr.toUpperCase())
      .order('name')
    
    if (error) throw error
    return data || []
  }

  /**
   * Get census data statistics (helper method for admin/debugging)
   */
  static async getCensusDataStats() {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('census_data')
      .select('year, count(*)')
      .order('year')
    
    if (error) throw error
    return data || []
  }

  // === Education Progress Methods ===

  /**
   * Get user's education progress
   */
  static async getUserEducationProgress(userId: string): Promise<Record<string, boolean>> {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('user_education_progress')
      .select('lesson_slug, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
    
    if (error) throw error
    
    // Transform to format expected by frontend
    const progress: Record<string, boolean> = {}
    data?.forEach(item => {
      progress[item.lesson_slug] = true
    })
    
    return progress
  }

  /**
   * Mark lesson as complete for user
   */
  static async markLessonComplete(userId: string, lessonSlug: string): Promise<void> {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('user_education_progress')
      .upsert(
        {
          user_id: userId,
          lesson_slug: lessonSlug,
          completed_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,lesson_slug'
        }
      )
    
    if (error) throw error
  }

  /**
   * Check if a specific lesson is complete for user
   */
  static async getLessonCompletion(userId: string, lessonSlug: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('user_education_progress')
      .select('lesson_slug')
      .eq('user_id', userId)
      .eq('lesson_slug', lessonSlug)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return false // No rows returned
      throw error
    }
    
    return !!data
  }

  /**
   * Sync localStorage progress to database (used on first login)
   */
  static async syncEducationProgress(userId: string, localProgress: Record<string, boolean>): Promise<void> {
    const supabase = await createServerSupabaseClient()

    // Get completed lessons from localStorage
    const completedLessons = Object.entries(localProgress)
      .filter(([, completed]) => completed)
      .map(([lessonSlug]) => ({
        user_id: userId,
        lesson_slug: lessonSlug,
        completed_at: new Date().toISOString()
      }))

    if (completedLessons.length === 0) return

    // Batch insert all completed lessons (using upsert to avoid conflicts)
    const { error } = await supabase
      .from('user_education_progress')
      .upsert(completedLessons, {
        onConflict: 'user_id,lesson_slug'
      })

    if (error) throw error
  }

  // ============================================================================
  // PROPERTY UNITS METHODS (v2.0 Income & Expense System)
  // ============================================================================

  /**
   * Create a new property unit
   */
  static async createUnit(unitData: {
    property_id: string
    portfolio_id: string
    unit_number: string
    unit_name?: string
    square_footage?: number
    tenant_name?: string
    tenant_email?: string
    tenant_phone?: string
    lease_start_date?: string
    lease_end_date?: string
    monthly_rent?: number
    security_deposit?: number
    lease_terms?: string
    is_occupied?: boolean
    notes?: string
  }) {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const { data, error } = await supabase
      .from('property_units')
      .insert({
        ...unitData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get all units for a property
   */
  static async getPropertyUnits(propertyId: string, filters?: {
    is_active?: boolean
    is_occupied?: boolean
  }) {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('property_units')
      .select('*')
      .eq('property_id', propertyId)

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.is_occupied !== undefined) {
      query = query.eq('is_occupied', filters.is_occupied)
    }

    const { data, error } = await query.order('unit_number')

    if (error) throw error
    return data || []
  }

  /**
   * Get a single unit by ID
   */
  static async getUnit(unitId: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('property_units')
      .select('*')
      .eq('id', unitId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  /**
   * Update a property unit
   */
  static async updateUnit(unitId: string, updates: Partial<{
    unit_number: string
    unit_name: string
    square_footage: number
    tenant_name: string
    tenant_email: string
    tenant_phone: string
    lease_start_date: string
    lease_end_date: string
    monthly_rent: number
    security_deposit: number
    lease_terms: string
    is_occupied: boolean
    is_active: boolean
    notes: string
  }>) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('property_units')
      .update(updates)
      .eq('id', unitId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete a property unit (soft delete)
   */
  static async deleteUnit(unitId: string) {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('property_units')
      .update({ is_active: false })
      .eq('id', unitId)

    if (error) throw error
  }

  // ============================================================================
  // INCOME TRANSACTIONS METHODS
  // ============================================================================

  /**
   * Create a new income transaction
   */
  static async createIncomeTransaction(transactionData: {
    property_id: string
    portfolio_id: string
    unit_id?: string
    transaction_date: string
    amount: number
    category: string
    description: string
    transaction_type?: 'actual' | 'projected'
    is_recurring?: boolean
    recurrence_frequency?: string
    recurrence_start_date?: string
    recurrence_end_date?: string
    notes?: string
    tags?: string[]
  }) {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const { data, error } = await supabase
      .from('income_transactions')
      .insert({
        ...transactionData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get income transactions for a property with filters
   */
  static async getIncomeTransactions(propertyId: string, filters?: {
    unit_id?: string
    start_date?: string
    end_date?: string
    category?: string
    transaction_type?: 'actual' | 'projected'
    is_recurring?: boolean
    limit?: number
    offset?: number
  }) {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('income_transactions')
      .select('*')
      .eq('property_id', propertyId)

    if (filters?.unit_id) {
      query = query.eq('unit_id', filters.unit_id)
    }

    if (filters?.start_date) {
      query = query.gte('transaction_date', filters.start_date)
    }

    if (filters?.end_date) {
      query = query.lte('transaction_date', filters.end_date)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type)
    }

    if (filters?.is_recurring !== undefined) {
      query = query.eq('is_recurring', filters.is_recurring)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query.order('transaction_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get a single income transaction with linked documents
   */
  static async getIncomeTransaction(transactionId: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('income_transactions')
      .select(`
        *,
        documents:property_documents(*)
      `)
      .eq('id', transactionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  /**
   * Update an income transaction
   */
  static async updateIncomeTransaction(transactionId: string, updates: Partial<{
    transaction_date: string
    amount: number
    category: string
    description: string
    transaction_type: 'actual' | 'projected'
    notes: string
    tags: string[]
  }>) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('income_transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete an income transaction
   */
  static async deleteIncomeTransaction(transactionId: string, deleteRecurring: boolean = false) {
    const supabase = await createServerSupabaseClient()

    if (deleteRecurring) {
      // Delete parent and all child recurring transactions
      const { error } = await supabase
        .from('income_transactions')
        .delete()
        .or(`id.eq.${transactionId},parent_transaction_id.eq.${transactionId}`)

      if (error) throw error
    } else {
      // Delete single transaction
      const { error } = await supabase
        .from('income_transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error
    }
  }

  // ============================================================================
  // EXPENSE TRANSACTIONS METHODS
  // ============================================================================

  /**
   * Create a new expense transaction
   */
  static async createExpenseTransaction(transactionData: {
    property_id: string
    portfolio_id: string
    unit_id?: string
    transaction_date: string
    amount: number
    category: string
    description: string
    transaction_type?: 'actual' | 'projected'
    is_recurring?: boolean
    recurrence_frequency?: string
    recurrence_start_date?: string
    recurrence_end_date?: string
    vendor_name?: string
    vendor_contact?: string
    notes?: string
    tags?: string[]
  }) {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const { data, error } = await supabase
      .from('expense_transactions')
      .insert({
        ...transactionData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get expense transactions for a property with filters
   */
  static async getExpenseTransactions(propertyId: string, filters?: {
    unit_id?: string
    start_date?: string
    end_date?: string
    category?: string
    transaction_type?: 'actual' | 'projected'
    is_recurring?: boolean
    limit?: number
    offset?: number
  }) {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('expense_transactions')
      .select('*')
      .eq('property_id', propertyId)

    if (filters?.unit_id) {
      query = query.eq('unit_id', filters.unit_id)
    }

    if (filters?.start_date) {
      query = query.gte('transaction_date', filters.start_date)
    }

    if (filters?.end_date) {
      query = query.lte('transaction_date', filters.end_date)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type)
    }

    if (filters?.is_recurring !== undefined) {
      query = query.eq('is_recurring', filters.is_recurring)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query.order('transaction_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get a single expense transaction with linked documents
   */
  static async getExpenseTransaction(transactionId: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('expense_transactions')
      .select(`
        *,
        documents:property_documents(*)
      `)
      .eq('id', transactionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  /**
   * Update an expense transaction
   */
  static async updateExpenseTransaction(transactionId: string, updates: Partial<{
    transaction_date: string
    amount: number
    category: string
    description: string
    transaction_type: 'actual' | 'projected'
    vendor_name: string
    vendor_contact: string
    notes: string
    tags: string[]
  }>) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('expense_transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete an expense transaction
   */
  static async deleteExpenseTransaction(transactionId: string, deleteRecurring: boolean = false) {
    const supabase = await createServerSupabaseClient()

    if (deleteRecurring) {
      // Delete parent and all child recurring transactions
      const { error } = await supabase
        .from('expense_transactions')
        .delete()
        .or(`id.eq.${transactionId},parent_transaction_id.eq.${transactionId}`)

      if (error) throw error
    } else {
      // Delete single transaction
      const { error } = await supabase
        .from('expense_transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error
    }
  }

  // ============================================================================
  // PROPERTY DOCUMENTS METHODS
  // ============================================================================

  /**
   * Create document metadata entry (file should already be uploaded to storage)
   */
  static async createDocument(documentData: {
    property_id: string
    portfolio_id: string
    unit_id?: string
    income_transaction_id?: string
    expense_transaction_id?: string
    file_name: string
    file_path: string
    file_size_bytes: number
    file_type: string
    document_type: string
    document_category?: string
    title?: string
    description?: string
    tags?: string[]
    document_date?: string
    expiration_date?: string
  }) {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const { data, error } = await supabase
      .from('property_documents')
      .insert({
        ...documentData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get documents for a property with filters
   */
  static async getPropertyDocuments(propertyId: string, filters?: {
    unit_id?: string
    document_type?: string
    income_transaction_id?: string
    expense_transaction_id?: string
    expiring_before?: string
    limit?: number
    offset?: number
  }) {
    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)

    if (filters?.unit_id) {
      query = query.eq('unit_id', filters.unit_id)
    }

    if (filters?.document_type) {
      query = query.eq('document_type', filters.document_type)
    }

    if (filters?.income_transaction_id) {
      query = query.eq('income_transaction_id', filters.income_transaction_id)
    }

    if (filters?.expense_transaction_id) {
      query = query.eq('expense_transaction_id', filters.expense_transaction_id)
    }

    if (filters?.expiring_before) {
      query = query.lte('expiration_date', filters.expiring_before)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query.order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get a single document
   */
  static async getDocument(documentId: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  /**
   * Update document metadata
   */
  static async updateDocument(documentId: string, updates: Partial<{
    title: string
    description: string
    tags: string[]
    document_type: string
    document_category: string
    document_date: string
    expiration_date: string
  }>) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('property_documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete a document (metadata only - storage deletion handled separately)
   */
  static async deleteDocument(documentId: string) {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('property_documents')
      .delete()
      .eq('id', documentId)

    if (error) throw error
  }

  // ============================================================================
  // FINANCIAL REPORTS METHODS
  // ============================================================================

  /**
   * Calculate Property NOI using database function
   */
  static async calculatePropertyNOI(propertyId: string, startDate: string, endDate: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .rpc('calculate_property_noi', {
        p_property_id: propertyId,
        p_start_date: startDate,
        p_end_date: endDate
      })

    if (error) throw error
    return data
  }

  /**
   * Calculate Unit Financials using database function
   */
  static async calculateUnitFinancials(unitId: string, startDate: string, endDate: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .rpc('calculate_unit_financials', {
        p_unit_id: unitId,
        p_start_date: startDate,
        p_end_date: endDate
      })

    if (error) throw error
    return data
  }

  /**
   * Generate recurring income transactions using database function
   */
  static async generateRecurringIncomeTransactions(endDate?: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .rpc('generate_recurring_income_transactions',
        endDate ? { p_end_date: endDate } : {}
      )

    if (error) throw error
    return data
  }

  /**
   * Generate recurring expense transactions using database function
   */
  static async generateRecurringExpenseTransactions(endDate?: string) {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .rpc('generate_recurring_expense_transactions',
        endDate ? { p_end_date: endDate } : {}
      )

    if (error) throw error
    return data
  }
}