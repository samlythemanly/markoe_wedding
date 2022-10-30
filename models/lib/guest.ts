/**
 * A particular guest associated with an RSVP.
 */
export interface Guest {
  /**
   * The first and last name of the guest.
   */
  name: string;

  /**
   * The meal choice of the guest for dinner.
   */
  mealChoice?: MealChoice;

  /**
   * All of the dietary restrictions this guest has indicated they have.
   */
  dietaryRestrictions?: DietaryRestriction[];

  /**
   * Information detailing a dietary restriction we don't have listed.
   */
  unspecifiedDietaryRestriction?: string;

  /**
   * Whether this guest is a plus-one to another guest.
   */
  isPlusOne: boolean;
}

/**
 * The dinner choice for a particular guest.
 */
export enum MealChoice {
  beef,
  chicken,
  vegan,
  vegetarian,
}

/**
 * Any dietary restriction a guest may have.
 */
export enum DietaryRestriction {
  dairy,
  eggs,
  fish,
  gluten,
  halal,
  kosher,
  lactose,
  nuts,
  other,
  shellfish,
  soy,
  wheat,
}
