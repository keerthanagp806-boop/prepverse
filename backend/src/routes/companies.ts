import express, { Response } from 'express';
import { store } from '../db/store';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// List companies with filtering
router.get('/', (req, res) => {
  const { search, industry } = req.query;
  const companies = store.getCompanies({
    search: search as string,
    industry: industry as string
  });
  res.json({ companies });
});

// Get company profile by ID with eligibility check for current student
router.get('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const company = store.getCompanyById(req.params.id);
  if (!company) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }

  const user = store.getUserById(req.user!.id);
  
  // Calculate dynamic eligibility for student
  let isEligible = true;
  const eligibilityReasons: string[] = [];

  if (user && user.role === 'STUDENT') {
    if (user.cgpa && user.cgpa < company.eligibility.minCgpa) {
      isEligible = false;
      eligibilityReasons.push(`CGPA (${user.cgpa}) is below minimum requirement (${company.eligibility.minCgpa})`);
    } else {
      eligibilityReasons.push(`CGPA requirement met (${company.eligibility.minCgpa}+)`);
    }

    if (user.graduationYear && !company.eligibility.gradYears.includes(user.graduationYear)) {
      isEligible = false;
      eligibilityReasons.push(`Graduation year ${user.graduationYear} is not in eligible batch (${company.eligibility.gradYears.join(', ')})`);
    }

    // Matching skills
    const matchingSkills = user.skills.filter(s =>
      company.requiredSkills.some(rs => rs.toLowerCase().includes(s.toLowerCase()))
    );
    eligibilityReasons.push(`Matches ${matchingSkills.length} of ${company.requiredSkills.length} required skill areas`);
  }

  // Get curated problem objects for this company
  const curatedProblems = company.curatedProblemIds.map(pid => {
    const prob = store.getCodingProblemById(pid);
    return prob ? {
      id: prob.id,
      title: prob.title,
      slug: prob.slug,
      difficulty: prob.difficulty,
      topic: prob.topic
    } : null;
  }).filter(Boolean);

  res.json({
    company,
    eligibilityStatus: {
      isEligible,
      reasons: eligibilityReasons
    },
    curatedProblems
  });
});

// Admin: Add or update company
router.post('/', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response): void => {
  const { name, logo, industry, description, salaryRange, eligibility, requiredSkills, assessmentAreas, preparationModules, curatedProblemIds } = req.body;

  if (!name || !industry) {
    res.status(400).json({ error: 'Company name and industry are required' });
    return;
  }

  const company = store.createCompany({
    name,
    logo: logo || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80',
    industry,
    description: description || '',
    salaryRange: salaryRange || '₹10 - ₹20 LPA',
    eligibility: eligibility || {
      minCgpa: 7.0,
      allowedBranches: ['CSE', 'IT', 'ECE'],
      maxBacklogs: 0,
      gradYears: [2026]
    },
    requiredSkills: requiredSkills || ['DSA', 'Python', 'DBMS'],
    assessmentAreas: assessmentAreas || ['Aptitude', 'Technical Interview'],
    preparationModules: preparationModules || [],
    curatedProblemIds: curatedProblemIds || []
  });

  store.logAction({
    userId: req.user!.id,
    userName: req.user?.id || 'Admin',
    role: req.user!.role,
    action: 'COMPANY_CREATED',
    resourceType: 'Company',
    resourceId: company.id,
    details: `Added company profile: ${company.name}`
  });

  res.status(201).json({ company });
});

export default router;
