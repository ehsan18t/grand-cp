/**
 * User Service - Business logic for user management.
 */

import { Errors } from "@/lib/errors";
import type { UserRepository } from "@/repositories";
import { isValidUsername, type UserProfile } from "@/types/domain";

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  /**
   * Get a user by username or ID.
   */
  async getUserByUsernameOrId(identifier: string): Promise<UserProfile | null> {
    return this.userRepo.findByUsernameOrId(identifier);
  }

  /**
   * Get a user by ID.
   */
  async getUserById(id: string): Promise<UserProfile | null> {
    return this.userRepo.findById(id);
  }

  /**
   * Get all users with usernames (for sitemap).
   */
  async getAllUsersWithUsernames(): Promise<Array<{ username: string; updatedAt: Date }>> {
    return this.userRepo.findAllWithUsernames();
  }

  /**
   * Update a user's username.
   */
  async updateUsername(
    userId: string,
    username: string,
  ): Promise<{ success: boolean; username: string }> {
    const normalizedUsername = username.trim().toLowerCase();

    // Validate username format
    if (!isValidUsername(normalizedUsername)) {
      throw Errors.badRequest("Invalid username format");
    }

    // Check if username is taken
    const isTaken = await this.userRepo.isUsernameTaken(normalizedUsername, userId);
    if (isTaken) {
      throw Errors.conflict("Username is already taken");
    }

    await this.userRepo.updateUsername(userId, normalizedUsername);

    return { success: true, username: normalizedUsername };
  }
}
