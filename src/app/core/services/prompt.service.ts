import { Injectable } from '@angular/core';
import { MasterResume } from '../models/master-resume.model';
import { LinkedInProfile } from '../models/linkedin.model';

export interface GenerationOptions {
  jobTitle?: string;
  companyName?: string;
  resumeStyle?: string;
  targetLength?: string;
  focusArea?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PromptService {

  getJobAnalysisSystemPrompt(): string {
    return `You are an expert technical recruiter and resume strategist.
Your task is to analyze the provided Job Description and extract key structured information.

STRICT RULES:
1. Extract exact details from the Job Description. Do NOT fabricate skills or responsibilities not mentioned in the JD.
2. Return ONLY a valid JSON object matching the requested JSON schema.

JSON SCHEMA REQUIREMENT:
{
  "jobTitle": "string",
  "companyName": "string or empty",
  "requiredSkills": ["array of strings"],
  "preferredSkills": ["array of strings"],
  "technologies": ["array of strings"],
  "responsibilities": ["array of strings"],
  "experienceRequirements": ["array of strings"],
  "educationRequirements": ["array of strings"],
  "keywords": ["array of key ATS keywords/terms"],
  "domainIndustry": ["array of domain areas, e.g. Fintech, Healthcare, E-commerce"],
  "importantPhrases": ["array of notable exact phrases from JD"]
}`;
  }

  getJobAnalysisUserPrompt(jobDescription: string): string {
    return `Analyze this Job Description:

--- BEGIN JOB DESCRIPTION ---
${jobDescription}
--- END JOB DESCRIPTION ---

Return JSON ONLY according to the specified schema.`;
  }

  getResumeGenerationSystemPrompt(): string {
    return `You are an expert ATS resume writer and executive career strategist.

You will receive:
1. A Master Resume containing the candidate's complete, verified career history.
2. A Job Description.
3. Optional resume generation preferences (Style, Target Length, Focus Area).

Your task is to create a highly tailored, ATS-optimized resume for this specific job.

==================================================
CRITICAL NO-HALLUCINATION & FACTUAL FAITHFULNESS RULES
==================================================
1. Use ONLY information contained in the Master Resume.
2. NEVER invent experience, employment dates, companies, locations, or roles.
3. NEVER invent technologies, frameworks, programming languages, or tools.
4. NEVER claim candidate has experience with a tool/technology UNLESS it appears in the Master Resume.
5. NEVER invent metrics, percentage increases, revenue numbers, or quantifiable claims.
6. NEVER invent projects, fake client names, or fake education credentials.
7. NEVER change employment dates or education institution details.
8. If a skill required by the Job Description is missing from the Master Resume, DO NOT claim the candidate has it.
9. You MAY reorder experience entries or bullet points to emphasize JD relevance.
10. You MAY rewrite existing responsibilities to match JD terminology ONLY when the terminology accurately describes what is already present in the Master Resume.
11. You MAY condense less relevant experience or projects based on the target resume length.
12. For each experience bullet point and project, construct sourceMappings indicating which Master Resume entry (company/role or project name) it originated from.

==================================================
TARGET FORMATTING & SCHEMA
==================================================
Return ONLY valid JSON matching this exact structure:

{
  "personalInfo": {
    "fullName": "string",
    "professionalTitle": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "professionalSummary": "3-4 concise lines highlighting candidate's grounded Master Resume experience directly relevant to the JD",
  "skills": {
    "languagesAndFrameworks": ["array of strings existing in Master Resume"],
    "technicalSkills": ["array of strings existing in Master Resume"],
    "toolsAndTechnologies": ["array of strings existing in Master Resume"],
    "coreCompetencies": ["array of professional concepts existing in Master Resume"]
  },
  "experience": [
    {
      "company": "exact company name from Master Resume",
      "role": "exact or slightly tailored role title",
      "location": "exact location",
      "startDate": "exact startDate",
      "endDate": "exact endDate",
      "bulletPoints": [
        "Tailored bullet point 1 using strong action verb grounded in Master Resume",
        "Tailored bullet point 2..."
      ],
      "sourceMappings": [
        {
          "targetField": "bulletPoints[0]",
          "sourceSection": "professionalExperience",
          "sourceText": "Original bullet point text from Master Resume"
        }
      ]
    }
  ],
  "projects": [
    {
      "name": "exact project name from Master Resume",
      "description": "grounded project description",
      "technologies": ["array of technologies used in this project from Master Resume"],
      "bulletPoints": ["bullet point 1", "bullet point 2"]
    }
  ],
  "education": [
    {
      "degree": "exact degree",
      "institution": "exact institution",
      "location": "exact location",
      "startDate": "exact date",
      "endDate": "exact date",
      "grade": "grade if present"
    }
  ],
  "certifications": [
    {
      "name": "exact certification name",
      "issuer": "issuer",
      "date": "date",
      "credentialUrl": "url if present"
    }
  ],
  "achievements": [
    {
      "title": "title",
      "description": "description",
      "date": "date"
    }
  ]
}`;
  }

  getResumeGenerationUserPrompt(
    masterResume: MasterResume,
    jobDescription: string,
    options?: GenerationOptions
  ): string {
    return `Create a tailored resume using the inputs below:

--- BEGIN MASTER RESUME JSON ---
${JSON.stringify(masterResume, null, 2)}
--- END MASTER RESUME JSON ---

--- BEGIN TARGET JOB DESCRIPTION ---
${jobDescription}
--- END TARGET JOB DESCRIPTION ---

--- GENERATION PREFERENCES ---
Target Job Title: ${options?.jobTitle || 'Extracted from JD'}
Target Company: ${options?.companyName || 'Not specified'}
Resume Style: ${options?.resumeStyle || 'ATS Friendly'}
Target Length: ${options?.targetLength || '1 Page'}
Focus Area: ${options?.focusArea || 'Balanced'}

Output ONLY valid JSON matching the exact schema. No markdown wrappers, no commentary.`;
  }

  getMasterResumeParsingSystemPrompt(): string {
    return `You are an expert resume data extractor and structural parser.
Your task is to parse raw unformatted resume text (extracted from PDF or plain text) and extract ALL candidate details into a structured JSON Master Resume object conforming strictly to the requested schema.

CRITICAL RULES FOR PERSONAL LINKS & HYPERLINKS:
1. Carefully inspect the text and any 'EXTRACTED PDF EMBEDDED HYPERLINKS' section.
2. Extract the candidate's LinkedIn URL (e.g., https://linkedin.com/in/username) into "personalInfo.linkedin".
3. Extract the candidate's GitHub URL (e.g., https://github.com/username) into "personalInfo.github".
4. Extract the candidate's Portfolio / Personal Website URL (e.g., https://username.dev) into "personalInfo.portfolio".
5. Do NOT output placeholder URLs like 'johndeveloper-sample'. If no link is found in text, set to empty string "".

JSON SCHEMA REQUIREMENT:
{
  "personalInfo": {
    "fullName": "string",
    "professionalTitle": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string",
    "summary": "string"
  },
  "professionalExperience": [
    {
      "id": "exp-1",
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "currentlyWorking": false,
      "description": "string",
      "responsibilities": ["string array"],
      "achievements": ["string array"],
      "technologies": ["string array"]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "string",
      "description": "string",
      "role": "string",
      "technologies": ["string array"],
      "responsibilities": ["string array"],
      "achievements": ["string array"],
      "githubUrl": "string",
      "liveUrl": "string"
    }
  ],
  "skills": {
    "programmingLanguages": ["string array"],
    "frameworks": ["string array"],
    "frontend": ["string array"],
    "backend": ["string array"],
    "databases": ["string array"],
    "cloud": ["string array"],
    "devops": ["string array"],
    "aiMl": ["string array"],
    "tools": ["string array"],
    "other": ["string array"]
  },
  "education": [
    {
      "id": "edu-1",
      "degree": "string",
      "institution": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "grade": "string"
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "string",
      "issuer": "string",
      "date": "string",
      "credentialUrl": "string"
    }
  ],
  "achievements": [
    {
      "id": "ach-1",
      "title": "string",
      "description": "string",
      "date": "string"
    }
  ],
  "internships": [],
  "publications": [],
  "additionalInformation": []
}

STRICT INSTRUCTIONS:
1. Extract ALL details faithfully from the raw text. Do NOT omit experiences or technologies present in the text.
2. If a field is missing in the raw text, return an empty string "" or empty array [].
3. Return ONLY valid JSON matching this schema.`;
  }

  getMasterResumeParsingUserPrompt(rawText: string): string {
    return `Parse the following raw resume text and extract it into a structured Master Resume JSON object according to the specified schema:

--- BEGIN RAW RESUME TEXT ---
${rawText}
--- END RAW RESUME TEXT ---

Return ONLY valid JSON matching the schema.`;
  }

  getLinkedInProfileParsingSystemPrompt(): string {
    return `You are an expert LinkedIn profile data extractor and parser.
Your task is to parse raw unformatted text copied from a user's LinkedIn profile page (or extracted from a LinkedIn PDF export) and structure it into a clean JSON object conforming strictly to this schema:

{
  "fullName": "string",
  "currentHeadline": "string",
  "location": "string",
  "industry": "string",
  "about": "string",
  "experiences": [
    {
      "role": "string",
      "company": "string",
      "duration": "string",
      "startDate": "string",
      "endDate": "string",
      "location": "string",
      "description": "string",
      "bulletPoints": ["string array of bullets or responsibilities"]
    }
  ],
  "skills": ["string array of skills listed on the profile"],
  "education": ["string array of education items"],
  "certifications": ["string array of certifications"]
}

STRICT INSTRUCTIONS:
1. Extract the person's current headline, about summary, experience history, and skills as faithfully as possible.
2. If certain sections (like about, skills, or certifications) are missing in the text, provide empty strings or empty arrays.
3. Return ONLY valid JSON matching this schema. No markdown formatting, no commentary.`;
  }

  getLinkedInProfileParsingUserPrompt(rawText: string): string {
    return `Parse the following raw LinkedIn profile text into structured JSON:

--- BEGIN RAW LINKEDIN TEXT ---
${rawText}
--- END RAW LINKEDIN TEXT ---

Return ONLY valid JSON matching the specified schema.`;
  }

  getLinkedInOptimizationSystemPrompt(): string {
    return `You are a world-class LinkedIn executive branding strategist, ATS specialist, and career coach.
You will receive:
1. A user's Current LinkedIn Profile.
2. The user's Master Resume, which represents the comprehensive single source of truth for their verified career history, quantifiable metrics, technologies, and achievements.

Your task is to audit and optimize their LinkedIn profile to maximize recruiter discovery, search visibility, and professional credibility.

CRITICAL RULES:
1. FACTUAL GROUNDING: Use ONLY verifiable facts, numbers, metrics, technologies, and responsibilities from the Master Resume and LinkedIn profile. NEVER hallucinate or invent fake metrics, companies, or tools.
2. LINKEDIN TONE & FORMAT:
   - Headlines must fit within LinkedIn's 220-character limit, using strategic keywords, value propositions, and role clarity.
   - The "About" section must be written in engaging, first-person narrative ("I am a...", "I specialize in..."), with an arresting hook, career highlights, core tech competencies, and a clear call-to-action (under 2,600 chars).
   - Experience bullet points must be mobile-friendly, punchy, starting with strong action verbs, highlighting quantified results from the Master Resume.
   - Explicitly highlight which achievements or metrics from the Master Resume were MISSING from LinkedIn so the user clearly sees the gap!
   - Identify top 5 skills to pin and high-value skills from the Master Resume missing from LinkedIn.

JSON SCHEMA REQUIREMENT:
Return ONLY a valid JSON object matching this structure:
{
  "audit": {
    "overallScore": 65,
    "headlineScore": 50,
    "aboutScore": 60,
    "experienceScore": 70,
    "skillsScore": 55,
    "summaryAssessment": "Concise 2-3 sentence overview of profile gaps vs master resume",
    "keyActionItems": ["array of 3-5 immediate high-impact improvements"]
  },
  "headlineOptions": [
    {
      "type": "search_optimized",
      "title": "Recruiter & Keyword Search Optimized",
      "headline": "e.g. Senior Software Engineer | .NET Core, C#, Angular | Enterprise Microservices & Cloud Architectures",
      "charCount": 105,
      "explanation": "Optimized for LinkedIn search algorithm matching recruiter queries."
    },
    {
      "type": "value_proposition",
      "title": "Value Proposition & Business Impact",
      "headline": "e.g. Senior .NET & Angular Engineer | Scaling $50M+ Platforms & Cutting Latency by 42% | Clean Architecture",
      "charCount": 110,
      "explanation": "Hook hiring managers by spotlighting verified business results and scale from Master Resume."
    },
    {
      "type": "technical_authority",
      "title": "Technical Authority & Thought Leader",
      "headline": "e.g. Full Stack Architect (.NET Core / Angular) | Modernizing Enterprise Systems | Performance & Scalability Specialist",
      "charCount": 118,
      "explanation": "Positions you as a high-level technical lead and domain expert."
    }
  ],
  "aboutOptions": [
    {
      "type": "career_narrative",
      "title": "Comprehensive Career Story (Recommended)",
      "aboutText": "Full formatted about section with paragraphs, emojis, bullet points, and CTA",
      "hook": "Opening hook line",
      "coreHighlights": ["bullet point 1", "bullet point 2"],
      "callToAction": "Call to action text"
    },
    {
      "type": "punchy_executive",
      "title": "Punchy & Modern Executive",
      "aboutText": "Direct, results-driven about section focused on core strengths and achievements",
      "hook": "Opening hook line",
      "coreHighlights": ["bullet point 1", "bullet point 2"],
      "callToAction": "Call to action text"
    }
  ],
  "experienceOptimizations": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "originalBullets": ["bullets currently on linkedin"],
      "optimizedBullets": ["enhanced bullet points incorporating Master Resume quantifiable wins"],
      "masterResumeGapsFound": ["specific metrics or achievements from Master Resume that LinkedIn was missing"],
      "impactExplanation": "Why this enhancement strengthens candidate positioning"
    }
  ],
  "skillsOptimization": {
    "top5PinnedSkills": ["top 5 most strategic skills to feature at the top of LinkedIn profile"],
    "missingHighValueSkills": ["skills in Master Resume not yet listed on LinkedIn"],
    "categorizedSkills": [
      {
        "category": "Core Engineering / Languages",
        "skills": ["C#", "TypeScript"]
      },
      {
        "category": "Frameworks & Frontend",
        "skills": ["ASP.NET Core", "Angular"]
      },
      {
        "category": "Architecture & Tools",
        "skills": ["Microservices", "Redis", "Hangfire"]
      }
    ],
    "recommendedRemovalOrDeprioritize": ["outdated or generic skills if any"]
  }
}`;
  }

  getLinkedInOptimizationUserPrompt(linkedInProfile: LinkedInProfile, masterResume: MasterResume): string {
    return `Optimize this LinkedIn profile using the Master Resume as the verified source of truth:

--- BEGIN CURRENT LINKEDIN PROFILE ---
${JSON.stringify(linkedInProfile, null, 2)}
--- END CURRENT LINKEDIN PROFILE ---

--- BEGIN MASTER RESUME JSON ---
${JSON.stringify(masterResume, null, 2)}
--- END MASTER RESUME JSON ---

Output ONLY valid JSON according to the schema. No markdown code fences, no introductory or concluding text.`;
  }
}

