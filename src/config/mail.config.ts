import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  serviceId: process.env.EMAIL_SERVICE_ID,
  templateId: process.env.EMAIL_TEMPLATE_ID,
  contactTemplateId:
    process.env.EMAIL_CONTACT_TEMPLATE_ID || process.env.EMAIL_TEMPLATE_ID,
  contactAutoReplyTemplateId:
    process.env.EMAIL_CONTACT_AUTO_REPLY_TEMPLATE_ID ||
    process.env.EMAIL_CONTACT_TEMPLATE_ID ||
    process.env.EMAIL_TEMPLATE_ID,
  clientApprovalTemplateId:
    process.env.EMAIL_CLIENT_APPROVAL_TEMPLATE_ID ||
    process.env.EMAIL_CONTACT_AUTO_REPLY_TEMPLATE_ID ||
    process.env.EMAIL_TEMPLATE_ID,
  contactReceiver: process.env.CONTACT_FORM_RECEIVER,
  userId: process.env.EMAIL_USER_ID,
  accessToken: process.env.EMAIL_ACCESS_TOKEN,
}));
