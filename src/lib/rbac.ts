export type Role = "viewer" | "editor" | "publisher";
export const can = {
  edit: (r: Role) => r === "editor" || r === "publisher",
  publish: (r: Role) => r === "publisher",
};
export function getRole(cookieVal?: string): Role {
  return (["viewer","editor","publisher"].includes(cookieVal ?? "") ? cookieVal : "viewer") as Role;
}