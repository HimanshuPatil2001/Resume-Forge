import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SettingsService } from './settings.service';
import { GroqConfig } from '../models/settings.model';

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GroqService {

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  private getHeaders(config: GroqConfig): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey.trim()}`
    });
  }

  testConnection(config?: GroqConfig): Observable<boolean> {
    const cfg = config || this.settingsService.getSettings().groq;
    if (!cfg.apiKey) {
      return throwError(() => new Error('API Key is missing. Please enter your Groq API key in Settings.'));
    }

    const payload = {
      model: cfg.model || 'openai/gpt-oss-120b',
      messages: [
        { role: 'user', content: 'Respond with "OK" if this connection test is successful.' }
      ],
      max_tokens: 10,
      temperature: 0.1
    };

    const url = `${cfg.baseUrl || 'https://api.groq.com/openai/v1'}/chat/completions`;

    return this.http.post<GroqCompletionResponse>(url, payload, { headers: this.getHeaders(cfg) }).pipe(
      map(res => !!(res && res.choices && res.choices.length > 0)),
      catchError(err => this.handleHttpError(err))
    );
  }

  createChatCompletion(
    messages: GroqChatMessage[],
    customConfig?: GroqConfig
  ): Observable<string> {
    const cfg = customConfig || this.settingsService.getSettings().groq;

    if (!cfg.apiKey) {
      return throwError(() => new Error('Groq API Key is not configured. Please open Settings and add your API key.'));
    }

    const payload = {
      model: cfg.model || 'openai/gpt-oss-120b',
      messages,
      temperature: cfg.temperature ?? 0.2,
      response_format: { type: 'json_object' }
    };

    const url = `${cfg.baseUrl || 'https://api.groq.com/openai/v1'}/chat/completions`;

    return this.http.post<GroqCompletionResponse>(url, payload, { headers: this.getHeaders(cfg) }).pipe(
      map(res => {
        if (!res.choices || res.choices.length === 0) {
          throw new Error('Groq API returned an empty completion response.');
        }
        return res.choices[0].message.content;
      }),
      catchError(err => this.handleHttpError(err))
    );
  }

  private handleHttpError(error: any): Observable<never> {
    let message = 'An unexpected error occurred while calling the Groq API.';

    if (error.status === 401) {
      message = 'Invalid Groq API Key. Please verify your API key in Settings.';
    } else if (error.status === 429) {
      message = 'Groq API rate limit reached or quota exceeded. Please wait a moment and try again.';
    } else if (error.status === 404) {
      message = `Requested Groq model not found or API URL invalid. Check Settings configuration.`;
    } else if (error.status === 0) {
      message = 'Network error: Unable to connect to Groq API. Check your internet connection or CORS settings.';
    } else if (error.error && error.error.error && error.error.error.message) {
      message = `Groq API Error: ${error.error.error.message}`;
    } else if (error.message) {
      message = error.message;
    }

    return throwError(() => new Error(message));
  }
}
