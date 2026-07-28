export function inviteWorkspaceMember(workspace: string, member: string) {
  return { workspace, member, status: "invited" };
}
