// Application state
let state = {
    profile: '',
    origin: '',
    destination: '',
    currentQuestion: 0,
    answers: {},
    stopFactors: {},
    categoryFilters: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 }, // Start with all enabled
    scores: {
        fit: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 },
        readiness: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
    }
};

// DOM elements
const stepProfile = document.getElementById('step-profile');
const stepQuestions = document.getElementById('step-questions');
const stepResults = document.getElementById('step-results');
const btnStart = document.getElementById('btn-start');
const btnNext = document.getElementById('btn-next');
const btnBack = document.getElementById('btn-back');
const btnRestart = document.getElementById('btn-restart');
const questionContainer = document.getElementById('question-container');
const progressBar = document.getElementById('progress');
const currentQDisplay = document.getElementById('current-q');
const totalQDisplay = document.getElementById('total-q');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    totalQDisplay.textContent = allQuestions.length;
    
    // Country button selection listeners
    const countryButtons = document.querySelectorAll('.country-btn');
    
    countryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type; // 'origin' or 'destination'
            const value = this.dataset.value;
            
            // Remove selected class from siblings
            const siblings = document.querySelectorAll(`.country-btn[data-type="${type}"]`);
            siblings.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Store selection in state
            if (type === 'origin') {
                state.origin = value;
            } else {
                state.destination = value;
            }
            
            // Check if both selections are made
            checkProfileSelection();
        });
    });
    
    // Start button
    btnStart.addEventListener('click', startQuestionnaire);
    
    // Navigation
    btnNext.addEventListener('click', nextQuestion);
    btnBack.addEventListener('click', previousQuestion);
    btnRestart.addEventListener('click', restartApp);
});

// Check profile selection
function checkProfileSelection() {
    if (state.origin && state.destination) {
        btnStart.disabled = false;
        state.profile = `${state.origin}-${state.destination}`;
    } else {
        btnStart.disabled = true;
    }
}

// Start questionnaire
function startQuestionnaire() {
    stepProfile.classList.remove('active');
    stepQuestions.classList.add('active');
    state.currentQuestion = 0;
    renderQuestion();
}

// Render current question
function renderQuestion() {
    const question = allQuestions[state.currentQuestion];
    currentQDisplay.textContent = state.currentQuestion + 1;
    
    // Update progress bar
    const progress = ((state.currentQuestion + 1) / allQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Check if this is a stop-factor question
    const isStopFactor = question.type === 'stopfactor';
    
    // Create question HTML
    questionContainer.innerHTML = `
        <div class="question-card">
            ${isStopFactor ? `<div class="stop-factor-category" style="color: #dc2626; margin-bottom: 10px;">⚠ ${question.category}</div>` : ''}
            <div class="question-title">${question.question}</div>
            ${question.helper ? `<div class="question-helper">${question.helper}</div>` : ''}
            <div class="answer-options">
                ${question.options.map((option, index) => `
                    <label class="answer-option ${state.answers[question.id] === index ? 'selected' : ''}" data-option="${index}">
                        <input type="radio" name="q${question.id}" value="${index}" ${state.answers[question.id] === index ? 'checked' : ''}>
                        <span>${option.text}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add handlers for options
    const answerOptions = questionContainer.querySelectorAll('.answer-option');
    answerOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            // Prevent multiple clicks
            if (this.classList.contains('selected')) {
                return;
            }
            const optionIndex = parseInt(this.dataset.option);
            selectAnswer(question.id, optionIndex);
        });
    });
    
    // Update button states
    updateNavigationButtons();
}

