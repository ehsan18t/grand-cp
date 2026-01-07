/**
 * Favorite Service - Business logic for user favorites.
 */

import type { FavoriteRepository, ProblemRepository } from "@/repositories";
import type { FavoriteProblem, FavoriteToggleResult } from "@/types/domain";

export class FavoriteService {
  constructor(
    private favoriteRepo: FavoriteRepository,
    private problemRepo: ProblemRepository,
  ) {}

  /**
   * Get all favorites for a user.
   */
  async getFavorites(userId: string): Promise<FavoriteProblem[]> {
    return this.favoriteRepo.getFavoritesWithDetails(userId);
  }

  /**
   * Get favorites count for a user.
   */
  async getFavoritesCount(userId: string): Promise<number> {
    return this.favoriteRepo.getCountForUser(userId);
  }

  /**
   * Add a problem to favorites.
   */
  async addFavorite(userId: string, problemId: number): Promise<FavoriteToggleResult> {
    // Check if problem exists
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new Error("Problem not found");
    }

    // Check if already favorited
    const isFavorited = await this.favoriteRepo.isFavorited(userId, problemId);
    if (isFavorited) {
      return {
        success: true,
        problemId,
        isFavorite: true,
      };
    }

    await this.favoriteRepo.add(userId, problemId);

    return {
      success: true,
      problemId,
      isFavorite: true,
    };
  }

  /**
   * Remove a problem from favorites.
   */
  async removeFavorite(userId: string, problemId: number): Promise<FavoriteToggleResult> {
    await this.favoriteRepo.remove(userId, problemId);

    return {
      success: true,
      problemId,
      isFavorite: false,
    };
  }
}
