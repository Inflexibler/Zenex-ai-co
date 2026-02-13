import db from './client';

export async function initializeDatabase() {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        subscription_plan TEXT DEFAULT 'free',
        daily_credits INTEGER DEFAULT 10,
        credits_reset_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        github_repo TEXT,
        github_folder TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        uid TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        site_type TEXT DEFAULT 'custom',
        admin_schema TEXT,
        github_path TEXT,
        preview_url TEXT,
        is_published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
      )
    `);

    // AI generations log
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ai_generations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT NOT NULL,
        project_id TEXT,
        prompt TEXT NOT NULL,
        provider TEXT NOT NULL,
        tokens_used INTEGER,
        success INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
      )
    `);

    // Payments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT NOT NULL,
        session_id TEXT UNIQUE NOT NULL,
        plan TEXT NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        gateway TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
      )
    `);

    // Analytics table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        visitor_ip TEXT,
        user_agent TEXT,
        referrer TEXT,
        visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Indexes for performance
    await db.execute('CREATE INDEX IF NOT EXISTS idx_projects_uid ON projects(uid)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_analytics_project ON analytics(project_id)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_payments_uid ON payments(uid)');

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
