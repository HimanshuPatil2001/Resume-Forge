import { LinkedInProfile } from '../models/linkedin.model';

export const SAMPLE_LINKEDIN_RAW_TEXT = `John Developer
Software Developer at TechCorp Solutions
Austin, Texas, United States

About
Software developer with experience in C# and web development. Interested in building scalable applications, improving systems, and learning new technologies. Open to connecting with tech professionals.

Experience
Software Developer
TechCorp Solutions
Mar 2022 - Present (2 yrs 6 mos)
Austin, Texas, United States
- Worked as software developer on financial web applications.
- Built backend APIs and assisted with frontend UI components.
- Maintained SQL database queries and resolved production bugs.

Developer
Apex Digital Systems
Jun 2019 - Feb 2022 (2 yrs 9 mos)
Dallas, Texas, United States
- Developed web services using .NET framework.
- Built UI screens with HTML, JavaScript, and Angular.

Skills
C# • JavaScript • SQL • HTML • Web APIs • Git

Education
The University of Texas at Austin
Bachelor of Science, Computer Science`;

export const SAMPLE_LINKEDIN_PROFILE: LinkedInProfile = {
  fullName: 'John Developer',
  currentHeadline: 'Software Developer at TechCorp Solutions',
  location: 'Austin, Texas, United States',
  industry: 'Software Development',
  about: 'Software developer with experience in C# and web development. Interested in building scalable applications, improving systems, and learning new technologies. Open to connecting with tech professionals.',
  experiences: [
    {
      company: 'TechCorp Solutions',
      role: 'Software Developer',
      duration: 'Mar 2022 - Present',
      startDate: '2022-03',
      endDate: 'Present',
      location: 'Austin, TX',
      description: 'Worked as software developer on financial web applications.',
      bulletPoints: [
        'Worked as software developer on financial web applications.',
        'Built backend APIs and assisted with frontend UI components.',
        'Maintained SQL database queries and resolved production bugs.'
      ]
    },
    {
      company: 'Apex Digital Systems',
      role: 'Developer',
      duration: 'Jun 2019 - Feb 2022',
      startDate: '2019-06',
      endDate: '2022-02',
      location: 'Dallas, TX',
      description: 'Developer for healthcare client systems.',
      bulletPoints: [
        'Developed web services using .NET framework.',
        'Built UI screens with HTML, JavaScript, and Angular.'
      ]
    }
  ],
  skills: ['C#', 'JavaScript', 'SQL', 'HTML', 'Web APIs', 'Git'],
  education: ['The University of Texas at Austin - B.S. in Computer Science'],
  certifications: [],
  rawText: SAMPLE_LINKEDIN_RAW_TEXT
};
