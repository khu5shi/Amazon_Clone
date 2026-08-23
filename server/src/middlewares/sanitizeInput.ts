import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [], // Strip all HTML tags
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

export const sanitizeString = (input: any): any => {
  if (typeof input === 'string') {
    return sanitizeHtml(input.trim(), sanitizeOptions);
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeString);
  }
  if (input !== null && typeof input === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(input)) {
      cleaned[key] = sanitizeString(input[key]);
    }
    return cleaned;
  }
  return input;
};

export const sanitizeInputMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeString(req.body);
  }
  if (req.query) {
    req.query = sanitizeString(req.query);
  }
  if (req.params) {
    req.params = sanitizeString(req.params);
  }
  next();
};
