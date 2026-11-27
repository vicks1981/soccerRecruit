import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function localStateSyncPlugin(): Plugin {
  const dataFilePath = path.resolve(process.cwd(), 'data', 'user-state.json');

  const attachMiddleware = (middlewares: {
    use: (
      route: string,
      fn: (
        req: { method?: string; on: (event: string, cb: (chunk?: unknown) => void) => void },
        res: {
          statusCode: number;
          setHeader: (k: string, v: string) => void;
          end: (body?: string) => void;
        },
        next: () => void
      ) => void
    ) => void;
  }) => {
    middlewares.use('/api/user-state', (req, res, next) => {
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        if (!fs.existsSync(dataFilePath)) {
          res.statusCode = 200;
          res.end(JSON.stringify({ exists: false }));
          return;
        }
        try {
          const raw = fs.readFileSync(dataFilePath, 'utf-8');
          res.statusCode = 200;
          res.end(JSON.stringify({ exists: true, state: JSON.parse(raw) }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += String(chunk);
        });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
            fs.writeFileSync(
              dataFilePath,
              JSON.stringify(
                { ...parsed, updatedAt: new Date().toISOString() },
                null,
                2
              ) + '\n',
              'utf-8'
            );
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true }));
          } catch (err) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
        return;
      }

      next();
    });
  };

  return {
    name: 'local-state-sync-api',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), localStateSyncPlugin()],
  server: {
    host: true,
    port: 5174,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 5174,
    allowedHosts: true,
  },
});
