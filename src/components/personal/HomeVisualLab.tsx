import React from 'react';
import {
  HomeVisualLab as ArchivedHomeVisualLab,
  type HomeVisualVariant as ArchivedHomeVisualVariant,
  type ClockParams,
} from '../../legacy/home-visuals/HomeVisualLabEngine';

export type HomeVisualVariant = 1 | 2;

type HomeVisualLabProps = {
  variant: HomeVisualVariant;
  showTachograph?: boolean;
  compactClockField?: boolean;
  interactivePointer?: boolean;
  staticMicroField?: boolean;
  clockParams?: Partial<ClockParams>;
  dissolveWith?: string;
};

export const HomeVisualLab: React.FC<HomeVisualLabProps> = (props) => (
  <ArchivedHomeVisualLab {...props} variant={props.variant as ArchivedHomeVisualVariant} />
);
