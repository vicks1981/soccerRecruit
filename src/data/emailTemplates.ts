import { OutreachCategory } from '../types/recruiting';

export interface GkEmailTemplate {
  id: string;
  name: string;
  category: OutreachCategory;
  subject: string;
  body: string;
}

export const GK_EMAIL_TEMPLATES: GkEmailTemplate[] = [
  {
    id: 'showcase',
    name: 'ECNL Pre-Showcase Schedule Notice',
    category: 'Showcase Schedule',
    subject:
      '[Showcase Event Name] Schedule - Class of 2029 Goalkeeper - [Player Name] ([Club Name] #[Number])',
    body: `Dear Coach [Coach Last Name],

My name is [Player Name], a Class of 2029 Goalkeeper playing for [Club Name] ECNL (Jersey #[Number]). I am writing to share my upcoming match schedule for the [Showcase Event Name] in [City, State].

I currently maintain a [GPA] GPA and reside in Delaware County, PA. I have been following the [University Name] men's soccer program closely and believe my physical frame ([Height], [Weight] lbs), shot-stopping abilities, and vocal organization out of the back align well with your system in the [Conference Name].

[Showcase Event Name] Match Schedule ([Location Name]):
• Game 1: [Game 1 Date] at [Game 1 Time] vs. [Game 1 Opponent] (Field #[Game 1 Field])
• Game 2: [Game 2 Date] at [Game 2 Time] vs. [Game 2 Opponent] (Field #[Game 2 Field])
• Game 3: [Game 3 Date] at [Game 3 Time] vs. [Game 3 Opponent] (Field #[Game 3 Field])

Athletic & Video Links:
• 2-Minute Highlight Reel: [Highlight Link]
• 10-Minute Unedited Half Video: [Full Game Link]

Thank you for your time and evaluation. I look forward to seeing your coaching staff on the sidelines.

Best regards,

[Player Name]
Class of 2029 Goalkeeper | [Club Name] ECNL (Jersey #[Number])
Phone: [Player Phone] | Email: [Player Email]
NCAA ID #: [NCAA ID] | City: Delco / Suburban Philadelphia, PA`,
  },
  {
    id: 'campInquiry',
    name: 'ID Camp GK Coach Evaluation Inquiry',
    category: 'ID Camp Inquiry',
    subject:
      'Question regarding [Camp Name] Goalkeeper Curriculum - [Player Name] (2029 GK)',
    body: `Dear Coach [Coach Last Name],

My name is [Player Name], a 2029 Goalkeeper playing ECNL for [Club Name]. I am planning my camp calendar and am very interested in attending the upcoming [Camp Name] on [Date] at [University Name].

As a 2029 prospect, I understand that under NCAA recruiting regulations (prior to June 15, 2027), direct recruiting communications are restricted. However, I am writing to confirm camp logistics:

1. Will there be dedicated goalkeeper-specific training sessions led by your goalkeeper coaching staff prior to match play?
2. Are full-match video recordings or high-angle footage provided to campers following the clinic?

My 2-minute video highlights can be reviewed here: [Highlight Link]

Thank you for your assistance with these camp details. I look forward to competing on campus.

Sincerely,

[Player Name]
Class of 2029 Goalkeeper | [Club Name] ECNL
Phone: [Player Phone] | Email: [Player Email]
NCAA ID #: [NCAA ID]`,
  },
  {
    id: 'introHighlight',
    name: 'Introductory Highlight Video & Roster Depth Fit',
    category: 'Introductory',
    subject: '2029 ECNL Goalkeeper Video Intro - [Player Name] (Delco, PA)',
    body: `Dear Coach [Coach Last Name],

My name is [Player Name], a Class of 2029 Goalkeeper from Delaware County, PA, playing for [Club Name] ECNL.

I have been studying [University Name]'s soccer program and noted your team's competitive style in the [Conference Name]. I wanted to introduce myself early in my high school career and share my athletic and academic profile.

Player Quick Profile:
• Position: Goalkeeper (GK)
• Height / Weight: [Height], [Weight] lbs
• Graduation Year: 2029
• High School / Club: [High School] / [Club Name] ECNL (Jersey #[Number])
• Academic Profile: [GPA] GPA

Highlight Video Links:
• Highlight Reel: [Highlight Link]
• Full Game Tape (1st Half): [Full Game Link]

I look forward to tracking your program's upcoming season and attending an upcoming ID clinic on campus.

Best regards,

[Player Name]
Class of 2029 | Goalkeeper
Phone: [Player Phone] | Email: [Player Email]
NCAA ID #: [NCAA ID]`,
  },
];
