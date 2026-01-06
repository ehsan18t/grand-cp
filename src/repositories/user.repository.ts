/**
 * User Repository - Data access layer for users.
 * Contains pure database queries without business logic.
 */

import { eq, or } from "drizzle-orm";
import type { Database } from "@/db";
import { users } from "@/db/schema";
import type { UserProfile } from "@/types/domain";

export class UserRepository {
  constructor(private db: Database) {}

  /**
   * Find a user by username or ID.
   */
  async findByUsernameOrId(identifier: string): Promise<UserProfile | null> {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(or(eq(users.username, identifier), eq(users.id, identifier)))
      .limit(1);

    return user ?? null;
  }

  /**
   * Find a user by ID.
   */
  async findById(id: string): Promise<UserProfile | null> {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  /**
   * Find a user by username.
   */
  async findByUsername(username: string): Promise<UserProfile | null> {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return user ?? null;
  }

  /**
   * Update a user's username.
   */
  async updateUsername(userId: string, username: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        username,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  /**
   * Check if a username is taken by another user.
   */
  async isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!existing) return false;
    if (excludeUserId && existing.id === excludeUserId) return false;
    return true;
  }
}
