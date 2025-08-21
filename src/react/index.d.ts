import type { ReactElement } from 'react';

export type WidgetTheme = Record<string, string>;

export interface WidgetProps {
  theme?: Partial<WidgetTheme>;
  defaultContract?: string;
  lockContract?: boolean;
  logoUrl?: string;
  projectName?: string;
}

export declare function WidgetStandalone(props?: WidgetProps): ReactElement;
export declare function WidgetEmbedded(props?: WidgetProps): ReactElement;


