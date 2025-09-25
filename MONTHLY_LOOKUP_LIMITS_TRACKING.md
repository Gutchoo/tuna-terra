# Monthly Lookup Limits Tracking

This file tracks all locations in the codebase where we mention monthly lookup limits to make future updates easier.

## Current Limit: 10 monthly lookups for free tier users

## Locations to Update When Changing Limits

### 1. User Interface Components

#### A. Demo Components
- **File**: `src/components/demo/ConversionPrompt.tsx`
  - **Lines**: 83, 149
  - **Context**: Conversion banner and card showing "10 free lookups monthly"
  - **Last Updated**: 2025-09-25

- **File**: `src/components/demo/DemoAddPropertyModal.tsx`
  - **Line**: 222
  - **Context**: Success modal after adding demo property
  - **Last Updated**: 2025-09-25

### 2. Database Configuration

#### A. Database Migrations
- **File**: `database/migration-add-user-limits.sql`
  - **Lines**: 9, 40, 66
  - **Context**: Original migration setting default limit to 25
  - **Note**: Historical - do not modify

- **File**: `database/update-default-limit-to-15.sql`
  - **Lines**: 35, 121
  - **Context**: Migration updating limit from 25 to 15
  - **Note**: Historical - do not modify

- **File**: `database/update-default-limit-to-10.sql`
  - **Lines**: 23, 100
  - **Context**: Current migration setting limit to 10
  - **Last Updated**: 2025-09-25

#### B. Database Functions
The following database functions contain the default limit and should be updated via migration:
- `check_and_increment_usage()` - Creates new users with default limit
- `check_usage_limits()` - Returns default limit for non-existent users
- `create_user_limits()` - Trigger function for new user creation

### 3. Error Messages and User Feedback

#### A. Limit Exceeded Messages
- **File**: `src/lib/limits.ts`
  - **Line**: 174
  - **Context**: Dynamic message using `limitCheck.limit` value
  - **Note**: Uses database value, no hardcoded limit

- **File**: `src/lib/atomicLimits.ts`
  - **Line**: Similar to above
  - **Context**: Dynamic message using database value
  - **Note**: Uses database value, no hardcoded limit

#### B. Usage Indicators
- **File**: `src/components/usage/UsageIndicator.tsx`
  - **Lines**: Multiple lines
  - **Context**: General messages about monthly limits
  - **Note**: Uses dynamic values from database, no hardcoded limits

### 4. Development and Testing

#### A. Debug Components
- **File**: `src/components/debug/PropertyFlowDebugPanel.tsx`
  - **Line**: 105
  - **Context**: Test scenario with "Used 25 of 25 lookups"
  - **Note**: This is test data and may not need updating

## Update Checklist

When changing the monthly lookup limit:

### Frontend Updates
- [ ] Update `src/components/demo/ConversionPrompt.tsx` (2 locations)
- [ ] Update `src/components/demo/DemoAddPropertyModal.tsx` (1 location)
- [ ] Check for any other hardcoded references by searching for the current number

### Backend Updates
- [ ] Create new database migration file
- [ ] Update `check_and_increment_usage()` function
- [ ] Update `check_usage_limits()` function
- [ ] Update `create_user_limits()` trigger function
- [ ] Update existing user records with new limit
- [ ] Test the migration on staging environment

### Testing
- [ ] Test new user signup flow
- [ ] Test existing user limit checking
- [ ] Test demo conversion prompts show correct limits
- [ ] Test limit exceeded error messages
- [ ] Verify database functions return correct limits

## Search Commands

To find all references to lookup limits:
```bash
# Search for hardcoded numbers with "monthly" or "lookup"
grep -r "[0-9]\+.*monthly.*lookup\|monthly.*lookup.*[0-9]\+" src/
grep -r "[0-9]\+.*free.*lookup\|free.*lookup.*[0-9]\+" src/

# Search for specific numbers (adjust as needed)
grep -r "5.*lookup\|10.*lookup\|15.*lookup\|25.*lookup" src/
```

## Notes

- The database functions use dynamic values, so most error messages and usage indicators automatically reflect the correct limit
- Focus on UI components and hardcoded marketing copy when updating limits
- Always create a new migration file rather than modifying existing ones
- Test thoroughly on staging before applying to production