import React from 'react';
import { useBiometricAuth } from './useBiometricAuth';
import OMNIBootSequence from './faction-boots/OMNIBootSequence';
import PFVBootSequence from './faction-boots/PFVBootSequence';
import GreylineBootSequence from './faction-boots/GreylineBootSequence';
import CosmicConcaveBootSequence from './faction-boots/CosmicConcaveBootSequence';
import { useSettings } from '@/components/utils/useSettings';

export default function BootSequence({ theme, onComplete, reducedMotion }) {
  const { isAuthenticated, authenticate } = useBiometricAuth();
  const { settings } = useSettings();

  // If already authenticated, skip boot
  if (isAuthenticated) {
    return null;
  }

  // Select faction-specific boot sequence
  const getFactionBoot = () => {
    const faction = theme?.faction || 'OMNI';
    const bootProps = {
      onComplete: () => {
        authenticate();
        onComplete?.();
      },
      glitchIntensity: settings?.glitchIntensity || 0.3
    };

    switch (faction) {
      case 'P.F.V.':
        return <PFVBootSequence {...bootProps} />;
      case 'Greyline PMC':
        return <GreylineBootSequence {...bootProps} />;
      case 'Cosmic Conclave':
        return <CosmicConcaveBootSequence {...bootProps} />;
      default:
        return <OMNIBootSequence {...bootProps} />;
    }
  };

  return getFactionBoot();
}