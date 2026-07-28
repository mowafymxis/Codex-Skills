export function scorePriority(input) {
    for (const [key, value] of Object.entries(input))
        if (typeof value === "number" && (value < 1 || value > 5))
            throw new Error(`${key} must be between 1 and 5`);
    const positive = input.importance * 0.18 +
        input.urgency * 0.13 +
        input.userPainSeverity * 0.12 +
        input.revenueImpact * 0.11 +
        input.retentionImpact * 0.1 +
        input.activationImpact * 0.09 +
        input.trustImpact * 0.07 +
        input.uniqueness * 0.06 +
        input.strategicFit * 0.08 +
        input.evidenceStrength * 0.06;
    const penalty = input.difficulty * 0.07 + input.operationalCost * 0.03;
    const score = Number(Math.max(0, Math.min(5, positive - penalty)).toFixed(2));
    let label = score >= 3.5
        ? "Build Now"
        : score >= 2.8
            ? "Build Next"
            : score >= 2.1
                ? "Consider"
                : score >= 1.4
                    ? "Later"
                    : "Ignore";
    if (input.securityBlocker)
        label = "Build Now";
    else if (input.damagesSimplicity)
        label = "Do Not Build Yet";
    else if ((input.difficulty >= 4 || input.operationalCost >= 4) && input.evidenceStrength <= 2)
        label = "Validate First";
    else if (input.difficulty >= 4 && input.importance <= 2)
        label = score < 1.5 ? "Ignore" : "Later";
    return {
        score,
        label,
        rationale: `Decision-support score ${score}/5: impact ${positive.toFixed(2)} less delivery/operations penalty ${penalty.toFixed(2)}. Evidence strength ${input.evidenceStrength}/5; difficulty ${input.difficulty}/5.`,
    };
}
export function defaultScore(isAppMissing, competitorCount, confidence, category) {
    const tableStake = ["Identity", "Trust", "Data portability"].includes(category);
    return {
        importance: tableStake ? 5 : Math.min(5, 2 + competitorCount),
        urgency: tableStake && isAppMissing ? 5 : 3,
        userPainSeverity: tableStake ? 4 : 3,
        revenueImpact: category === "Monetization" ? 5 : 3,
        retentionImpact: ["Engagement", "Collaboration"].includes(category) ? 4 : 3,
        activationImpact: category === "Activation" || category === "Identity" ? 5 : 2,
        trustImpact: tableStake ? 5 : 2,
        uniqueness: competitorCount > 1 ? 1 : 3,
        strategicFit: 3,
        evidenceStrength: confidence === "high" ? 5 : confidence === "medium" ? 3 : 2,
        difficulty: ["AI", "Mobile"].includes(category) ? 4 : 3,
        operationalCost: category === "AI" ? 4 : 2,
        mvpSuitability: tableStake ? 5 : 3,
        ...(tableStake && isAppMissing && category === "Trust" ? { securityBlocker: true } : {}),
    };
}
//# sourceMappingURL=scoring.js.map