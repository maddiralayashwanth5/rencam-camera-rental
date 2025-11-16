// Database backup and restore utilities for Rencam Platform
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { dbConfig } from '../config';

const execAsync = promisify(exec);

interface BackupOptions {
  includeData?: boolean;
  compression?: boolean;
  format?: 'sql' | 'custom' | 'tar';
  outputDir?: string;
  filename?: string;
}

interface RestoreOptions {
  dropExisting?: boolean;
  dataOnly?: boolean;
  schemaOnly?: boolean;
  verbose?: boolean;
}

export class DatabaseBackup {
  private config = dbConfig;

  // Create database backup
  async createBackup(options: BackupOptions = {}): Promise<string> {
    const {
      includeData = true,
      compression = true,
      format = 'custom',
      outputDir = './backups',
      filename
    } = options;

    // Ensure backup directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Generate filename if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = filename || `rencam_backup_${timestamp}.${format === 'sql' ? 'sql' : 'backup'}`;
    const backupPath = path.join(outputDir, backupFilename);

    // Build pg_dump command
    const pgDumpArgs = [
      `--host=${this.config.host}`,
      `--port=${this.config.port}`,
      `--username=${this.config.username}`,
      `--dbname=${this.config.database}`,
      `--format=${format}`,
      `--file=${backupPath}`
    ];

    // Add options based on configuration
    if (!includeData) {
      pgDumpArgs.push('--schema-only');
    }

    if (compression && format !== 'sql') {
      pgDumpArgs.push('--compress=9');
    }

    // Add additional options for better backups
    pgDumpArgs.push(
      '--verbose',
      '--no-password',
      '--no-owner',
      '--no-privileges'
    );

    const command = `pg_dump ${pgDumpArgs.join(' ')}`;

    try {
      console.log(`Creating backup: ${backupPath}`);
      const { stdout, stderr } = await execAsync(command, {
        env: { ...process.env, PGPASSWORD: this.config.password }
      });

      if (stderr && !stderr.includes('NOTICE')) {
        console.warn('Backup warnings:', stderr);
      }

      // Verify backup file was created
      const stats = await fs.stat(backupPath);
      if (stats.size === 0) {
        throw new Error('Backup file is empty');
      }

      console.log(`✅ Backup created successfully: ${backupPath} (${this.formatBytes(stats.size)})`);
      return backupPath;

    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  // Restore database from backup
  async restoreBackup(backupPath: string, options: RestoreOptions = {}): Promise<void> {
    const {
      dropExisting = false,
      dataOnly = false,
      schemaOnly = false,
      verbose = true
    } = options;

    // Verify backup file exists
    try {
      await fs.access(backupPath);
    } catch (error) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    // Build pg_restore command
    const pgRestoreArgs = [
      `--host=${this.config.host}`,
      `--port=${this.config.port}`,
      `--username=${this.config.username}`,
      `--dbname=${this.config.database}`,
      backupPath
    ];

    // Add options
    if (dropExisting) {
      pgRestoreArgs.push('--clean', '--if-exists');
    }

    if (dataOnly) {
      pgRestoreArgs.push('--data-only');
    }

    if (schemaOnly) {
      pgRestoreArgs.push('--schema-only');
    }

    if (verbose) {
      pgRestoreArgs.push('--verbose');
    }

    pgRestoreArgs.push('--no-owner', '--no-privileges');

    const command = `pg_restore ${pgRestoreArgs.join(' ')}`;

    try {
      console.log(`Restoring backup: ${backupPath}`);
      const { stdout, stderr } = await execAsync(command, {
        env: { ...process.env, PGPASSWORD: this.config.password }
      });

      if (stderr && !stderr.includes('NOTICE')) {
        console.warn('Restore warnings:', stderr);
      }

      console.log('✅ Database restored successfully');

    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  // List available backups
  async listBackups(backupDir: string = './backups'): Promise<Array<{
    name: string;
    path: string;
    size: number;
    created: Date;
  }>> {
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter(file => 
        file.endsWith('.backup') || file.endsWith('.sql') || file.endsWith('.tar')
      );

      const backups = await Promise.all(
        backupFiles.map(async (file) => {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime
          };
        })
      );

      // Sort by creation date (newest first)
      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());

    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  // Delete old backups (keep specified number of recent backups)
  async cleanupOldBackups(backupDir: string = './backups', keepCount: number = 10): Promise<void> {
    const backups = await this.listBackups(backupDir);
    
    if (backups.length <= keepCount) {
      console.log(`No cleanup needed. Found ${backups.length} backups, keeping ${keepCount}`);
      return;
    }

    const toDelete = backups.slice(keepCount);
    
    for (const backup of toDelete) {
      try {
        await fs.unlink(backup.path);
        console.log(`🗑️  Deleted old backup: ${backup.name}`);
      } catch (error) {
        console.error(`Failed to delete backup ${backup.name}:`, error);
      }
    }

    console.log(`✅ Cleanup completed. Removed ${toDelete.length} old backups`);
  }

  // Create automated backup with cleanup
  async createAutomatedBackup(options: BackupOptions & { keepCount?: number } = {}): Promise<string> {
    const { keepCount = 10, ...backupOptions } = options;
    
    try {
      // Create backup
      const backupPath = await this.createBackup(backupOptions);
      
      // Cleanup old backups
      await this.cleanupOldBackups(backupOptions.outputDir, keepCount);
      
      return backupPath;
      
    } catch (error) {
      console.error('Automated backup failed:', error);
      throw error;
    }
  }

  // Verify backup integrity
  async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      // For custom format backups, use pg_restore --list
      const { stdout } = await execAsync(`pg_restore --list ${backupPath}`, {
        env: { ...process.env, PGPASSWORD: this.config.password }
      });

      // Check if backup contains expected tables
      const expectedTables = [
        'users', 'equipment', 'bookings', 'reviews', 
        'payments', 'categories', 'notifications'
      ];

      const hasAllTables = expectedTables.every(table => 
        stdout.includes(table)
      );

      if (hasAllTables) {
        console.log('✅ Backup verification passed');
        return true;
      } else {
        console.error('❌ Backup verification failed - missing tables');
        return false;
      }

    } catch (error) {
      console.error('❌ Backup verification failed:', error);
      return false;
    }
  }

  // Schedule automated backups
  async scheduleBackups(intervalHours: number = 24, options: BackupOptions = {}): Promise<NodeJS.Timeout> {
    console.log(`📅 Scheduling automated backups every ${intervalHours} hours`);
    
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    const timer = setInterval(async () => {
      try {
        console.log('🔄 Starting scheduled backup...');
        await this.createAutomatedBackup(options);
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    }, intervalMs);

    // Create initial backup
    try {
      await this.createAutomatedBackup(options);
    } catch (error) {
      console.error('Initial backup failed:', error);
    }

    return timer;
  }

  // Utility function to format bytes
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const backupService = new DatabaseBackup();

// CLI utility functions
export async function createBackupCLI(): Promise<void> {
  try {
    const backupPath = await backupService.createBackup({
      includeData: true,
      compression: true,
      format: 'custom'
    });
    
    console.log(`Backup completed: ${backupPath}`);
  } catch (error) {
    console.error('CLI backup failed:', error);
    process.exit(1);
  }
}

export async function restoreBackupCLI(backupPath: string): Promise<void> {
  try {
    await backupService.restoreBackup(backupPath, {
      dropExisting: true,
      verbose: true
    });
    
    console.log('Restore completed successfully');
  } catch (error) {
    console.error('CLI restore failed:', error);
    process.exit(1);
  }
}
