export type SidePanelModeSelectable =
  | 'auto'
  | 'right'
  | 'bottom'
  | 'full'
  | 'minimized';

export type SidePanelMode = SidePanelModeSelectable | 'none';

export type SidePanelModeResolved = 'right' | 'bottom' | 'full' | 'minimized' | 'none';

export interface SidePanelAvailableStatesPayload {
  availableStates: SidePanelModeSelectable[];
  sidePanelMode: SidePanelMode;
  sidePanelModeResolved: SidePanelModeResolved;
  overlayOnly: boolean;
}

export interface SidePanelTransitionPayload {
  from: SidePanelModeResolved;
  to: SidePanelModeResolved;
  reason: string;
}
