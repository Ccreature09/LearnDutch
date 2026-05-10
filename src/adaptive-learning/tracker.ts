import { GrammarErrorType, GrammarWeakness } from "../lib/grammar-types";

export type AdaptiveProfile = {
  weaknessByType: GrammarWeakness;
  attempts: number;
};

export class AdaptiveLearningTracker {
  private profile: AdaptiveProfile;

  constructor(initialProfile?: AdaptiveProfile) {
    this.profile = initialProfile ?? { weaknessByType: {}, attempts: 0 };
  }

  recordAttempt(errors: GrammarErrorType[]): AdaptiveProfile {
    this.profile.attempts += 1;
    for (const error of errors) {
      this.profile.weaknessByType[error] = (this.profile.weaknessByType[error] ?? 0) + 1;
    }
    return this.profile;
  }

  setProfile(profile: AdaptiveProfile) {
    this.profile = profile;
  }

  getProfile(): AdaptiveProfile {
    return { ...this.profile, weaknessByType: { ...this.profile.weaknessByType } };
  }
}
