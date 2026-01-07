/**
 * User Service - Business logic for user management.
 */

import type { UserRepository } from "@/repositories";
import type { UserProfile } from "@/types/domain";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export class UserService {
  constructor(private userRepo: UserRepository) {}

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
    // Validate username format
    // Validate username format
    if (!this.isValidUsername(username)) {
      throw new Error("Invalid username format");
    }

    // Check if username is taken
    // Check if username is taken
    const isTaken = await this.userRepo.isUsernameTaken(username, userId);
    if (isTaken) {
      throw new Error("Username is already taken");
    }

    await this.userRepo.updateUsername(userId, username);

    return { success: true, username };
  }

  /**
   * Validate username format.
   */
  isValidUsername(username: string): boolean {
    return USERNAME_REGEX.test(username);
  }
}
