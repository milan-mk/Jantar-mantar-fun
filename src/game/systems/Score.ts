/** Energy Boost makes distance worth this much more score. */
const ENERGY_DISTANCE_BONUS = 1.5;

export class ScoreKeeper {
  private distance = 0;
  private distanceScore = 0;
  private itemPoints = 0;
  private bonusPoints = 0;
  items = 0;

  reset(): void {
    this.distance = 0;
    this.distanceScore = 0;
    this.itemPoints = 0;
    this.bonusPoints = 0;
    this.items = 0;
  }

  addDistance(meters: number, energyActive: boolean): void {
    this.distance += meters;
    this.distanceScore += energyActive ? meters * ENERGY_DISTANCE_BONUS : meters;
  }

  addItem(points: number): void {
    this.items += 1;
    this.itemPoints += points;
  }

  addBonus(points: number): void {
    this.bonusPoints += points;
  }

  get distanceMeters(): number {
    return Math.floor(this.distance);
  }

  get score(): number {
    return Math.floor(this.distanceScore) + this.itemPoints + this.bonusPoints;
  }
}
