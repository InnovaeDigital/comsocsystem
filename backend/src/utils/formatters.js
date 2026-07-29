export function dateToMs(value) {
  return value ? new Date(value).getTime() : null;
}

export function mapCategory(row) {
  return {
    key: row.key,
    label: row.label,
    iconName: row.icon_name,
    bg: row.bg,
  };
}

export function mapCategories(rows) {
  return rows.reduce((acc, row) => {
    const category = mapCategory(row);
    acc[category.key] = {
      label: category.label,
      iconName: category.iconName,
      bg: category.bg,
    };
    return acc;
  }, {});
}

export function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    color: row.color,
    role: row.role || 'user',
    isOwner: Boolean(row.is_owner),
    createdBy: row.created_by,
    adminGrantedBy: row.admin_granted_by,
    createdAt: dateToMs(row.created_at),
    updatedAt: dateToMs(row.updated_at),
  };
}

export function mapNote(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    color: row.color,
    category: row.category_key,
    previsao: row.previsao,
    progresso: row.progresso,
    creatorName: row.creator_name,
    creatorEmail: row.creator_email,
    createdBy: row.created_by,
    assignedToUserId: row.assigned_to,
    assignedToName: row.assigned_to_name,
    assignedToColor: row.assigned_to_color,
    lastEditedBy: row.last_edited_by,
    createdAt: dateToMs(row.created_at),
    updatedAt: dateToMs(row.updated_at),
  };
}

export function mapChatMessage(row) {
  return {
    id: row.id,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    senderColor: row.sender_color,
    text: row.text,
    timestamp: dateToMs(row.created_at),
  };
}

export function mapActivity(row) {
  return {
    id: row.id,
    userName: row.user_name,
    userEmail: row.user_email,
    userColor: row.user_color,
    action: row.action,
    timestamp: dateToMs(row.created_at),
  };
}

export function mapPresence(row) {
  return {
    id: row.uid || row.email,
    uid: row.uid,
    name: row.name,
    email: row.email,
    color: row.color,
    lastSeen: dateToMs(row.last_seen),
  };
}
