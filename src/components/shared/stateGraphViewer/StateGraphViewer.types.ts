export type NodeStatus = 'completed' | 'active' | 'pending';

export interface StateStepConfig
{
    label: string;
    color: string; // theme palette key e.g. 'success' | 'info' | 'neutral'
    status: NodeStatus;
    isTerminal: boolean;
}

export interface StateGraphViewerProps
{
    steps: StateStepConfig[];
    currentStep: number;
    totalSteps: number;
    isTerminal: boolean;
    sublabel?: string; // e.g. 'Next: Ordered' or 'Done ✓'
}
