import { IsEnum } from 'class-validator';
import { OnboardingStage } from '../../generated/prisma/enums.js';

export class SetOnboardingStageDto {
  @IsEnum(OnboardingStage)
  onboardingStage!: OnboardingStage;
}
