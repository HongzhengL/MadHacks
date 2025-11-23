export const difficultyOptions = {
    hard: {
        key: 'hard',
        label: 'Hard - Below Average',
        grossAnnual: 50000,
        monthlyTakeHome: 3125,
        paycheck: 1440,
        creditLimit: 1000,
        startingBalance: 1440,
        qualityOfLife: 48,
        creditScore: 640,
        startingDebt: 500,
        narrative: 'Entry-level salary in an expensive college town.',
    },
    medium: {
        key: 'medium',
        label: 'Medium - Around Average',
        grossAnnual: 75000,
        monthlyTakeHome: 4688,
        paycheck: 2160,
        creditLimit: 1500,
        startingBalance: 2160,
        qualityOfLife: 60,
        creditScore: 690,
        startingDebt: 250,
        narrative: 'Solid mid-career salary.',
    },
    easy: {
        key: 'easy',
        label: 'Easy - High Earner',
        grossAnnual: 100000,
        monthlyTakeHome: 6250,
        paycheck: 2880,
        creditLimit: 2000,
        startingBalance: 2880,
        qualityOfLife: 70,
        creditScore: 720,
        startingDebt: 0,
        narrative: 'Well-paid tech/finance/management role.',
    },
};

export const housingOptions = {
    sharedRoom: {
        key: 'sharedRoom',
        label: 'Shared Room',
        rent: 700,
        qolDelta: -2,
        description: 'House hacking to save cash; lower QoL baseline.',
    },
    sharedApartment: {
        key: 'sharedApartment',
        label: 'Shared Apartment',
        rent: 1000,
        qolDelta: 0,
        description: 'Your own room with roommates; neutral QoL.',
    },
    oneBed: {
        key: 'oneBed',
        label: '1B1B',
        rent: 1600,
        qolDelta: 2,
        description: 'Comfortable solo living, modest QoL boost.',
    },
    luxury: {
        key: 'luxury',
        label: 'Luxury Loft',
        rent: 2200,
        qolDelta: 4,
        description: 'Big QoL boost, but punishing if income dips.',
    },
};

const baseTasks = [
    {
        id: 'T1',
        title: 'Rent Payment',
        amount: 100,
        dueWeek: 3,
        assignedBills: [],
        status: 'fixed',
        category: 'rent',
        frequency: 2,
    },
    {
        id: 'T2',
        title: 'Utilities',
        amount: 120,
        dueWeek: 2,
        assignedBills: [],
        status: 'fixed',
        frequency: 2,
    },
    {
        id: 'T3',
        title: 'Groceries',
        amount: 300,
        dueWeek: 1,
        assignedBills: [],
        status: 'variable',
        frequency: 1,
    },
    {
        id: 'T4',
        title: 'Internet Bill',
        amount: 70,
        dueWeek: 2,
        assignedBills: [],
        status: 'fixed',
        frequency: 2,
    },
    {
        id: 'T5',
        title: 'Phone Bill',
        amount: 55,
        dueWeek: 1,
        assignedBills: [],
        status: 'fixed',
        frequency: 2,
    },
];

const billDenominations = [
    { id: 'b500', value: 500, type: 'cash' },
    { id: 'b200', value: 200, type: 'cash' },
    { id: 'b100', value: 100, type: 'cash' },
    { id: 'b50', value: 50, type: 'cash' },
    { id: 'b20', value: 20, type: 'cash' },
    { id: 'b10', value: 10, type: 'cash' },
    { id: 'b5', value: 5, type: 'cash' },
    { id: 'b1', value: 1, type: 'cash' },
];

export function buildScenarioConfig({
    difficultyKey = 'medium',
    housingKey = 'sharedApartment',
} = {}) {
    const difficulty = difficultyOptions[difficultyKey] ?? difficultyOptions.medium;
    const housing = housingOptions[housingKey] ?? housingOptions.sharedApartment;

    const rentPercentage = Math.round((housing.rent / difficulty.monthlyTakeHome) * 100);
    const creditLimit = difficulty.creditLimit;

    const tasks = baseTasks.map((task) => {
        if (task.id === 'T1') {
            return {
                ...task,
                amount: housing.rent,
                title: `Rent (${housing.label})`,
                assignedBills: [],
            };
        }
        return { ...task, assignedBills: [] };
    });

    const financeConfig = {
        initialWeek: 1,
        paycheckAmount: difficulty.paycheck,
        startingBalance: difficulty.startingBalance,
        creditLimit,
        tasks,
        bills: [...billDenominations, { id: 'cc1', value: creditLimit, type: 'credit' }],
    };

    const summary = {
        difficultyKey: difficulty.key,
        housingKey: housing.key,
        difficultyLabel: difficulty.label,
        housingLabel: housing.label,
        paycheckAmount: difficulty.paycheck,
        monthlyTakeHome: difficulty.monthlyTakeHome,
        rentAmount: housing.rent,
        rentPercentage,
        qolBaseline: difficulty.qualityOfLife + housing.qolDelta,
        creditScore: difficulty.creditScore,
        creditLimit,
        startingDebt: difficulty.startingDebt,
        narrative: difficulty.narrative,
        housingDescription: housing.description,
    };

    return { financeConfig, summary };
}
