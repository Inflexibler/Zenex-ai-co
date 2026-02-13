import db from './client';
import type { User, DBUser } from '@/types';

export async function createUser(userData: {
  uid: string;
  email: string;
  name: string;
}): Promise<User> {
  try {
    await db.execute({
      sql: `
        INSERT INTO users (uid, email, name, subscription_plan, daily_credits)
        VALUES (?, ?, ?, 'free', 10)
      `,
      args: [userData.uid, userData.email, userData.name],
    });

    return await getUserById(userData.uid);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserById(uid: string): Promise<User> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE uid = ?',
      args: [uid],
    });

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const row = result.rows[0] as any;
    
    return {
      uid: row.uid as string,
      email: row.email as string,
      name: row.name as string,
      subscription_plan: row.subscription_plan as any,
      daily_credits: row.daily_credits as number,
      credits_reset_at: new Date(row.credits_reset_at as string),
      github_repo: row.github_repo as string,
      github_folder: row.github_folder as string,
      created_at: new Date(row.created_at as string),
      updated_at: new Date(row.updated_at as string),
    };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function updateUser(uid: string, updates: Partial<User>): Promise<void> {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'uid') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return;

    values.push(uid);

    await db.execute({
      sql: `
        UPDATE users 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE uid = ?
      `,
      args: values,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function consumeUserCredit(uid: string): Promise<boolean> {
  try {
    const user = await getUserById(uid);
    
    // Check if credits need reset (daily)
    const now = new Date();
    const resetAt = new Date(user.credits_reset_at);
    
    if (now > resetAt) {
      // Reset credits
      const maxCredits = user.subscription_plan === 'free' ? 10 :
                        user.subscription_plan === 'starter' ? 100 :
                        user.subscription_plan === 'pro' ? 500 : 2000;

      await db.execute({
        sql: `
          UPDATE users 
          SET daily_credits = ?, 
              credits_reset_at = datetime('now', '+1 day')
          WHERE uid = ?
        `,
        args: [maxCredits, uid],
      });

      return true;
    }

    // Check if user has credits
    if (user.daily_credits <= 0) {
      return false;
    }

    // Consume credit
    await db.execute({
      sql: 'UPDATE users SET daily_credits = daily_credits - 1 WHERE uid = ?',
      args: [uid],
    });

    return true;
  } catch (error) {
    console.error('Error consuming credit:', error);
    return false;
  }
}
