export function getKnowledgeBasePaths(pathname: string) {
  const isEngineer = pathname.startsWith("/engineer/");

  return {
    isEngineer,
    knowledgeRoot: isEngineer ? "/engineer/knowledge" : "/knowledge",
    ticketsRoot: isEngineer ? "/engineer/tickets" : "/tickets",
    articleView: (ticketId: string) =>
      isEngineer ? `/engineer/knowledge/ticket/${ticketId}` : `/knowledge/ticket/${ticketId}`,
    articleEdit: (ticketId: string) =>
      isEngineer ? `/engineer/knowledge/edit/${ticketId}` : `/knowledge/edit/${ticketId}`,
    ticketView: (ticketId: string) =>
      isEngineer ? `/engineer/tickets/${ticketId}` : `/tickets/${ticketId}`,
    knowledgeProject: (project: string) =>
      isEngineer ? "/engineer/knowledge" : `/knowledge/project/${encodeURIComponent(project)}`,
  };
}
