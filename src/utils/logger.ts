/**
 * Production-ready logging system with multiple levels and persistence
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum LogCategory {
  AUTH = 'AUTH',
  DATABASE = 'DATABASE',
  API = 'API',
  UI = 'UI',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  SYSTEM = 'SYSTEM'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  userId?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private isDevelopment = import.meta.env.DEV;

  private constructor() {
    this.loadLogsFromStorage();
    // Auto-save logs periodically
    setInterval(() => this.saveLogsToStorage(), 30000); // Every 30 seconds
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      category,
      message,
      userId: this.getCurrentUserId(),
      metadata,
      stackTrace: error?.stack
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (e) {
      // Ignore errors
    }
    return undefined;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (this.isDevelopment) {
      this.consoleOutput(entry);
    }

    // Send critical errors to monitoring service (placeholder)
    if (entry.level === LogLevel.CRITICAL || entry.level === LogLevel.ERROR) {
      this.sendToMonitoring(entry);
    }
  }

  private consoleOutput(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.category}]`;
    const message = `${prefix} ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.metadata);
        break;
      case LogLevel.INFO:
        console.info(message, entry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.metadata);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.metadata, entry.stackTrace);
        break;
    }
  }

  private sendToMonitoring(entry: LogEntry): void {
    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    // For now, just store in localStorage for critical errors
    try {
      const criticalLogs = JSON.parse(localStorage.getItem('criticalLogs') || '[]');
      criticalLogs.push(entry);
      // Keep only last 50 critical logs
      localStorage.setItem('criticalLogs', JSON.stringify(criticalLogs.slice(-50)));
    } catch (e) {
      console.error('Failed to store critical log', e);
    }
  }

  private saveLogsToStorage(): void {
    try {
      localStorage.setItem('appLogs', JSON.stringify(this.logs.slice(-100))); // Save last 100 logs
    } catch (e) {
      console.error('Failed to save logs to storage', e);
    }
  }

  private loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem('appLogs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load logs from storage', e);
    }
  }

  // Public logging methods
  debug(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    this.addLog(this.createLogEntry(LogLevel.DEBUG, category, message, metadata));
  }

  info(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    this.addLog(this.createLogEntry(LogLevel.INFO, category, message, metadata));
  }

  warn(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    this.addLog(this.createLogEntry(LogLevel.WARN, category, message, metadata));
  }

  error(category: LogCategory, message: string, error?: Error, metadata?: Record<string, any>): void {
    this.addLog(this.createLogEntry(LogLevel.ERROR, category, message, metadata, error));
  }

  critical(category: LogCategory, message: string, error?: Error, metadata?: Record<string, any>): void {
    this.addLog(this.createLogEntry(LogLevel.CRITICAL, category, message, metadata, error));
  }

  // Utility methods
  getLogs(filter?: { level?: LogLevel; category?: LogCategory; limit?: number }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.category) {
      filtered = filtered.filter(log => log.category === filter.category);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('appLogs');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Performance tracking
  startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(LogCategory.PERFORMANCE, `${label} completed`, { duration: `${duration.toFixed(2)}ms` });
    };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience exports
export const logAuth = (message: string, metadata?: Record<string, any>) => 
  logger.info(LogCategory.AUTH, message, metadata);

export const logError = (message: string, error?: Error, metadata?: Record<string, any>) => 
  logger.error(LogCategory.SYSTEM, message, error, metadata);

export const logDB = (message: string, metadata?: Record<string, any>) => 
  logger.info(LogCategory.DATABASE, message, metadata);

export const logSecurity = (message: string, metadata?: Record<string, any>) => 
  logger.warn(LogCategory.SECURITY, message, metadata);
