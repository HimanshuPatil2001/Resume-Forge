import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings, AppTheme } from '../models/settings.model';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly SETTINGS_KEY = 'app_settings';

  private defaultSettings: AppSettings = {
    groq: {
      provider: 'groq',
      apiKey: '',
      model: 'openai/gpt-oss-120b',
      temperature: 0.2,
      baseUrl: 'https://api.groq.com/openai/v1'
    },
    theme: 'dark',
    defaultTemplate: 'ats-minimal',
    defaultStyle: 'ATS Friendly',
    defaultLength: '1 Page',
    defaultFocus: 'Balanced'
  };

  private settingsSubject = new BehaviorSubject<AppSettings>(this.loadSettings());
  public settings$: Observable<AppSettings> = this.settingsSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private toastService: ToastService
  ) {
    this.applyTheme(this.settingsSubject.getValue().theme);
  }

  private loadEnvConfig(): Partial<AppSettings['groq']> {
    if (typeof window === 'undefined') return {};
    const env = (window as any).__env || {};
    const config: Partial<AppSettings['groq']> = {};

    if (env.GROQ_API_KEY && !env.GROQ_API_KEY.startsWith('${')) {
      config.apiKey = env.GROQ_API_KEY.trim();
    }
    if (env.GROQ_MODEL && !env.GROQ_MODEL.startsWith('${')) {
      config.model = env.GROQ_MODEL.trim();
    }
    if (env.GROQ_BASE_URL && !env.GROQ_BASE_URL.startsWith('${')) {
      config.baseUrl = env.GROQ_BASE_URL.trim();
    }
    if (env.GROQ_TEMPERATURE && !env.GROQ_TEMPERATURE.startsWith('${') && !isNaN(Number(env.GROQ_TEMPERATURE))) {
      config.temperature = Number(env.GROQ_TEMPERATURE);
    }
    return config;
  }

  public isEnvConfigured(): { apiKey: boolean; model: boolean; baseUrl: boolean } {
    const envConfig = this.loadEnvConfig();
    return {
      apiKey: !!envConfig.apiKey,
      model: !!envConfig.model,
      baseUrl: !!envConfig.baseUrl
    };
  }

  private loadSettings(): AppSettings {
    const envConfig = this.loadEnvConfig();
    const baseGroq = {
      ...this.defaultSettings.groq,
      ...envConfig
    };
    const saved = this.storageService.getItem<AppSettings>(this.SETTINGS_KEY);
    if (saved && saved.groq) {
      const mergedApiKey = saved.groq.apiKey || baseGroq.apiKey;
      return {
        ...this.defaultSettings,
        ...saved,
        groq: {
          ...baseGroq,
          ...saved.groq,
          apiKey: mergedApiKey
        }
      };
    }
    return {
      ...this.defaultSettings,
      groq: baseGroq
    };
  }

  getSettings(): AppSettings {
    return this.settingsSubject.getValue();
  }

  saveSettings(newSettings: AppSettings): boolean {
    const success = this.storageService.setItem(this.SETTINGS_KEY, newSettings);
    if (success) {
      this.settingsSubject.next(newSettings);
      this.applyTheme(newSettings.theme);
      this.toastService.success('Settings Saved', 'Configuration updated successfully.');
      return true;
    } else {
      this.toastService.error('Error', 'Failed to save settings to localStorage.');
      return false;
    }
  }

  toggleTheme(): void {
    const current = this.getSettings();
    const newTheme: AppTheme = current.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...current, theme: newTheme };
    this.saveSettings(updated);
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }
}
