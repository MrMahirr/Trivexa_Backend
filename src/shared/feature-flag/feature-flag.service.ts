import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type FeatureFlag = 'DEMO_MODE';

@Injectable()
export class FeatureFlagService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Check if a specific feature flag is enabled.
   * @param flag The feature flag to check
   */
  isEnabled(flag: FeatureFlag): boolean {
    if (flag === 'DEMO_MODE') {
      const demoMode = this.configService.get<string>('FEATURE_DEMO_MODE');
      return demoMode === 'true' || demoMode === '1';
    }
    return false;
  }
}
