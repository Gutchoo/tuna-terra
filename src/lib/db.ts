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
}