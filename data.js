// Profile multipliers
const profileMultipliers = {
    'UA-LT': { bank: 1.0, gov: 1.0, crowd: 1.0, angels: 1.0, vc: 1.0 },
    'UA-PL': { bank: 1.0, gov: 1.0, crowd: 1.0, angels: 1.0, vc: 1.0 },
    'BY-LT': { bank: 0.8, gov: 0.75, crowd: 0.9, angels: 1.0, vc: 1.0 },
    'BY-PL': { bank: 0.8, gov: 0.9, crowd: 1.0, angels: 1.0, vc: 1.0 }
};

// Funding categories
const categories = [
    { id: 'bank', name: 'Bank Lending', key: 'bank' },
    { id: 'gov', name: 'Government Programs', key: 'gov' },
    { id: 'crowd', name: 'Crowdfunding / Lending', key: 'crowd' },
    { id: 'angels', name: 'Business Angels', key: 'angels' },
    { id: 'vc', name: 'Venture Capital', key: 'vc' }
];

// FILTERING Questions (these multiply and can exclude categories with 0)
const filteringQuestions = [
    {
        id: 1,
        type: 'filtering',
        question: 'What is the loan amount you are seeking?',
        options: [
            {
                text: '< about 5,000 EUR / 21,000 PLN',
                filters: { bank: 1, gov: 1, crowd: 1, angels: 0, vc: 0 }
            },
            {
                text: '5,000 – 25,000 EUR (21,000 - 105,000 PLN)',
                filters: { bank: 1, gov: 1, crowd: 1, angels: 0, vc: 0 }
            },
            {
                text: '25,000 – 50,000 EUR (105,000 - 210,000 PLN)',
                filters: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 0 }
            },
            {
                text: '50,000 – 250,000 EUR (210,000 - 1,050,000 PLN)',
                filters: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }
            },
            {
                text: '250,000 – 1,000,000 EUR (1,050,000 – 4,200,000 PLN)',
                filters: { bank: 1, gov: 0, crowd: 0, angels: 1, vc: 1 }
            },
            {
                text: '1,000,000+ EUR (4,200,000+ PLN)',
                filters: { bank: 0, gov: 0, crowd: 0, angels: 1, vc: 1 }
            }
        ]
    },
    {
        id: 2,
        type: 'filtering',
        question: 'What is the main purpose of the funding you are seeking?',
        options: [
            {
                text: 'Working capital (inventory, salaries, rent, seasonal shortfalls)',
                filters: { bank: 1, gov: 1, crowd: 1, angels: 0, vc: 0 }
            },
            {
                text: 'Equipment / capex (equipment, renovation/construction, machinery, production capacity)',
                filters: { bank: 1, gov: 1, crowd: 1, angels: 0, vc: 0 }
            },
            {
                text: 'Marketing & sales (advertising, sales, entering new markets, scaling e-commerce)',
                filters: { bank: 0, gov: 1, crowd: 1, angels: 1, vc: 1 }
            },
            {
                text: 'Product / R&D (new product, major upgrade, R&D, prototyping)',
                filters: { bank: 0, gov: 1, crowd: 0, angels: 1, vc: 1 }
            }
        ]
    },
    {
        id: 3,
        type: 'filtering',
        question: 'Are you willing to raise funding by giving investors equity in your company, or do you want to use debt (loans) only?',
        options: [
            {
                text: 'I want to use debt only and I am not ready to bring in equity investors at this stage.',
                filters: { bank: 1, gov: 1, crowd: 1, angels: 0, vc: 0 }
            },
            {
                text: 'I am open to equity investors, including business angels and venture funds.',
                filters: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }
            }
        ]
    }
];