// Select answer
function selectAnswer(questionId, optionIndex) {
    state.answers[questionId] = optionIndex;
    
    // Store stop-factor answer if applicable
    const question = allQuestions.find(q => q.id === questionId);
    if (question && question.type === 'stopfactor') {
        state.stopFactors[questionId] = {
            category: question.category,
            question: question.question,
            answer: question.options[optionIndex].text,
            level: question.options[optionIndex].level
        };
    }
    
    // Handle filtering questions - multiply filters
    if (question && question.type === 'filtering') {
        const selectedOption = question.options[optionIndex];
        Object.keys(selectedOption.filters).forEach(category => {
            state.categoryFilters[category] *= selectedOption.filters[category];
        });
    }
    
    // Update visual display
    const answerOptions = questionContainer.querySelectorAll('.answer-option');
    answerOptions.forEach((option, index) => {
        if (index === optionIndex) {
            option.classList.add('selected');
            option.querySelector('input').checked = true;
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Enable "Next" button
    btnNext.disabled = false;
    
    // Automatically go to next question after a short delay
    setTimeout(() => {
        nextQuestion();
    }, 300);
}

// Update navigation button states
function updateNavigationButtons() {
    // "Back" button
    btnBack.disabled = state.currentQuestion === 0;
    
    // "Next" button
    if (state.answers[allQuestions[state.currentQuestion].id] !== undefined) {
        btnNext.disabled = false;
        
        // Change button text on last question
        if (state.currentQuestion === allQuestions.length - 1) {
            btnNext.textContent = 'Show Results';
        } else {
            btnNext.textContent = 'Next';
        }
    } else {
        btnNext.disabled = true;
    }
}

// Next question
function nextQuestion() {
    if (state.currentQuestion < allQuestions.length - 1) {
        state.currentQuestion++;
        renderQuestion();
    } else {
        // Last question - show results
        calculateScores();
        showResults();
    }
}

// Previous question
function previousQuestion() {
    if (state.currentQuestion > 0) {
        state.currentQuestion--;
        renderQuestion();
    }
}

// Calculate scores
function calculateScores() {
    // Reset scores
    state.scores = {
        fit: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 },
        readiness: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
    };
    
    // Calculate base scores (only for fit and readiness questions, not filtering or stop-factors)
    allQuestions.forEach(question => {
        if (question.type === 'fit' || question.type === 'readiness') {
            const answerIndex = state.answers[question.id];
            if (answerIndex !== undefined) {
                const selectedOption = question.options[answerIndex];
                const scoreType = question.type; // 'fit' or 'readiness'
                
                // Add scores to corresponding category
                if (selectedOption.scores) {
                    Object.keys(selectedOption.scores).forEach(category => {
                        state.scores[scoreType][category] += selectedOption.scores[category];
                    });
                }
            }
        }
    });
    
    // Apply profile multipliers
    const multiplier = profileMultipliers[state.profile];
    
    ['fit', 'readiness'].forEach(scoreType => {
        Object.keys(state.scores[scoreType]).forEach(category => {
            state.scores[scoreType][category] *= multiplier[category];
        });
    });
}

// Show results
function showResults() {
    stepQuestions.classList.remove('active');
    stepResults.classList.add('active');
    
    const resultsContainer = document.getElementById('results-container');
    
    // Calculate max and min scores for normalization
    const maxFitScore = 12; // 6 fit questions * 2 max points
    const minFitScore = -12; // 6 fit questions * -2 min points
    const maxReadinessScore = 14; // 7 readiness questions * 2 max points
    const minReadinessScore = -14; // 7 readiness questions * -2 min points
    
    // Create results HTML
    const resultsHTML = categories.map(category => {
        const isExcluded = state.categoryFilters[category.key] === 0;
        const fitScore = state.scores.fit[category.key];
        const readinessScore = state.scores.readiness[category.key];
        
        // Normalize scores to percentages
        const fitPercent = normalizeScore(fitScore, minFitScore, maxFitScore);
        const readinessPercent = normalizeScore(readinessScore, minReadinessScore, maxReadinessScore);
        
        // Determine color for Fit scale
        const fitColor = getScaleColor(fitPercent);
        const readinessColor = getScaleColor(readinessPercent);
        
        if (isExcluded) {
            // Category is excluded - show gray scales with actual percentages
            return `
                <div class="category-result excluded">
                    <div class="category-header">
                        <div class="category-name">${category.name}</div>
                        <div class="category-badge badge-excluded">
                            Not Applicable
                        </div>
                    </div>
                    
                    <div class="scale-container">
                        <div class="scale-label">
                            <span>Fit</span>
                            <span>${fitPercent}%</span>
                        </div>
                        <div class="scale-bar">
                            <div class="scale-fill-gray" style="width: ${fitPercent}%"></div>
                        </div>
                    </div>
                    
                    <div class="scale-container">
                        <div class="scale-label">
                            <span>Readiness</span>
                            <span>${readinessPercent}%</span>
                        </div>
                        <div class="scale-bar">
                            <div class="scale-fill-gray" style="width: ${readinessPercent}%"></div>
                        </div>
                    </div>
                    
                    <div class="exclusion-reason">
                        This funding instrument is currently not applicable based on your funding amount, purpose, and equity preferences.
                    </div>
                </div>
            `;
        }
        
        // Determine overall recommendation
        const recommendation = getRecommendation(fitPercent, readinessPercent);
        
        return `
            <div class="category-result">
                <div class="category-header">
                    <div class="category-name">${category.name}</div>
                    <div class="category-badge badge-${recommendation.level}">
                        ${recommendation.label}
                    </div>
                </div>
                
                <div class="scale-container">
                    <div class="scale-label">
                        <span>Fit</span>
                        <span>${fitPercent}%</span>
                    </div>
                    <div class="scale-bar">
                        <div class="scale-fill" style="width: ${fitPercent}%; background: ${fitColor};"></div>
                    </div>
                </div>
                
                <div class="scale-container">
                    <div class="scale-label">
                        <span>Readiness</span>
                        <span>${readinessPercent}%</span>
                    </div>
                    <div class="scale-bar">
                        <div class="scale-fill" style="width: ${readinessPercent}%; background: ${readinessColor};"></div>
                    </div>
                </div>
                
                <div class="recommendation">
                    ${recommendation.text}
                </div>
            </div>
        `;
    }).join('');
    
    // Create stop-factors section
    const stopFactorsHTML = `
        <div class="stop-factors-section">
            <h2 class="stop-factors-title">Stop Factors Assessment</h2>
            <p class="stop-factors-subtitle">Critical risk factors that may affect your funding options</p>
            <div class="stop-factors-grid">
                ${Object.values(state.stopFactors).map(sf => {
                    // Determine fill percentage and color based on level
                    let fillPercent = 0;
                    let fillColor = '';
                    let statusText = '';
                    
                    if (sf.level === 'hard-stop') {
                        fillPercent = 100;
                        fillColor = '#dc2626'; // Red
                        statusText = '🛑 Hard Stop';
                    } else if (sf.level === 'soft-stop') {
                        // Check the answer to determine if it's option 2 (75%) or option 3 (50%)
                        if (sf.answer.includes('status is unclear') || sf.answer.includes('not yet addressed') || sf.answer.includes('not yet clear')) {
                            fillPercent = 75;
                            fillColor = '#f97316'; // Dark orange
                            statusText = '⚠ Soft Stop / Enhanced Review';
                        } else {
                            fillPercent = 50;
                            fillColor = '#fbbf24'; // Yellow
                            statusText = '⚠ Soft Stop';
                        }
                    } else {
                        fillPercent = 0;
                        fillColor = '#10b981'; // Green (not used for fill, but for text)
                        statusText = '✓ No Stop';
                    }
                    
                    // Get detailed explanation
                    const explanation = getStopFactorExplanation(sf.category, sf.level, sf.answer);
                    
                    return `
                        <div class="stop-factor-item" data-level="${sf.level}">
                            <div class="stop-factor-header">
                                <div class="stop-factor-category" style="color: ${fillColor};">${sf.category}</div>
                                <div class="stop-factor-status ${sf.level}" style="color: ${fillColor};">${statusText}</div>
                            </div>
                            <div class="stop-factor-scale-container">
                                <div class="stop-factor-scale-bar">
                                    ${fillPercent > 0 ? `<div class="stop-factor-scale-fill" style="width: ${fillPercent}%; background: ${fillColor};"></div>` : ''}
                                </div>
                            </div>
                            <div class="stop-factor-answer"><strong>Your answer:</strong> ${sf.answer}</div>
                            
                            <div class="stop-factor-explanation" style="border-left-color: ${fillColor};">
                                <div class="explanation-section">
                                    <strong style="color: ${fillColor};">Impact on funding:</strong> ${explanation.impact}
                                </div>
                                <div class="explanation-section">
                                    <strong style="color: ${fillColor};">What this means:</strong> ${explanation.explanation}
                                </div>
                                <div class="explanation-section">
                                    <strong style="color: ${fillColor};">Recommended action:</strong> ${explanation.action}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = resultsHTML + stopFactorsHTML;
    
    // Animate scale filling
    setTimeout(() => {
        document.querySelectorAll('.scale-fill').forEach(fill => {
            fill.style.width = fill.style.width;
        });
    }, 100);
}

// Normalize scores to percentages
function normalizeScore(score, min, max) {
    const normalized = ((score - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, Math.round(normalized)));
}

// Get color for scale based on percentage
function getScaleColor(percent) {
    if (percent <= 30) {
        return '#dc2626'; // Red
    } else if (percent <= 66) {
        return '#fbbf24'; // Yellow
    } else {
        return '#10b981'; // Green
    }
}

// Get stop-factor explanation based on category and level
function getStopFactorExplanation(category, level, answer) {
    const explanations = {
        'Legal & compliance': {
            'hard-stop': {
                impact: 'Critical blocker for all funding sources',
                explanation: 'Serious unresolved legal or compliance issues (sanctions, major tax debt, court cases) make it nearly impossible to secure funding. Lenders and investors cannot proceed until these are resolved.',
                action: 'Urgently resolve legal issues before seeking funding. Consider legal counsel to address sanctions, tax enforcement, or regulatory investigations.'
            },
            'soft-stop': {
                impact: 'Significant concern requiring clarification or resolution',
                explanation: 'Legal or compliance issues exist but their severity is unclear or they are being actively resolved. This creates uncertainty and may delay funding approval or require enhanced due diligence.',
                action: 'Document the status and resolution plan clearly. Prepare detailed explanations and supporting documents for due diligence. Consider resolving fully before applying to speed up the process.'
            },
            'no-stop': {
                impact: 'No concern',
                explanation: 'Your legal and compliance position is clean, which is essential for funding applications. This removes a major barrier.',
                action: 'Maintain good standing and ensure all licences, permits, and registrations remain current.'
            }
        },
        'Financial health & cash flow': {
            'hard-stop': {
                impact: 'Critical blocker for debt financing, major concern for equity',
                explanation: 'Serious financial stress (defaults, chronic payment failures, negative equity) signals high risk of business failure. Banks and most institutional investors will decline. Even equity investors will hesitate without a credible turnaround plan.',
                action: 'Stabilise operations first: restructure existing debt, secure supplier agreements, restore cash flow. Consider crisis management or turnaround specialists. Only approach equity investors with a clear recovery plan.'
            },
            'soft-stop': {
                impact: 'Significant concern requiring evidence of stabilisation',
                explanation: 'Financial stress exists but is being managed or the full situation is unclear. Funders will require detailed explanations, cash flow projections, and evidence of improving trends.',
                action: 'Build a clear financial recovery plan with realistic projections. Show evidence of stabilisation (improved payment discipline, reduced burn rate). Be transparent in due diligence about past issues and current controls.'
            },
            'no-stop': {
                impact: 'No concern',
                explanation: 'Your business shows healthy financial discipline and cash flow management, which reassures all types of funders.',
                action: 'Continue strong financial discipline. Keep building runway and maintain good relationships with suppliers and creditors.'
            }
        },
        'Documentation & transparency': {
            'hard-stop': {
                impact: 'Critical blocker for all professional funding sources',
                explanation: 'Missing or unreliable financial and legal documents make due diligence impossible. No professional lender or investor can proceed without trustworthy records.',
                action: 'Pause fundraising and invest in proper accounting and legal structure. Hire a professional accountant to reconstruct financials. Organise corporate documents, contracts, and ownership records. This may take 2-6 months but is essential.'
            },
            'soft-stop': {
                impact: 'Delay and additional due diligence required',
                explanation: 'Important documents are missing or inconsistent, creating uncertainty and slowing down the funding process. Some funders may decline; others will require extra time and explanation.',
                action: 'Create a structured data room with all key documents. Identify and fill gaps systematically. Explain any inconsistencies transparently. Consider hiring professionals to help organise and validate documents.'
            },
            'no-stop': {
                impact: 'No concern',
                explanation: 'Your documentation is complete and well-organised, which speeds up due diligence and builds trust with funders.',
                action: 'Keep documents updated and maintain a clean data room structure for future fundraising rounds.'
            }
        },
        'Governance & ownership': {
            'hard-stop': {
                impact: 'Critical blocker for all funding sources',
                explanation: 'Unresolved shareholder conflicts or unclear ownership structure prevent decision-making and create legal risks. No funder can invest or lend when ownership or control is disputed.',
                action: 'Resolve ownership disputes through legal process or shareholder agreements. Clarify the cap table completely. Document all shares, options, and agreements clearly. This is a prerequisite for any funding.'
            },
            'soft-stop': {
                impact: 'Significant concern requiring resolution plan',
                explanation: 'Governance or ownership issues exist but are being addressed. Funders will want to see clear evidence of resolution progress and alignment among founders/shareholders.',
                action: 'Document the governance structure clearly. Resolve founder/shareholder conflicts through mediation or formal agreements. Clean up the cap table and ensure all side deals are transparent and formalised.'
            },
            'no-stop': {
                impact: 'No concern',
                explanation: 'Clear ownership and aligned governance give funders confidence that decisions can be made efficiently and the investment is legally sound.',
                action: 'Maintain clear documentation as the business grows. Update shareholder agreements if new investors or team members join.'
            }
        },
        'Business model & concentration': {
            'hard-stop': {
                impact: 'Major concern for all funders, particularly debt',
                explanation: 'Extreme customer concentration or a fundamentally weak business model with no clear path to profitability creates unacceptable risk. Banks will decline debt. Equity investors will only consider if you have a credible plan to diversify or fix the model.',
                action: 'Actively diversify your customer base or revenue streams before fundraising. If the model is structurally unprofitable, rethink pricing, cost structure, or value proposition. Equity investors may support this pivot, but you need a compelling plan.'
            },
            'soft-stop': {
                impact: 'Concern requiring mitigation plan',
                explanation: 'Concentration risks or model weaknesses exist and funders will scrutinise them carefully. You will need to demonstrate a clear plan to reduce dependency or improve economics.',
                action: 'Develop and document a concrete diversification or improvement plan with milestones. Show early traction on reducing concentration (new customer wins, new products). Build stronger unit economics data to prove viability.'
            },
            'no-stop': {
                impact: 'No concern',
                explanation: 'Your revenue is reasonably diversified and your business model is sustainable, which makes you attractive to most funding sources.',
                action: 'Continue to monitor concentration risks as you grow. Keep improving unit economics and customer diversity.'
            }
        },
        'Team & behaviour': {
            'hard-stop': {
                impact: 'Critical blocker especially for equity investors',
                explanation: 'Serious leadership conflicts, missing critical roles, or evidence of financial mismanagement destroy trust. Investors invest in teams as much as ideas. Banks also need confidence in leadership.',
                action: 'Resolve founder/leadership conflicts decisively (mediation, restructuring, or separation). Fill critical role gaps through hiring or advisors. If past financial mismanagement occurred, demonstrate new controls and governance. Consider bringing in experienced advisors or non-executive directors.'
            },
            'soft-stop': {
                impact: 'Significant concern requiring evidence of improvement',
                explanation: 'Team or leadership issues exist but are not yet addressed. Funders will want to see clear plans to fix gaps or conflicts before committing capital.',
                action: 'Acknowledge gaps openly and show concrete hiring or organisational plans. If conflicts exist, demonstrate resolution progress. Build advisory board or bring in experienced mentors to strengthen credibility.'
            },
            'no-stop': {
                impact: 'No concern',
                explanation: 'A stable, capable team with clear roles and trustworthy behaviour is one of the strongest signals for funders. This is especially important for equity investors.',
                action: 'Continue to build the team strategically as you scale. Maintain strong financial discipline and transparent communication.'
            }
        },
        'Operations & external risk': {
            'hard-stop': {
                impact: 'Critical blocker especially for debt, major concern for equity',
                explanation: 'Unresolved operational crises or external shocks that threaten survival make funding very difficult. Banks cannot lend to unstable operations. Equity investors will only consider if you have a credible stabilisation or pivot plan.',
                action: 'Stabilise operations before fundraising: fix delivery/quality issues, diversify critical dependencies (suppliers, platforms, channels). If a market shock occurred, demonstrate a realistic adaptation plan. Consider crisis management support.'
            },
            'soft-stop': {
                impact: 'Concern requiring stabilisation evidence',
                explanation: 'Operational problems or external shocks exist, and the response is not yet proven. Funders will require evidence that you are successfully stabilising or adapting.',
                action: 'Document the problem clearly and show concrete stabilisation progress (improved delivery metrics, backup suppliers secured, pivot traction). Build contingency plans for critical dependencies. Be transparent about risks and mitigation in due diligence.'
            },
            'no-stop': {
                impact: 'No concern',
                explanation: 'Stable operations and manageable external risks give funders confidence in business continuity and execution capability.',
                action: 'Continue to build operational resilience: diversify dependencies, maintain quality standards, monitor external risk factors proactively.'
            }
        }
    };
    
    return explanations[category]?.[level] || {
        impact: 'Assessment needed',
        explanation: 'This area requires careful evaluation.',
        action: 'Review this factor with advisors or potential funders.'
    };
}

// Get recommendation based on scores
function getRecommendation(fitPercent, readinessPercent) {
    const avgScore = (fitPercent + readinessPercent) / 2;
    
    if (fitPercent >= 70 && readinessPercent >= 70) {
        return {
            level: 'high',
            label: 'Recommended',
            text: '✓ This instrument is well-suited for your business, and you are ready to use it right now.'
        };
    } else if (fitPercent >= 60 && readinessPercent < 60) {
        return {
            level: 'medium',
            label: 'Preparation Required',
            text: '⚠ This instrument is suitable for your business, but additional preparation is needed before applying.'
        };
    } else if (fitPercent < 50) {
        return {
            level: 'low',
            label: 'Not Suitable',
            text: '✗ This instrument is not optimal for your current business type and situation.'
        };
    } else {
        return {
            level: 'medium',
            label: 'Possible',
            text: '→ This instrument is possible for your business, but there may be more suitable alternatives.'
        };
    }
}

// Restart app
function restartApp() {
    state = {
        profile: '',
        origin: '',
        destination: '',
        currentQuestion: 0,
        answers: {},
        stopFactors: {},
        categoryFilters: { bank: 1, gov: 1, crowd: 1, angels: 1, vc: 1 },
        scores: {
            fit: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 },
            readiness: { bank: 0, gov: 0, crowd: 0, angels: 0, vc: 0 }
        }
    };
    
    // Reset profile selection
    document.querySelectorAll('.country-btn').forEach(btn => btn.classList.remove('selected'));
    btnStart.disabled = true;
    
    stepResults.classList.remove('active');
    stepProfile.classList.add('active');
}
