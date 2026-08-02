import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'
import { RegridService } from '@/lib/regrid'
import type { Property } from '@/lib/supabase'
import { sanitizePropertyForClient } from '@/lib/api/sanitizers'
import { checkAndIncrementUsageServer, createLimitExceededResponse } from '@/lib/limits'
import { applyRateLimit } from '@/lib/rateLimiter'
import { diffPropertyRecords } from '@/lib/stewardship'

// Utility function to clean APN by removing all dashes
function cleanAPN(apn: string | null | undefined): string | null {
  if (!apn) return null
  return apn.replace(/-/g, '')
}

// POST /api/user-properties/[id]/refresh
// Re-pulls the county record for a property, applies fresh Regrid data while
// preserving user-entered fields, and returns detected lifecycle events.
// Each refresh consumes one pro lookup (atomic check-and-increment).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Burst guard on top of the monthly quota: refreshes hit Regrid directly.
    // 30/min accommodates one full bulk-refresh batch (25) plus manual clicks.
    const rateLimited = await applyRateLimit(userId, 'property-refresh', {
      windowMs: 60 * 1000,
      maxRequests: 30,
    })
    if (rateLimited) return rateLimited

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    const existingProperty = await DatabaseService.getProperty(id, userId)
    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (!existingProperty.apn) {
      return NextResponse.json(
        { error: 'Cannot refresh property: no APN on file' },
        { status: 400 }
      )
    }

    // Consume one lookup before calling the API (prevents quota bypass)
    const limitResult = await checkAndIncrementUsageServer(userId, 1)
    if (!limitResult.canProceed) {
      return NextResponse.json(createLimitExceededResponse(limitResult), { status: 429 })
    }

    const regridData = await RegridService.searchByAPN(
      existingProperty.apn,
      existingProperty.state || undefined,
      existingProperty.county || undefined
    )

    if (!regridData) {
      return NextResponse.json(
        { error: 'No county record found for this parcel' },
        { status: 404 }
      )
    }

    // Fresh county data overwrites assessor fields; user-entered fields survive
    const updatedPropertyData = {
      regrid_id: regridData.id || existingProperty.regrid_id,
      apn: cleanAPN(regridData.apn) || existingProperty.apn,
      address: regridData.address?.line1 || existingProperty.address,
      city: regridData.address?.city || existingProperty.city,
      state: regridData.address?.state || existingProperty.state,
      zip_code: regridData.address?.zip || existingProperty.zip_code,
      geometry: regridData.geometry || existingProperty.geometry,
      lat: regridData.centroid?.lat || existingProperty.lat,
      lng: regridData.centroid?.lng || existingProperty.lng,

      year_built: regridData.properties?.year_built || existingProperty.year_built,
      owner: regridData.properties?.owner || existingProperty.owner,
      last_sale_price: regridData.properties?.last_sale_price || existingProperty.last_sale_price,
      sale_date: regridData.properties?.sale_date || existingProperty.sale_date,
      county: regridData.properties?.county || existingProperty.county,
      qoz_status: regridData.properties?.qoz_status || existingProperty.qoz_status,
      improvement_value: regridData.properties?.improvement_value || existingProperty.improvement_value,
      land_value: regridData.properties?.land_value || existingProperty.land_value,
      assessed_value: regridData.properties?.assessed_value || existingProperty.assessed_value,

      use_code: regridData.properties?.use_code || existingProperty.use_code,
      use_description: regridData.properties?.use_description || existingProperty.use_description,
      zoning: regridData.properties?.zoning || existingProperty.zoning,
      zoning_description: regridData.properties?.zoning_description || existingProperty.zoning_description,
      num_stories: regridData.properties?.num_stories || existingProperty.num_stories,
      num_units: regridData.properties?.num_units || existingProperty.num_units,
      num_rooms: regridData.properties?.num_rooms || existingProperty.num_rooms,
      subdivision: regridData.properties?.subdivision || existingProperty.subdivision,
      lot_size_acres: regridData.properties?.lot_acres || existingProperty.lot_size_acres,
      lot_size_sqft: regridData.properties?.lot_size_sqft || existingProperty.lot_size_sqft,

      tax_year: regridData.properties?.tax_year || existingProperty.tax_year,
      parcel_value_type: regridData.properties?.parcel_value_type || existingProperty.parcel_value_type,
      census_tract: regridData.properties?.census_tract || existingProperty.census_tract,
      census_block: regridData.properties?.census_block || existingProperty.census_block,
      qoz_tract: regridData.properties?.qoz_tract || existingProperty.qoz_tract,

      last_refresh_date: new Date().toISOString().split('T')[0],
      regrid_updated_at: regridData.properties?.regrid_updated_at || existingProperty.regrid_updated_at,

      owner_mailing_address: regridData.properties?.owner_mailing_address || existingProperty.owner_mailing_address,
      owner_mail_city: regridData.properties?.owner_mail_city || existingProperty.owner_mail_city,
      owner_mail_state: regridData.properties?.owner_mail_state || existingProperty.owner_mail_state,
      owner_mail_zip: regridData.properties?.owner_mail_zip || existingProperty.owner_mail_zip,

      property_data: regridData,
      updated_at: new Date().toISOString(),
    }

    // Lifecycle events: what changed in the county record since we last looked
    const events = diffPropertyRecords(
      existingProperty,
      updatedPropertyData as unknown as Partial<Property>,
      {
        propertyId: existingProperty.id,
        propertyAddress: existingProperty.address,
        source: 'county-refresh',
      }
    )

    const updatedProperty = await DatabaseService.updateProperty(
      id,
      userId,
      updatedPropertyData as unknown as Partial<Property>
    )

    return NextResponse.json({
      property: sanitizePropertyForClient(updatedProperty),
      events,
      usage: {
        used: limitResult.currentUsed,
        limit: limitResult.limit,
        remaining: limitResult.remaining,
      },
    })
  } catch (error) {
    console.error('Property refresh error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh property' },
      { status: 500 }
    )
  }
}
