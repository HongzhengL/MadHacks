/**
 * Configuration for tasks with frequency -1 (random appearance).
 *
 * probability: Number between 0 and 1 indicating the chance the task will appear in a given round.
 * maxPerYear (optional): Hard cap for how many times it can appear across 26 rounds.
 * category: Metadata for grouping in UI/analytics.
 */
export const randomTaskRules = {
    // Default fallback for any task with frequency === -1
    default: {
        probability: 0.35,
        category: 'misc',
    },

    // Example event/opportunity tasks you can wire into the board:
    emergencyFund: {
        probability: 0.15,
        maxPerYear: 3,
        category: 'event',
    },
    carBreakdown: {
        probability: 0.1,
        maxPerYear: 2,
        category: 'event',
    },
    sideGigOpportunity: {
        probability: 0.25,
        maxPerYear: 4,
        category: 'opportunity',
    },
    taxRefund: {
        probability: 0.2,
        maxPerYear: 1,
        category: 'event',
    },
};

/**
 * Tracks appearances for capped random events.
 * This is in-memory only; resetting the app clears counts.
 */
export const randomTaskState = {
    counts: {},
};
