# Email Templates

This directory contains HTML email templates used for portfolio sharing invitations.

## Templates

### 1. `portfolio-invitation-new-user.html`
**Used for:** New users who don't have a Tuna Terra account yet
- **Subject:** "You've been invited to join Tuna Terra"
- **CTA:** "Create Account & Accept Invitation"
- **Content:** Welcome message introducing Tuna Terra + portfolio invitation

### 2. `portfolio-invitation-existing-user.html`
**Used for:** Existing users who already have Tuna Terra accounts
- **Subject:** "You've been invited to collaborate on [Portfolio Name]"
- **CTA:** "Sign In & Accept Invitation"
- **Content:** Focused on portfolio collaboration (assumes user familiarity)

## Template Variables

Both templates use Handlebars-style variables that are replaced by the Edge Function:

- `{{inviterName}}` - Name of person sending the invitation
- `{{portfolioName}}` - Name of the portfolio being shared
- `{{role}}` - Role being granted (editor/viewer)
- `{{acceptUrl}}` - URL to accept the invitation
- `{{#if isEditor}}...{{else}}...{{/if}}` - Conditional content for role permissions

## Current Implementation

**Note:** These templates are currently **embedded directly in the Supabase Edge Function** (`send-portfolio-invitation`) as JavaScript template literals. These files serve as:

1. **Reference** - Clean, maintainable HTML versions
2. **Version Control** - Track changes to email designs
3. **Future Enhancement** - Could be used to load templates dynamically

## Template Features

### Design Elements
- **Professional Branding:** Tuna Terra header with tagline
- **Mobile Responsive:** Inline CSS for email client compatibility
- **Clear CTA:** Single prominent action button
- **Role-Based Content:** Different permission lists for editor vs viewer

### Role Permissions Display

**Editor Permissions:**
- ✅ View all properties in the portfolio
- ✅ Add new properties
- ✅ Edit existing property data
- ✅ Delete properties
- ✅ Access financial modeling tools

**Viewer Permissions:**
- ✅ View all properties in the portfolio
- ✅ Access financial modeling tools
- ❌ Cannot add, edit, or delete properties (red text with ✗)

## Email Delivery

Templates are sent via:
- **Service:** Resend API
- **Sender:** `Tuna Terra <noreply@tunaterra.com>`
- **Edge Function:** `send-portfolio-invitation` (Supabase)
- **Expiry:** 7 days for invitations

## Future Enhancements

1. **Template Loading:** Load templates from files instead of embedding in Edge Function
2. **Template Engine:** Use proper templating engine (Handlebars, Mustache)
3. **A/B Testing:** Multiple template variants for conversion optimization
4. **Localization:** Multi-language template support