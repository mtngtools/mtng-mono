import type {
  RecipeBlock,
  RecipeConfig,
  RecipeDayPlan,
  RecipeDefaults,
  RecipeMeeting,
  RecipeRoom,
  RecipeRoomBlock,
  RecipeRoomGroup,
  RecipeRoomLifecycleRule,
  RecipeRuleConfig,
  RecipeVenue,
} from "./recipe-types";

class DayPlanBuilder {
  private readonly blocks: RecipeBlock[] = [];

  constructor(private readonly dayIndex: number) {}

  block(block: RecipeBlock) {
    this.blocks.push(block);
    return this;
  }

  build(): RecipeDayPlan {
    return {
      dayIndex: this.dayIndex,
      blocks: [...this.blocks],
    };
  }
}

export class RecipeBuilder {
  private meetingConfig?: RecipeMeeting;
  private readonly venuesList: RecipeVenue[] = [];
  private readonly roomsList: RecipeRoom[] = [];
  private readonly roomBlocksList: RecipeRoomBlock[] = [];
  private readonly roomGroupsList: RecipeRoomGroup[] = [];
  private readonly roomLifecyclesList: RecipeRoomLifecycleRule[] = [];
  private readonly dayPlansList: RecipeDayPlan[] = [];
  private rulesConfig?: RecipeRuleConfig;
  private defaultsConfig?: RecipeDefaults;

  meeting(meeting: RecipeMeeting) {
    this.meetingConfig = meeting;
    return this;
  }

  venue(venue: RecipeVenue) {
    this.venuesList.push(venue);
    return this;
  }

  room(room: RecipeRoom) {
    this.roomsList.push(room);
    return this;
  }

  roomGroup(group: RecipeRoomGroup) {
    this.roomGroupsList.push(group);
    return this;
  }

  roomBlock(block: RecipeRoomBlock) {
    this.roomBlocksList.push(block);
    return this;
  }

  roomLifecycle(rule: RecipeRoomLifecycleRule) {
    this.roomLifecyclesList.push(rule);
    return this;
  }

  defaults(defaults: RecipeDefaults) {
    this.defaultsConfig = defaults;
    return this;
  }

  ruleConfig(rules: RecipeRuleConfig) {
    this.rulesConfig = rules;
    return this;
  }

  day(dayIndex: number, configure: (day: DayPlanBuilder) => DayPlanBuilder | void) {
    const dayBuilder = new DayPlanBuilder(dayIndex);
    const configured = configure(dayBuilder) ?? dayBuilder;
    this.dayPlansList.push(configured.build());
    return this;
  }

  build(): RecipeConfig {
    if (!this.meetingConfig) {
      throw new Error("RecipeBuilder requires meeting() before build().");
    }
    if (this.venuesList.length === 0) {
      throw new Error("RecipeBuilder requires at least one venue().");
    }
    if (this.roomsList.length === 0) {
      throw new Error("RecipeBuilder requires at least one room().");
    }

    return {
      meeting: this.meetingConfig,
      venues: [...this.venuesList],
      rooms: [...this.roomsList],
      roomGroups: [...this.roomGroupsList],
      roomBlocks: [...this.roomBlocksList],
      roomLifecycles: [...this.roomLifecyclesList],
      dayPlans: [...this.dayPlansList],
      rules: this.rulesConfig,
      defaults: this.defaultsConfig,
    };
  }
}

export const createRecipeBuilder = () => new RecipeBuilder();
