/**
 * Messaging Templates for Email and SMS
 * These templates can be selected and edited by admins before sending
 */

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'announcement' | 'prayer' | 'reminder' | 'celebration' | 'general';
  subject: string; // For email only
  emailBody: string;
  smsBody: string;
  description: string;
}

export const MESSAGING_TEMPLATES: MessageTemplate[] = [
  {
    id: 'weekly-announcement',
    name: 'Weekly Announcements',
    category: 'announcement',
    subject: 'Weekly Church Announcements',
    emailBody: `Dear {name},

We hope this message finds you well. Here are this week's important announcements:

{message}

We look forward to seeing you at church this week!

Blessings,
Amazing Grace Baptist Church
U/Zawu, Gonin Gora, Kaduna, Nigeria`,
    smsBody: `Weekly Announcements: {message} - Amazing Grace Baptist Church`,
    description: 'Template for weekly church announcements and updates'
  },
  {
    id: 'prayer-request',
    name: 'Prayer Request',
    category: 'prayer',
    subject: 'Prayer Request - Amazing Grace Church',
    emailBody: `Dear {name},

We are reaching out to ask for your prayers for:

{message}

Please join us in prayer for this intention. We believe in the power of prayer and know that God hears our petitions.

"Again I say to you, if two of you agree on earth about anything they ask, it will be done for them by my Father in heaven." - Matthew 18:19

Thank you for your prayers and support.

Blessings,
Amazing Grace Baptist Church`,
    smsBody: `Prayer Request: {message} Please join us in prayer. - Amazing Grace Church`,
    description: 'Template for sharing prayer requests with the congregation'
  },
  {
    id: 'event-reminder',
    name: 'Event Reminder',
    category: 'reminder',
    subject: 'Reminder: Upcoming Church Event',
    emailBody: `Dear {name},

This is a friendly reminder about our upcoming event:

{message}

We hope to see you there! Your presence makes our church family complete.

If you have any questions, please don't hesitate to reach out.

Blessings,
Amazing Grace Baptist Church`,
    smsBody: `Reminder: {message} - Amazing Grace Church`,
    description: 'Template for reminding members about upcoming events'
  },
  {
    id: 'birthday-celebration',
    name: 'Birthday Celebration',
    category: 'celebration',
    subject: 'Happy Birthday! 🎉',
    emailBody: `Dear {name},

Happy Birthday! 🎂🎉

On this special day, we want to celebrate you and thank God for your life. May this new year of your life be filled with:

- God's abundant blessings
- Joy and peace
- Divine favor
- Good health and strength
- Fulfillment of your heart's desires

"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11

We pray that God will continue to guide and bless you in all your endeavors.

With love and prayers,
Amazing Grace Baptist Church`,
    smsBody: `Happy Birthday {name}! 🎉 May God bless you abundantly on this special day. - Amazing Grace Church`,
    description: 'Template for celebrating member birthdays'
  },
  {
    id: 'welcome-message',
    name: 'Welcome Message',
    category: 'general',
    subject: 'Welcome to Amazing Grace Baptist Church',
    emailBody: `Dear {name},

Welcome to Amazing Grace Baptist Church! We are thrilled to have you join our church family.

{message}

We believe that God has brought you here for a purpose, and we look forward to walking this journey of faith together with you.

Our church is a place where:
- You can grow in your relationship with God
- You'll find a supportive community
- Your gifts and talents can be used for God's glory
- You'll experience God's love and grace

If you have any questions or need assistance, please don't hesitate to reach out to us.

Once again, welcome! We're excited to have you here.

Blessings,
Amazing Grace Baptist Church
U/Zawu, Gonin Gora, Kaduna, Nigeria`,
    smsBody: `Welcome to Amazing Grace Church! {message} We're excited to have you join us.`,
    description: 'Template for welcoming new members or visitors'
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving Message',
    category: 'celebration',
    subject: 'Thanksgiving and Gratitude',
    emailBody: `Dear {name},

We want to take a moment to express our gratitude and thanksgiving.

{message}

"Give thanks to the Lord, for he is good; his love endures forever." - Psalm 107:1

We are grateful for your presence in our church family and for all the ways you contribute to our community.

May God continue to bless you abundantly.

With gratitude,
Amazing Grace Baptist Church`,
    smsBody: `Thanksgiving: {message} Thank you for being part of our church family. - Amazing Grace Church`,
    description: 'Template for expressing gratitude and thanksgiving'
  },
  {
    id: 'bible-study',
    name: 'Bible Study Reminder',
    category: 'reminder',
    subject: 'Bible Study This Week',
    emailBody: `Dear {name},

We hope you can join us for Bible Study this week!

{message}

Bible Study is a wonderful opportunity to:
- Deepen your understanding of God's Word
- Connect with fellow believers
- Grow in your faith
- Share and learn together

We look forward to seeing you there!

Blessings,
Amazing Grace Baptist Church`,
    smsBody: `Bible Study Reminder: {message} - Amazing Grace Church`,
    description: 'Template for Bible study reminders and announcements'
  }
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): MessageTemplate | undefined {
  return MESSAGING_TEMPLATES.find(template => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: MessageTemplate['category']): MessageTemplate[] {
  return MESSAGING_TEMPLATES.filter(template => template.category === category);
}

/**
 * Replace placeholders in template message
 */
export function replaceTemplatePlaceholders(
  message: string, 
  replacements: Record<string, string>
): string {
  let result = message;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return result;
}