// FIT Questions
const fitQuestions = [
    {
        id: 4,
        type: 'fit',
        question: 'What stage is your business currently at?',
        options: [
            {
                text: 'Just an idea, company is not registered, no revenue',
                scores: { bank: -1, gov: 0, crowd: -1, angels: 0, vc: 0 }
            },
            {
                text: 'Prototype or first customers, but revenue is irregular and small',
                scores: { bank: 0, gov: 1, crowd: 0, angels: 1, vc: 1 }
            },
            {
                text: 'Stable revenue for 6–12 months, but growth is weak',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }
            },
            {
                text: '12+ months of stable revenue with year-over-year growth',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 5,
        type: 'fit',
        question: 'How would you best describe your business in terms of type and scalability?',
        options: [
            {
                text: 'Local offline service (cafe, salon, repair shop, small retail store, etc.)',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 0, vc: 0 }
            },
            {
                text: 'Local business with online elements (e-commerce, delivery, services scalable across a city or country)',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 1, vc: 1 }
            },
            {
                text: 'Technology or digital product (SaaS, platform, app, high-tech/deep-tech) with potential across multiple countries or globally',
                scores: { bank: 1, gov: 2, crowd: 1, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 6,
        type: 'fit',
        question: 'What is your attitude toward raising funds through equity (selling a share of the business) vs debt (loans)?',
        options: [
            {
                text: 'I want debt only; I am categorically not willing to give up any equity',
                scores: { bank: 2, gov: 2, crowd: 1, angels: -1, vc: -2 }
            },
            {
                text: 'Prefer debt, but open to a small equity stake (up to 10–15%) if it significantly accelerates growth',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 0 }
            },
            {
                text: 'Neutral: depends on the conditions',
                scores: { bank: 0, gov: 0, crowd: 0, angels: 1, vc: 1 }
            },
            {
                text: 'Prefer equity investors (angels, funds); debt only as a supplement',
                scores: { bank: -1, gov: 0, crowd: -1, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 7,
        type: 'fit',
        question: 'If you take a loan, what collateral or guarantees can you provide?',
        options: [
            {
                text: 'No collateral: neither the company nor I personally have significant assets (real estate, expensive equipment, etc.)',
                scores: { bank: -2, gov: 0, crowd: -1, angels: 0, vc: 0 }
            },
            {
                text: 'Some assets, but not substantial: equipment, inventory, or willingness to provide a personal guarantee, but no real estate or large assets',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 0, vc: 0 }
            },
            {
                text: 'Significant assets: real estate, major equipment, or other valuable property that can serve as collateral',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 0, vc: 0 }
            }
        ]
    },
    {
        id: 8,
        type: 'fit',
        question: 'How do you see the scale and growth trajectory of your business over the next 3–5 years?',
        options: [
            {
                text: 'A small, stable business with comfortable income and no rapid expansion',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 0, vc: 0 }
            },
            {
                text: 'Grow into a significant player within one country',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 1, vc: 1 }
            },
            {
                text: 'Rapid growth across multiple countries / regions / globally',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 9,
        type: 'fit',
        question: 'In an ideal scenario, how do you see the business in terms of growth and "investor story"?',
        options: [
            {
                text: 'Lifestyle business: stable income, no focus on scaling x10 or investor exit',
                scores: { bank: 0, gov: 0, crowd: 0, angels: -1, vc: -2 }
            },
            {
                text: 'Ambitious growth without mandatory exit: grow into a strong player, but exit is not required',
                scores: { bank: 0, gov: 0, crowd: 1, angels: 1, vc: 0 }
            },
            {
                text: 'Venture-scale: built for rapid growth, multiple markets, and potential exit/IPO with x10+ returns',
                scores: { bank: 0, gov: 0, crowd: 1, angels: 2, vc: 2 }
            }
        ]
    }
];

// READINESS Questions
const readinessQuestions = [
    {
        id: 10,
        type: 'readiness',
        question: 'How well is your financial accounting and reporting organized?',
        options: [
            {
                text: 'Almost no accounting: no proper reporting, scattered data, no accountant',
                scores: { bank: -2, gov: -2, crowd: -1, angels: -1, vc: -1 }
            },
            {
                text: 'Basic but weak: some reporting (Excel or tools), but incomplete or inaccurate',
                scores: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
            },
            {
                text: 'Standard accounting: at least annual P&L and balance sheet, reasonably accurate',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }
            },
            {
                text: 'Advanced accounting: regular (monthly/quarterly) reporting, clean P&L, balance sheet, sometimes cash flow, ready for investors',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 11,
        type: 'readiness',
        question: 'How formalized is your business and legal structure?',
        options: [
            {
                text: 'Informal / operating as an individual: no registered company in the target country',
                scores: { bank: -2, gov: -2, crowd: -1, angels: -1, vc: -2 }
            },
            {
                text: 'Company exists but very basic: minimal structure, unclear documentation, weak legal setup',
                scores: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
            },
            {
                text: 'Properly structured: registered entity, clear ownership (cap table), documents in order, IP properly assigned',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 12,
        type: 'readiness',
        question: 'How willing are you to share information and undergo due diligence?',
        options: [
            {
                text: 'Not willing: avoid transparency, do not want to share financials, contracts, ownership structure',
                scores: { bank: -2, gov: -2, crowd: -2, angels: -2, vc: -2 }
            },
            {
                text: 'Somewhat willing but cautious: concerned about confidentiality, unsure what can be shared',
                scores: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
            },
            {
                text: 'Generally willing and experienced: have shared data before, familiar with basic checks (KYC/AML)',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }
            },
            {
                text: 'Fully prepared: understand requirements, have structured documents, ready for full due diligence',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 13,
        type: 'readiness',
        question: 'How well is your management structure and regular business operating cadence (meetings, decision-making, documentation of agreements) set up?',
        options: [
            {
                text: 'Chaotic management, no clear structure or cadence',
                scores: { bank: -1, gov: -1, crowd: -1, angels: -2, vc: -2 }
            },
            {
                text: 'Structure exists, but cadence and documentation are weak',
                scores: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
            },
            {
                text: 'Regular meetings and basic decision tracking in place',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }
            },
            {
                text: 'Clear management rhythm with documented accountability',
                scores: { bank: 2, gov: 2, crowd: 1, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 14,
        type: 'readiness',
        question: 'How repeatable and scalable are your core operational processes (sales, delivery/production, customer support, billing) without constant hands-on involvement from the founder?',
        options: [
            {
                text: 'Everything critical depends on the founder',
                scores: { bank: -1, gov: -1, crowd: -1, angels: -2, vc: -2 }
            },
            {
                text: 'Some processes exist, but no consistent repeatability',
                scores: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
            },
            {
                text: 'Core processes are already repeatable',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }
            },
            {
                text: 'Processes are formalised and ready for scaling',
                scores: { bank: 2, gov: 2, crowd: 1, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 15,
        type: 'readiness',
        question: 'How well do you understand and plan your cash flow and runway after receiving funding (including scenarios, repayment or next-round logic)?',
        options: [
            {
                text: 'No meaningful cash flow / runway planning',
                scores: { bank: -2, gov: -2, crowd: -1, angels: -2, vc: -2 }
            },
            {
                text: 'Basic awareness, but no systematic forecasting',
                scores: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
            },
            {
                text: 'Simple 6–12 month forecast and runway estimate',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }
            },
            {
                text: 'Structured multi-scenario cash and runway planning with triggers',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 2, vc: 2 }
            }
        ]
    },
    {
        id: 16,
        type: 'readiness',
        question: 'How ready are your key documents and data for a lender or investor due diligence review?',
        options: [
            {
                text: 'Important documents are missing, inconsistent, or not ready to share (financials, tax, ownership, key contracts)',
                scores: { bank: -2, gov: -2, crowd: -1, angels: -2, vc: -2 }
            },
            {
                text: 'Some key documents exist, but there are clear gaps or mismatches, and no structured data room yet',
                scores: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
            },
            {
                text: 'Most key documents are available and consistent, but the data room is basic and still needs polishing',
                scores: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }
            },
            {
                text: 'A clean, structured data room is ready (financials, tax, ownership, contracts), consistent and easy to review',
                scores: { bank: 2, gov: 2, crowd: 2, angels: 2, vc: 2 }
            }
        ]
    }
];

// Stop-factor Questions
const stopFactorQuestions = [
    {
        id: 17,
        type: 'stopfactor',
        category: 'Legal & compliance',
        question: 'In the last 12 months, has your business had any legal or compliance issue that could worry a lender or investor?',
        helper: 'Examples: sanctions or AML red flags, hidden or unclear beneficial owners, major tax debt or enforcement, serious court case or regulatory investigation, missing or invalid licence/permit needed to operate',
        options: [
            { text: 'Yes, a serious unresolved issue (e.g. sanctions, major tax or court case is active)', level: 'hard-stop' },
            { text: 'Yes, a significant issue, but status is unclear or still under review', level: 'soft-stop' },
            { text: 'Yes, but it is minor, documented, and being resolved', level: 'soft-stop' },
            { text: 'No, there is no such issue', level: 'no-stop' }
        ]
    },
    {
        id: 18,
        type: 'stopfactor',
        category: 'Financial health & cash flow',
        question: 'In the last 12 months, has your business faced serious financial stress?',
        helper: 'Examples: overdue loan repayments or defaults, frequent inability to pay suppliers, salaries, or taxes on time, very unstable cash flow or negative equity, relying on new debt just to cover basic expenses',
        options: [
            { text: 'Yes, serious unresolved stress (e.g. defaults, chronic inability to pay key obligations)', level: 'hard-stop' },
            { text: 'Yes, clear warning signs, but the full situation is still unclear', level: 'soft-stop' },
            { text: 'Yes, but the issues are under control with a clear plan (e.g. restructurings, agreements)', level: 'soft-stop' },
            { text: 'No, there is no serious financial stress', level: 'no-stop' }
        ]
    },
    {
        id: 19,
        type: 'stopfactor',
        category: 'Documentation & transparency',
        question: 'Are any important business documents missing, inconsistent, or not ready to share if a lender or investor asked for them?',
        helper: 'Examples: missing or outdated financial statements or tax filings, big gaps or inconsistencies between reports and bank statements, missing ownership records, key contracts, or corporate documents, data room is not ready or is clearly incomplete',
        options: [
            { text: 'Yes, serious gaps or contradictions; we cannot provide reliable documents now', level: 'hard-stop' },
            { text: 'Yes, several important items are missing or inconsistent and need work', level: 'soft-stop' },
            { text: 'Yes, but only a few items; we know what\'s missing and are fixing it', level: 'soft-stop' },
            { text: 'No, documents are complete, consistent, and easy to share', level: 'no-stop' }
        ]
    },
    {
        id: 20,
        type: 'stopfactor',
        category: 'Governance & ownership',
        question: 'Is there any serious problem with ownership, governance, or founder / shareholder alignment?',
        helper: 'Examples: unclear or disputed ownership (who really owns what), shareholder or founder conflicts about control or direction, messy cap table (unclear shares, side deals, toxic terms), important decisions taken without proper approvals or records',
        options: [
            { text: 'Yes, serious unresolved conflict or unclear ownership that blocks decisions', level: 'hard-stop' },
            { text: 'Yes, worrying issues exist, but we have not fully worked them through', level: 'soft-stop' },
            { text: 'Yes, but issues are identified and being resolved with a clear plan', level: 'soft-stop' },
            { text: 'No, ownership and governance are clear, aligned, and documented', level: 'no-stop' }
        ]
    },
    {
        id: 21,
        type: 'stopfactor',
        category: 'Business model & concentration',
        question: 'Is your business currently highly dependent on one customer, one product, or a weak business model?',
        helper: 'Examples: one or two customers generate most of the revenue, margins are structurally weak or negative with no clear path to improve, business depends on unsustainable marketing or discounts to survive, revenue is volatile and not supported by repeatable demand',
        options: [
            { text: 'Yes, very high dependency or clearly weak model with no realistic improvement path', level: 'hard-stop' },
            { text: 'Yes, there are serious concerns, but the long-term model is still being tested', level: 'soft-stop' },
            { text: 'Yes, but risks are known and we have a concrete plan to reduce them', level: 'soft-stop' },
            { text: 'No, revenue is reasonably diversified and the model looks sustainable', level: 'no-stop' }
        ]
    },
    {
        id: 22,
        type: 'stopfactor',
        category: 'Team & behaviour',
        question: 'Is there any serious people or leadership issue that could worry a lender or investor?',
        helper: 'Examples: strong founder or shareholder conflict, missing critical roles (no one owns sales, finance, or operations), leadership avoids sharing information or manipulates numbers, past misuse of funds or very weak financial discipline',
        options: [
            { text: 'Yes, serious unresolved leadership or team issues that block execution or trust', level: 'hard-stop' },
            { text: 'Yes, there are significant concerns, but they are not yet addressed', level: 'soft-stop' },
            { text: 'Yes, but we have identified them and are actively fixing them (hiring, changes)', level: 'soft-stop' },
            { text: 'No, the team is stable, key roles are covered, and behaviour builds trust', level: 'no-stop' }
        ]
    },
    {
        id: 23,
        type: 'stopfactor',
        category: 'Operations & external risk',
        question: 'Has your business recently faced serious operating problems or external shocks that it is not yet handling well?',
        helper: 'Examples: repeated delivery or quality failures, frequent service breakdowns, critical dependence on a single supplier, platform, or channel without backup, major regulatory or market shock that hit revenue or operations, no realistic plan to adapt to these changes',
        options: [
            { text: 'Yes, serious unresolved issues that still threaten operations or survival', level: 'hard-stop' },
            { text: 'Yes, significant problems exist, and the response is not yet clear or proven', level: 'soft-stop' },
            { text: 'Yes, but we have a plan and are already stabilising the situation', level: 'soft-stop' },
            { text: 'No, operations are stable and external risks are currently manageable', level: 'no-stop' }
        ]
    }
];

// All questions together
const allQuestions = [...filteringQuestions, ...fitQuestions, ...readinessQuestions, ...stopFactorQuestions];
