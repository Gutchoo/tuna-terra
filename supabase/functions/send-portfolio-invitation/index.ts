import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Types for request/response
interface InvitationRequest {
  email: string
  portfolioName: string
  inviterName: string
  role: 'editor' | 'viewer'
  acceptUrl: string
  isExistingUser: boolean
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

// Email templates
const getNewUserInvitationHTML = (data: InvitationRequest) => `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <title>You've been invited to join Tuna Terra</title>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" content="" />
  <meta content="target-densitydpi=device-dpi" name="viewport" />
  <meta content="true" name="HandheldFriendly" />
  <meta content="width=device-width" name="viewport" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />

  <style type="text/css">
    table { border-collapse: separate; table-layout: fixed; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    table td { border-collapse: collapse; }
    .ExternalClass { width:100% }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height:100% }
    body, a, li, p, h1, h2, h3 { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
    html { -webkit-text-size-adjust:none !important; }
    body { min-width:100%; Margin:0; padding:0; }
    body, #innerTable { -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
    #innerTable img+div { display:none !important; }
    img { Margin:0; padding:0; -ms-interpolation-mode:bicubic; }
    h1, h2, h3, p, a { line-height:inherit; overflow-wrap:normal; white-space:normal; word-break:break-word; }
    a { text-decoration:none; }
    h1, h2, h3, p { min-width:100%!important; width:100%!important; max-width:100%!important; display:inline-block!important; border:0; padding:0; margin:0; }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important; }
  </style>

  <link href="https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700&family=Merriweather:wght@700&display=swap" rel="stylesheet" type="text/css" />
</head>

<body style="min-width:100%;Margin:0;padding:0;background-color:#F5F4F0;">
  <div style="background-color:#F5F4F0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
        <td style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#F5F4F0;" valign="top" align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable">
            <tr><td><div style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr>

            <tr><td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
                <tr><td width="600" style="width:600px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
                    <tr>
                      <td style="border:1px solid #EBEBEB;overflow:hidden;background-color:#FFFFFF;padding:44px 42px 32px 42px;border-radius:12px;">
                        <!-- Logo -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;">
                          <tr>
                            <td align="left">
                              <table role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;">
                                <tr>
                                  <td width="42" style="width:42px;">
                                    <div style="font-size:0px;">
                                      <img style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="42" height="42" alt="Tuna Terra" src="https://cbmoeetodvngmhsjqmhi.supabase.co/storage/v1/object/public/email-assets/tiny_tuna_terra_wireframe_brand_light.png"/>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <div style="height:24px; line-height:24px; font-size:1px;">&nbsp;</div>

                        <!-- Heading -->
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="border-bottom:1px solid #EFEFEF; padding:0 0 18px 0;">
                              <h1 style="margin:0; font-family:Merriweather, Georgia, 'Times New Roman', serif; line-height:32px; font-weight:700; font-size:26px; letter-spacing:-0.5px; color:#141213; text-align:left; mso-line-height-rule:exactly; mso-text-raise:1px;">
                                You're invited to collaborate
                              </h1>
                            </td>
                          </tr>
                        </table>

                        <div style="height:14px; line-height:14px; font-size:1px;">&nbsp;</div>

                        <!-- Body copy -->
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td>
                              <p style="margin:0; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; line-height:24px; font-weight:400; font-size:15px; letter-spacing:0; color:#141213; mso-line-height-rule:exactly; mso-text-raise:3px;">
                                ${data.inviterName} has invited you to collaborate on <strong>"${data.portfolioName}"</strong> as ${data.role === 'editor' ? 'an editor' : 'a viewer'}.
                              </p>

                              <div style="height:16px; line-height:16px; font-size:1px;">&nbsp;</div>

                              <p style="margin:0; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; line-height:24px; font-weight:400; font-size:15px; letter-spacing:0; color:#141213; mso-line-height-rule:exactly; mso-text-raise:3px;">
                                ${data.role === 'editor'
                                  ? 'As an editor, you\'ll be able to view, add, edit, and delete properties in this portfolio.'
                                  : 'As a viewer, you\'ll have read-only access to view all properties in this portfolio.'
                                }
                              </p>

                              <div style="height:16px; line-height:16px; font-size:1px;">&nbsp;</div>

                              <p style="margin:0; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; line-height:24px; font-weight:400; font-size:15px; letter-spacing:0; color:#141213; mso-line-height-rule:exactly; mso-text-raise:3px;">
                                Click the button below to create your account and accept the invitation.
                              </p>
                            </td>
                          </tr>
                        </table>

                        <div style="height:22px; line-height:22px; font-size:1px;">&nbsp;</div>

                        <!-- CTA button -->
                        <table role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto; max-width:514px;">
                          <tr>
                            <td style="width:auto;">
                              <table role="presentation" cellpadding="0" cellspacing="0" style="width:auto; max-width:514px;">
                                <tr>
                                  <td style="overflow:hidden; background-color:#C73D32; text-align:center; line-height:38px; mso-line-height-rule:exactly; padding:0 24px; border-radius:999px;">
                                    <a href="${data.acceptUrl}" target="_blank"
                                       style="display:block; margin:0; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; line-height:38px; font-weight:700; font-size:16px; letter-spacing:0; color:#FFFFFF; text-align:center;">
                                      Accept Invitation & Join Tuna Terra
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- Plain-link fallback -->
                        <div style="height:26px; line-height:26px; font-size:1px;">&nbsp;</div>
                        <p style="margin:0; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; font-size:12px; line-height:20px; color:#6B7280;">
                          Trouble with the button? Paste this link into your browser:<br/>
                          <a href="${data.acceptUrl}" style="color:#B07248; text-decoration:underline; word-break:break-all;">${data.acceptUrl}</a>
                        </p>

                        <div style="height:36px; line-height:36px; font-size:1px;">&nbsp;</div>

                        <!-- Footer -->
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="border-top:1px solid #E3E3E3; padding-top:16px;">
                              <table role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
                                <tr>
                                  <td valign="top" style="background-color:#FFFFFF; text-align:left; line-height:20px;">
                                    <span style="display:block; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; line-height:20px; font-weight:600; font-size:14px; color:#141213;">
                                      Tuna Terra
                                    </span>
                                  </td>
                                  <td style="width:20px;" width="20"></td>
                                  <td valign="top" style="background-color:#FFFFFF; text-align:left; line-height:20px;">
                                    <span style="display:block; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; line-height:20px; font-weight:500; font-size:14px; color:#9CA3AF;">
                                      This invitation expires in 7 days.
                                    </span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </td></tr>

            <tr><td><div style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`

const getExistingUserNotificationHTML = (data: InvitationRequest) => `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <title>Portfolio shared with you</title>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" content="" />
  <meta content="target-densitydpi=device-dpi" name="viewport" />
  <meta content="true" name="HandheldFriendly" />
  <meta content="width=device-width" name="viewport" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />

  <style type="text/css">
    table { border-collapse: separate; table-layout: fixed; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    table td { border-collapse: collapse; }
    .ExternalClass { width:100% }
    body, a, li, p, h1, h2, h3 { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
    body { min-width:100%; Margin:0; padding:0; }
    body { -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
    img { Margin:0; padding:0; -ms-interpolation-mode:bicubic; }
    h1, h2, h3, p, a { line-height:inherit; overflow-wrap:normal; white-space:normal; word-break:break-word; }
    a { text-decoration:none; }
    h1, h2, h3, p { min-width:100%!important; width:100%!important; max-width:100%!important; display:inline-block!important; border:0; padding:0; margin:0; }
  </style>

  <link href="https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700&family=Merriweather:wght@700&display=swap" rel="stylesheet" type="text/css" />
</head>

<body style="min-width:100%;Margin:0;padding:0;background-color:#F5F4F0;">
  <div style="background-color:#F5F4F0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
        <td style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#F5F4F0;" valign="top" align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr><td><div style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr>

            <tr><td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
                <tr><td width="600" style="width:600px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
                    <tr>
                      <td style="border:1px solid #EBEBEB;overflow:hidden;background-color:#FFFFFF;padding:44px 42px 32px 42px;border-radius:12px;">
                        <!-- Logo -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;">
                          <tr>
                            <td align="left">
                              <img style="display:block;border:0;height:42px;width:42px;Margin:0;" width="42" height="42" alt="Tuna Terra" src="https://cbmoeetodvngmhsjqmhi.supabase.co/storage/v1/object/public/email-assets/tiny_tuna_terra_wireframe_brand_light.png"/>
                            </td>
                          </tr>
                        </table>

                        <div style="height:24px; line-height:24px; font-size:1px;">&nbsp;</div>

                        <!-- Heading -->
                        <h1 style="margin:0 0 18px 0; font-family:Merriweather, Georgia, 'Times New Roman', serif; line-height:32px; font-weight:700; font-size:26px; letter-spacing:-0.5px; color:#141213; border-bottom:1px solid #EFEFEF; padding-bottom:18px;">
                          Portfolio shared with you
                        </h1>

                        <!-- Body copy -->
                        <p style="margin:0 0 16px 0; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; line-height:24px; font-weight:400; font-size:15px; color:#141213;">
                          ${data.inviterName} has shared <strong>"${data.portfolioName}"</strong> with you as ${data.role === 'editor' ? 'an editor' : 'a viewer'}.
                        </p>

                        <p style="margin:0 0 22px 0; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; line-height:24px; font-weight:400; font-size:15px; color:#141213;">
                          ${data.role === 'editor'
                            ? 'You can now view, add, edit, and delete properties in this portfolio.'
                            : 'You now have read-only access to view all properties in this portfolio.'
                          }
                        </p>

                        <!-- CTA button -->
                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:26px;">
                          <tr>
                            <td style="overflow:hidden; background-color:#C73D32; text-align:center; line-height:38px; padding:0 24px; border-radius:999px;">
                              <a href="${data.acceptUrl}" target="_blank"
                                 style="display:block; margin:0; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; line-height:38px; font-weight:700; font-size:16px; color:#FFFFFF; text-align:center;">
                                View Portfolio
                              </a>
                            </td>
                          </tr>
                        </table>

                        <!-- Footer -->
                        <div style="border-top:1px solid #E3E3E3; padding-top:16px;">
                          <p style="margin:0; font-family:Karla, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; font-size:12px; line-height:20px; color:#6B7280;">
                            <strong style="color:#141213;">Tuna Terra</strong> • This invitation expires in 7 days.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </td></tr>

            <tr><td><div style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div></td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    // Parse the request body
    const invitationData: InvitationRequest = await req.json()

    // Validate required fields
    const { email, portfolioName, inviterName, role, acceptUrl, isExistingUser } = invitationData
    if (!email || !portfolioName || !inviterName || !role || !acceptUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Choose the appropriate email template and subject
    const htmlContent = isExistingUser
      ? getExistingUserNotificationHTML(invitationData)
      : getNewUserInvitationHTML(invitationData)

    const subject = isExistingUser
      ? `${inviterName} shared "${portfolioName}" with you`
      : `${inviterName} invited you to join Tuna Terra`

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tuna Terra <noreply@tunaterra.com>',
        to: [email],
        subject,
        html: htmlContent,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send email',
          details: emailResult
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success response
    const response: EmailResponse = {
      success: true,
      messageId: emailResult.id,
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})