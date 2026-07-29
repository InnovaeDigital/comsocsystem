import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { query } from './db/sheets.js';
import { asyncHandler } from './http/async-handler.js';
import {
  mapActivity,
  mapCategories,
  mapCategory,
  mapChatMessage,
  mapNote,
  mapPresence,
  mapUser,
} from './utils/formatters.js';
import {
  categoryColorMap,
  clampProgress,
  requireText,
  sanitizeCategoryKey,
} from './utils/sanitize.js';

const VALID_STATUS = new Set(['red', 'yellow', 'blue']);
const DATABASE_CONNECTION_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  '57P01',
  '08006',
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createOriginMatcher(corsOrigin) {
  const patterns = String(corsOrigin || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (patterns.includes('*')) {
    return () => true;
  }

  const regexes = patterns.map((pattern) => {
    const escaped = escapeRegExp(pattern).replace(/\\\*/g, '[^.]+');
    return new RegExp(`^${escaped}$`);
  });

  return (origin) => regexes.some((regex) => regex.test(origin));
}

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function createInternalEmail(name) {
  const base = sanitizeCategoryKey(name || 'operador') || 'operador';
  return `${base}-${randomUUID()}@comsoc.local`;
}

function requireProfile(body) {
  const name = requireText(body.name, 'name', 120);

  return {
    name,
    color: String(body.color || 'bg-blue-700')
      .trim()
      .slice(0, 80),
  };
}

async function listNotes() {
  const result = await query(`
    SELECT
      notes.*,
      assigned_user.name AS assigned_to_name,
      assigned_user.color AS assigned_to_color
    FROM notes
    LEFT JOIN users assigned_user ON assigned_user.id = notes.assigned_to
    ORDER BY notes.created_at DESC
  `);
  return result.rows.map(mapNote);
}

async function listUsers() {
  const result = await query('SELECT * FROM users ORDER BY is_owner DESC, role ASC, name ASC');
  return result.rows.map(mapUser);
}

async function listCategories() {
  const result = await query('SELECT * FROM categories ORDER BY created_at ASC, key ASC');
  return mapCategories(result.rows);
}

async function listPresence() {
  const result = await query('SELECT * FROM presence ORDER BY last_seen DESC');
  return result.rows.map(mapPresence);
}

async function listChatMessages() {
  const result = await query(`
    SELECT * FROM (
      SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50
    ) recent
    ORDER BY created_at ASC
  `);
  return result.rows.map(mapChatMessage);
}

async function listActivities() {
  const result = await query('SELECT * FROM activities ORDER BY created_at DESC LIMIT 15');
  return result.rows.map(mapActivity);
}

async function getRemainingOrders() {
  const result = await query('SELECT remaining_orders FROM settings LIMIT 1');
  return Number(result.rows[0]?.remaining_orders || 0);
}

async function insertActivity({ userName, userEmail, userColor, action }) {
  const result = await query(
    `
      INSERT INTO activities (user_name, user_email, user_color, action)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [userName, userEmail, userColor, action],
  );

  return mapActivity(result.rows[0]);
}

async function findUserByName(name) {
  const normalizedName = normalizeName(name);
  const result = await query(
    `
      SELECT *
      FROM users
      WHERE normalized_name = $1 OR lower(trim(name)) = $1
      ORDER BY is_owner DESC, role ASC, created_at ASC
      LIMIT 1
    `,
    [normalizedName],
  );
  return result.rows[0] || null;
}

async function findUserById(id) {
  if (!id) return null;
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function requireAdmin(actorId) {
  const actor = await findUserById(actorId);
  if (!actor || actor.role !== 'admin') {
    throw httpError('Apenas administradores podem executar esta ação.', 403);
  }
  return actor;
}

function assertCanRemoveAdmin(actor, target) {
  if (target.is_owner) {
    throw httpError('O admin principal não pode perder permissão.', 403);
  }

  if (actor.id === target.id) {
    throw httpError('Um admin não pode remover a própria permissão.', 403);
  }

  if (!actor.is_owner && actor.admin_granted_by && actor.admin_granted_by === target.id) {
    throw httpError('Você não pode remover o admin de quem concedeu seu acesso.', 403);
  }
}

async function assertUniqueUserName(name, ignoredUserId = null) {
  const normalizedName = normalizeName(name);
  const result = await query(
    `
      SELECT id
      FROM users
      WHERE normalized_name = $1
        AND ($2::uuid IS NULL OR id <> $2::uuid)
      LIMIT 1
    `,
    [normalizedName, ignoredUserId],
  );

  if (result.rowCount > 0) {
    throw httpError('Já existe uma conta com esse nome.', 409);
  }
}

export function createApp({ runtimeMiddleware } = {}) {
  const app = express();
  const isAllowedCorsOrigin = createOriginMatcher(config.corsOrigin);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || isAllowedCorsOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
      credentials: true,
    }),
  );
  if (runtimeMiddleware) {
    app.use(runtimeMiddleware);
  }
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'comsoc-backend', timestamp: Date.now() });
  });

  app.post(
    '/api/auth/login',
    asyncHandler(async (req, res) => {
      const profile = requireProfile(req.body);
      let user = await findUserByName(profile.name);

      if (!user) {
        const countResult = await query('SELECT COUNT(*)::int AS total FROM users');
        const isFirstUser = countResult.rows[0].total === 0;

        if (!isFirstUser) {
          throw httpError('Usuário não cadastrado. Solicite acesso ao administrador.', 404);
        }

        const userResult = await query(
          `
            INSERT INTO users (
              name, normalized_name, email, color, role, is_owner
            )
            VALUES ($1, $2, $3, $4, 'admin', true)
            RETURNING *
          `,
          [
            profile.name,
            normalizeName(profile.name),
            createInternalEmail(profile.name),
            profile.color,
          ],
        );
        user = userResult.rows[0];
      }

      await query(
        `
          INSERT INTO presence (email, uid, name, color, last_seen)
          VALUES ($1, $2, $3, $4, now())
          ON CONFLICT (email)
          DO UPDATE SET uid = EXCLUDED.uid, name = EXCLUDED.name, color = EXCLUDED.color, last_seen = now()
        `,
        [user.email, user.id, user.name, user.color],
      );

      res.json({
        user: { uid: user.id, email: user.email, role: user.role },
        profile: mapUser(user),
      });
    }),
  );

  app.get(
    '/api/bootstrap',
    asyncHandler(async (_req, res) => {
      const [notes, categories, presenceList, chatMessages, activities, users] = await Promise.all([
        listNotes(),
        listCategories(),
        listPresence(),
        listChatMessages(),
        listActivities(),
        listUsers(),
      ]);

      res.json({ notes, categories, presenceList, chatMessages, activities, users, remainingOrders: await getRemainingOrders() });
    }),
  );

  app.get(
    '/api/orders/remaining',
    asyncHandler(async (_req, res) => {
      res.json({ remainingOrders: await getRemainingOrders() });
    }),
  );

  app.patch(
    '/api/orders/remaining',
    asyncHandler(async (req, res) => {
      const actor = await requireAdmin(req.body.actorId);
      const nextValue = Number.parseInt(req.body.remainingOrders, 10);

      if (!Number.isFinite(nextValue) || nextValue < 0) {
        throw httpError('Informe um número válido para o contador.', 400);
      }

      await query('UPDATE settings SET remaining_orders = $1', [nextValue]);

      await insertActivity({
        userName: actor.name,
        userEmail: actor.email,
        userColor: actor.color,
        action: `atualizou o contador de pedidos restantes para ${nextValue}`,
      });

      res.json({ remainingOrders: nextValue });
    }),
  );

  app.put(
    '/api/presence',
    asyncHandler(async (req, res) => {
      const profile = requireProfile(req.body);
      const uid = req.body.id || req.body.uid || null;
      const currentUser = uid ? await findUserById(uid) : await findUserByName(profile.name);

      if (!currentUser) {
        throw httpError('Usuário não cadastrado.', 404);
      }

      await query(
        `
          INSERT INTO presence (email, uid, name, color, last_seen)
          VALUES ($1, $2, $3, $4, now())
          ON CONFLICT (email)
          DO UPDATE SET uid = EXCLUDED.uid, name = EXCLUDED.name, color = EXCLUDED.color, last_seen = now()
        `,
        [currentUser.email, currentUser.id, currentUser.name, currentUser.color],
      );

      res.json({ ok: true });
    }),
  );

  app.get(
    '/api/notes',
    asyncHandler(async (_req, res) => {
      res.json({ notes: await listNotes() });
    }),
  );

  app.get(
    '/api/users',
    asyncHandler(async (_req, res) => {
      res.json({ users: await listUsers() });
    }),
  );

  app.post(
    '/api/users',
    asyncHandler(async (req, res) => {
      const actor = await requireAdmin(req.body.actorId);
      const name = requireText(req.body.name, 'name', 120);
      const role = req.body.role === 'admin' ? 'admin' : 'user';
      const color = String(req.body.color || 'bg-blue-700')
        .trim()
        .slice(0, 80);

      await assertUniqueUserName(name);

      const result = await query(
        `
          INSERT INTO users (
            name, normalized_name, email, color, role, is_owner, created_by, admin_granted_by
          )
          VALUES ($1, $2, $3, $4, $5, false, $6, $7)
          RETURNING *
        `,
        [
          name,
          normalizeName(name),
          createInternalEmail(name),
          color,
          role,
          actor.id,
          role === 'admin' ? actor.id : null,
        ],
      );

      await insertActivity({
        userName: actor.name,
        userEmail: actor.email,
        userColor: actor.color,
        action: `criou a conta de ${name}${role === 'admin' ? ' como administrador' : ''}`,
      });

      res.status(201).json({ user: mapUser(result.rows[0]) });
    }),
  );

  app.patch(
    '/api/users/:id',
    asyncHandler(async (req, res) => {
      const actor = await requireAdmin(req.body.actorId);
      const target = await findUserById(req.params.id);

      if (!target) {
        throw httpError('Usuário não encontrado.', 404);
      }

      const fields = [];
      const values = [];
      let index = 1;

      const addField = (sqlName, value) => {
        fields.push(`${sqlName} = $${index}`);
        values.push(value);
        index += 1;
      };

      if (req.body.name !== undefined) {
        const name = requireText(req.body.name, 'name', 120);
        await assertUniqueUserName(name, target.id);
        addField('name', name);
        addField('normalized_name', normalizeName(name));
      }

      if (req.body.color !== undefined) {
        addField(
          'color',
          String(req.body.color || 'bg-blue-700')
            .trim()
            .slice(0, 80),
        );
      }

      if (req.body.role !== undefined) {
        const nextRole = req.body.role === 'admin' ? 'admin' : 'user';

        if (target.role === 'admin' && nextRole === 'user') {
          assertCanRemoveAdmin(actor, target);
          addField('role', 'user');
          addField('admin_granted_by', null);
        } else if (target.role !== 'admin' && nextRole === 'admin') {
          addField('role', 'admin');
          addField('admin_granted_by', actor.id);
        }
      }

      if (fields.length === 0) {
        throw httpError('Nenhum campo enviado para atualização.', 400);
      }

      fields.push('updated_at = now()');
      values.push(req.params.id);

      const result = await query(
        `
          UPDATE users
          SET ${fields.join(', ')}
          WHERE id = $${index}
          RETURNING *
        `,
        values,
      );

      await insertActivity({
        userName: actor.name,
        userEmail: actor.email,
        userColor: actor.color,
        action: `atualizou a conta de ${result.rows[0].name}`,
      });

      res.json({ user: mapUser(result.rows[0]) });
    }),
  );

  app.delete(
    '/api/users/:id',
    asyncHandler(async (req, res) => {
      const actor = await requireAdmin(req.body.actorId);
      const target = await findUserById(req.params.id);

      if (!target) {
        throw httpError('Usuário não encontrado.', 404);
      }

      if (target.is_owner) {
        throw httpError('O admin principal não pode ser excluído.', 403);
      }

      if (actor.id === target.id) {
        throw httpError('Você não pode excluir a própria conta.', 403);
      }

      if (target.role === 'admin') {
        assertCanRemoveAdmin(actor, target);
      }

      await query('DELETE FROM presence WHERE uid = $1 OR email = $2', [target.id, target.email]);
      const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [target.id]);

      await insertActivity({
        userName: actor.name,
        userEmail: actor.email,
        userColor: actor.color,
        action: `excluiu a conta de ${target.name}`,
      });

      res.json({ user: mapUser(result.rows[0]) });
    }),
  );

  app.post(
    '/api/notes',
    asyncHandler(async (req, res) => {
      const actor = await requireAdmin(req.body.actorId);
      const title = requireText(req.body.title, 'title', 240);
      const content = requireText(req.body.content, 'content', 8000);
      const color = VALID_STATUS.has(req.body.color) ? req.body.color : 'yellow';
      const category = sanitizeCategoryKey(req.body.category) || 'design';
      const previsao =
        String(req.body.previsao || 'Sem prazo')
          .trim()
          .slice(0, 120) || 'Sem prazo';
      const progresso = clampProgress(req.body.progresso);
      const creatorName = requireText(req.body.creatorName, 'creatorName', 120);
      const creatorEmail = requireText(req.body.creatorEmail, 'creatorEmail', 180).toLowerCase();
      const assignedUser = req.body.assignedToUserId
        ? await findUserById(req.body.assignedToUserId)
        : null;

      const result = await query(
        `
          INSERT INTO notes (
            title, content, color, category_key, previsao, progresso,
            creator_name, creator_email, created_by, assigned_to
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `,
        [
          title,
          content,
          color,
          category,
          previsao,
          progresso,
          creatorName,
          creatorEmail,
          actor.id,
          assignedUser?.id || null,
        ],
      );

      res.status(201).json({
        note: mapNote({
          ...result.rows[0],
          assigned_to_name: assignedUser?.name || null,
          assigned_to_color: assignedUser?.color || null,
        }),
      });
    }),
  );

  app.patch(
    '/api/notes/:id',
    asyncHandler(async (req, res) => {
      const actor = await findUserById(req.body.actorId);

      if (!actor) {
        throw httpError('Usuário não identificado.', 403);
      }

      const existingResult = await query('SELECT * FROM notes WHERE id = $1', [req.params.id]);

      if (existingResult.rowCount === 0) {
        throw httpError('Missão não encontrada.', 404);
      }

      const existingNote = existingResult.rows[0];
      const isAdmin = actor.role === 'admin';
      const isAssignedUser = existingNote.assigned_to === actor.id;

      if (!isAdmin && !isAssignedUser) {
        throw httpError('Você só pode atualizar tarefas designadas para você.', 403);
      }

      const fields = [];
      const values = [];
      let index = 1;

      const addField = (sqlName, value) => {
        fields.push(`${sqlName} = $${index}`);
        values.push(value);
        index += 1;
      };

      const requireAdminField = () => {
        if (!isAdmin) {
          throw httpError('Apenas administradores podem editar dados principais da tarefa.', 403);
        }
      };

      if (req.body.title !== undefined) {
        requireAdminField();
        addField('title', requireText(req.body.title, 'title', 240));
      }
      if (req.body.content !== undefined) {
        requireAdminField();
        addField('content', requireText(req.body.content, 'content', 8000));
      }
      if (req.body.color !== undefined) {
        addField('color', VALID_STATUS.has(req.body.color) ? req.body.color : 'yellow');
      }
      if (req.body.category !== undefined) {
        requireAdminField();
        addField('category_key', sanitizeCategoryKey(req.body.category) || 'design');
      }
      if (req.body.previsao !== undefined) {
        requireAdminField();
        addField(
          'previsao',
          String(req.body.previsao || 'Imediato')
            .trim()
            .slice(0, 120) || 'Imediato',
        );
      }
      if (req.body.progresso !== undefined)
        addField('progresso', clampProgress(req.body.progresso));
      if (req.body.assignedToUserId !== undefined) {
        requireAdminField();
        const assignedUser = req.body.assignedToUserId
          ? await findUserById(req.body.assignedToUserId)
          : null;

        if (req.body.assignedToUserId && !assignedUser) {
          throw httpError('Responsável não encontrado.', 400);
        }

        addField('assigned_to', assignedUser?.id || null);
      }
      if (req.body.lastEditedBy !== undefined) {
        addField(
          'last_edited_by',
          String(req.body.lastEditedBy || '')
            .trim()
            .slice(0, 120),
        );
      }

      if (fields.length === 0) {
        throw httpError('Nenhum campo enviado para atualização.', 400);
      }

      fields.push('updated_at = now()');
      values.push(req.params.id);

      const result = await query(
        `
          UPDATE notes
          SET ${fields.join(', ')}
          WHERE id = $${index}
          RETURNING *
        `,
        values,
      );

      if (result.rowCount === 0) {
        throw httpError('Missão não encontrada.', 404);
      }

      res.json({ note: mapNote(result.rows[0]) });
    }),
  );

  app.delete(
    '/api/notes/:id',
    asyncHandler(async (req, res) => {
      await requireAdmin(req.body.actorId);
      const result = await query('DELETE FROM notes WHERE id = $1 RETURNING id', [req.params.id]);

      if (result.rowCount === 0) {
        throw httpError('Missão não encontrada.', 404);
      }

      res.status(204).end();
    }),
  );

  app.get(
    '/api/categories',
    asyncHandler(async (_req, res) => {
      res.json({ categories: await listCategories() });
    }),
  );

  app.post(
    '/api/categories',
    asyncHandler(async (req, res) => {
      await requireAdmin(req.body.actorId);
      const label = requireText(req.body.label || req.body.name, 'label', 120);
      const key = sanitizeCategoryKey(req.body.key || label);
      const iconName = String(req.body.iconName || 'Palette')
        .trim()
        .slice(0, 60);
      const bg = categoryColorMap[req.body.colorTheme] || req.body.bg || categoryColorMap.indigo;

      const result = await query(
        `
          INSERT INTO categories (key, label, icon_name, bg)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (key)
          DO UPDATE SET label = EXCLUDED.label, icon_name = EXCLUDED.icon_name, bg = EXCLUDED.bg
          RETURNING *
        `,
        [key, label, iconName, bg],
      );

      res.status(201).json({ category: mapCategory(result.rows[0]) });
    }),
  );

  app.delete(
    '/api/categories/:key',
    asyncHandler(async (req, res) => {
      await requireAdmin(req.body.actorId);
      const key = sanitizeCategoryKey(req.params.key);

      if (['design', 'audiovisual', 'cards'].includes(key)) {
        throw httpError('Categorias padrão não podem ser removidas.', 400);
      }

      const result = await query('DELETE FROM categories WHERE key = $1 RETURNING key', [key]);

      if (result.rowCount === 0) {
        throw httpError('Categoria não encontrada.', 404);
      }

      res.status(204).end();
    }),
  );

  app.patch(
    '/api/categories/:key',
    asyncHandler(async (req, res) => {
      await requireAdmin(req.body.actorId);
      const key = sanitizeCategoryKey(req.params.key);
      const label = requireText(req.body.label || req.body.name, 'label', 120);
      const iconName = String(req.body.iconName || 'Palette')
        .trim()
        .slice(0, 60);
      const bg = categoryColorMap[req.body.colorTheme] || req.body.bg || categoryColorMap.indigo;

      const result = await query(
        `
          UPDATE categories
          SET label = $2, icon_name = $3, bg = $4
          WHERE key = $1
          RETURNING *
        `,
        [key, label, iconName, bg],
      );

      if (result.rowCount === 0) {
        throw httpError('Categoria nÃ£o encontrada.', 404);
      }

      res.json({ category: mapCategory(result.rows[0]) });
    }),
  );

  app.get(
    '/api/chat',
    asyncHandler(async (_req, res) => {
      res.json({ chatMessages: await listChatMessages() });
    }),
  );

  app.post(
    '/api/chat',
    asyncHandler(async (req, res) => {
      const senderName = requireText(req.body.senderName, 'senderName', 120);
      const senderEmail = requireText(req.body.senderEmail, 'senderEmail', 180).toLowerCase();
      const senderColor = String(req.body.senderColor || 'bg-blue-700')
        .trim()
        .slice(0, 80);
      const text = requireText(req.body.text, 'text', 1200);

      const result = await query(
        `
          INSERT INTO chat_messages (sender_name, sender_email, sender_color, text)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `,
        [senderName, senderEmail, senderColor, text],
      );

      res.status(201).json({ message: mapChatMessage(result.rows[0]) });
    }),
  );

  app.get(
    '/api/activities',
    asyncHandler(async (_req, res) => {
      res.json({ activities: await listActivities() });
    }),
  );

  app.post(
    '/api/activities',
    asyncHandler(async (req, res) => {
      const activity = await insertActivity({
        userName: requireText(req.body.userName, 'userName', 120),
        userEmail: requireText(req.body.userEmail, 'userEmail', 180).toLowerCase(),
        userColor: String(req.body.userColor || 'bg-blue-700')
          .trim()
          .slice(0, 80),
        action: requireText(req.body.action, 'action', 1000),
      });

      res.status(201).json({ activity });
    }),
  );

  app.use((req, res) => {
    res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
  });

  app.use((error, _req, res, _next) => {
    const status = error.status || 500;
    console.error(error);
    const databaseConnectionFailed = DATABASE_CONNECTION_ERROR_CODES.has(error.code);

    res.status(status).json({
      error: databaseConnectionFailed
        ? 'Não foi possível conectar ao JSONBin. Verifique sua conexão e tente novamente.'
        : status === 500
          ? 'Erro interno do servidor.'
          : error.message,
    });
  });

  return app;
}
